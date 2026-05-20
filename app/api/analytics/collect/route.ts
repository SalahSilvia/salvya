import { NextResponse, type NextRequest } from "next/server";
import { isAnalyticsEventType } from "@/lib/analytics/event-types";
import { allowAnalyticsRequest, getClientIp } from "@/lib/analytics/collect-rate-limit";
import { mergeAnalyticsSession } from "@/lib/analytics/ingest-session";
import { forwardSetCookiesFrom } from "@/lib/http/forward-set-cookie";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

const MAX_EVENTS = 40;
const MAX_META_BYTES = 12_000;

function json(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

function safeStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function safeMeta(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  try {
    const s = JSON.stringify(v);
    if (s.length > MAX_META_BYTES) return { _truncated: true };
    return v as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Browsers or devtools may probe with GET — avoid noisy 405 in logs. */
export function GET() {
  return json({ ok: true, message: "Use POST to send analytics events." }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!allowAnalyticsRequest(`collect:${ip}`, 180, 60_000)) {
    return json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const sessionId = safeStr(b.sessionId, 80);
  if (!sessionId || sessionId.length < 8 || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    return json({ ok: false, error: "invalid_session" }, { status: 400 });
  }

  const eventsRaw = b.events;
  if (!Array.isArray(eventsRaw) || eventsRaw.length === 0 || eventsRaw.length > MAX_EVENTS) {
    return json({ ok: false, error: "invalid_events" }, { status: 400 });
  }

  const authCarrier = NextResponse.next();
  let userId: string | null = null;
  const env = getSsrEnv();
  if (env) {
    try {
      const supabase = createServerSupabase(request, authCarrier);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* guest */
    }
  }

  const ua = request.headers.get("user-agent")?.slice(0, 2000) ?? null;
  const refHeader = request.headers.get("referer")?.slice(0, 2000) ?? null;
  const utm = (b.utm && typeof b.utm === "object" ? b.utm : {}) as Record<string, unknown>;

  try {
    await mergeAnalyticsSession(service, {
      sessionId,
      userId,
      userAgent: ua,
      referrer: safeStr(utm.referrer, 2000) ?? refHeader,
      utm_source: safeStr(utm.utm_source, 512),
      utm_campaign: safeStr(utm.utm_campaign, 512),
      utm_medium: safeStr(utm.utm_medium, 512),
    });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "session_upsert_failed" }, { status: 500 });
  }

  const rows: {
    session_id: string;
    user_id: string | null;
    event_type: string;
    page: string;
    product_id: string | null;
    artist_slug: string | null;
    metadata: Record<string, unknown>;
  }[] = [];

  for (const raw of eventsRaw) {
    if (!raw || typeof raw !== "object") continue;
    const ev = raw as Record<string, unknown>;
    const eventType = safeStr(ev.event_type, 64);
    const page = safeStr(ev.page, 2000);
    if (!eventType || !page || !isAnalyticsEventType(eventType)) continue;
    rows.push({
      session_id: sessionId,
      user_id: userId,
      event_type: eventType,
      page,
      product_id: safeStr(ev.product_id, 512),
      artist_slug: safeStr(ev.artist_slug, 256),
      metadata: safeMeta(ev.metadata),
    });
  }

  if (!rows.length) {
    return json({ ok: false, error: "no_valid_events" }, { status: 400 });
  }

  const { error } = await service.from("analytics_events").insert(rows);
  if (error) {
    return json({ ok: false, error: error.message }, { status: 500 });
  }

  const out = NextResponse.json(
    { ok: true, accepted: rows.length },
    { status: 200, headers: { "Cache-Control": "private, no-store" } },
  );
  forwardSetCookiesFrom(authCarrier, out);
  return out;
}
