import { NextResponse, type NextRequest } from "next/server";
import { allowAnalyticsRequest, getClientIp } from "@/lib/analytics/collect-rate-limit";
import { mergeAnalyticsSession } from "@/lib/analytics/ingest-session";
import { forwardSetCookiesFrom } from "@/lib/http/forward-set-cookie";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

function json(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!allowAnalyticsRequest(`hb:${ip}`, 240, 60_000)) {
    return json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const service = createServiceSupabase();
  if (!service) return json({ ok: false, error: "not_configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const sid =
    body &&
    typeof body === "object" &&
    typeof (body as { sessionId?: unknown }).sessionId === "string" &&
    (body as { sessionId: string }).sessionId.trim().length >= 8
      ? (body as { sessionId: string }).sessionId.trim().slice(0, 80)
      : null;
  if (!sid || !/^[a-zA-Z0-9_-]+$/.test(sid)) {
    return json({ ok: false, error: "invalid_session" }, { status: 400 });
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

  try {
    await mergeAnalyticsSession(service, {
      sessionId: sid,
      userId,
      userAgent: ua,
      referrer: refHeader,
    });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "session_upsert_failed" }, { status: 500 });
  }

  const out = NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  forwardSetCookiesFrom(authCarrier, out);
  return out;
}
