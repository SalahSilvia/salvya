import type { SupabaseClient } from "@supabase/supabase-js";
import { FUNNEL_STAGE_KEYS } from "@/lib/analytics/funnel-stages";

export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function fetchEventsSince(
  service: SupabaseClient,
  sinceIso: string,
): Promise<{ session_id: string; event_type: string; product_id: string | null; artist_slug: string | null; created_at: string }[]> {
  const pageSize = 5000;
  let offset = 0;
  const out: { session_id: string; event_type: string; product_id: string | null; artist_slug: string | null; created_at: string }[] = [];
  for (;;) {
    const { data, error } = await service
      .from("analytics_events")
      .select("session_id,event_type,product_id,artist_slug,created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
    if (offset > 50_000) break;
  }
  return out;
}

export async function computeAnalyticsOverview(service: SupabaseClient, days: number) {
  const since = isoDaysAgo(days);
  const events = await fetchEventsSince(service, since);
  const sessionIds = new Set(events.map((e) => e.session_id));
  const byType = new Map<string, number>();
  for (const e of events) {
    byType.set(e.event_type, (byType.get(e.event_type) ?? 0) + 1);
  }

  const { count: sessionsStarted, error: sErr } = await service
    .from("analytics_sessions")
    .select("id", { count: "exact", head: true })
    .gte("started_at", since);
  if (sErr) throw new Error(sErr.message);

  const { data: sessRows, error: durErr } = await service
    .from("analytics_sessions")
    .select("started_at,last_seen_at")
    .gte("started_at", since)
    .limit(8000);
  if (durErr) throw new Error(durErr.message);
  let durSum = 0;
  let durN = 0;
  for (const r of sessRows ?? []) {
    const a = new Date(r.started_at).getTime();
    const b = new Date(r.last_seen_at).getTime();
    const m = (b - a) / 60_000;
    if (Number.isFinite(m) && m >= 0 && m < 24 * 60) {
      durSum += m;
      durN += 1;
    }
  }

  return {
    since,
    visitorsDistinctSessions: sessionIds.size,
    sessionsStarted: sessionsStarted ?? 0,
    totalEvents: events.length,
    eventsByType: Object.fromEntries(byType),
    avgSessionMinutes: durN ? Math.round((durSum / durN) * 10) / 10 : 0,
  };
}

export async function computeLiveUsers(service: SupabaseClient, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count, error } = await service
    .from("analytics_sessions")
    .select("id", { count: "exact", head: true })
    .gte("last_seen_at", since);
  if (error) throw new Error(error.message);
  return { liveUsers: count ?? 0, since };
}

export async function computeTopProducts(service: SupabaseClient, days: number, limit: number) {
  const since = isoDaysAgo(days);
  const events = await fetchEventsSince(service, since);
  const m = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== "product_view" || !e.product_id) continue;
    m.set(e.product_id, (m.get(e.product_id) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([product_id, views]) => ({ product_id, views }));
}

export async function computeTopArtists(service: SupabaseClient, days: number, limit: number) {
  const since = isoDaysAgo(days);
  const events = await fetchEventsSince(service, since);
  const m = new Map<string, number>();
  for (const e of events) {
    if (!e.artist_slug) continue;
    if (
      e.event_type !== "artist_view" &&
      e.event_type !== "artist_profile_view" &&
      e.event_type !== "product_view"
    ) {
      continue;
    }
    m.set(e.artist_slug, (m.get(e.artist_slug) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([artist_slug, score]) => ({ artist_slug, score }));
}

export type TrafficRow = { label: string; sessions: number; pct: number };

function bucketLabel(raw: string | null, fallback: string): string {
  const t = raw?.trim();
  return t && t.length > 0 ? t.slice(0, 80) : fallback;
}

function referrerHost(referrer: string | null): string {
  if (!referrer?.trim()) return "(direct / none)";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "") || "(unknown)";
  } catch {
    return referrer.slice(0, 60);
  }
}

export async function computeTrafficAttribution(service: SupabaseClient, days: number) {
  const since = isoDaysAgo(days);
  const { data, error } = await service
    .from("analytics_sessions")
    .select("utm_source,utm_medium,utm_campaign,referrer")
    .gte("started_at", since)
    .limit(20_000);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const total = rows.length || 1;

  const countBy = (pick: (r: (typeof rows)[0]) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = pick(r);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([label, sessions]) => ({
        label,
        sessions,
        pct: Math.round((sessions / total) * 1000) / 10,
      }));
  };

  return {
    since,
    totalSessions: rows.length,
    bySource: countBy((r) => bucketLabel(r.utm_source, "(direct / none)")),
    byMedium: countBy((r) => bucketLabel(r.utm_medium, "(not set)")),
    byCampaign: countBy((r) => bucketLabel(r.utm_campaign, "(not set)")),
    byReferrer: countBy((r) => referrerHost(r.referrer)),
  };
}

export async function computeConversionFunnel(service: SupabaseClient, days: number) {
  const since = isoDaysAgo(days);
  const events = await fetchEventsSince(service, since);
  const sets = Object.fromEntries(FUNNEL_STAGE_KEYS.map((k) => [k, new Set<string>()])) as Record<
    string,
    Set<string>
  >;
  for (const e of events) {
    const bucket = sets[e.event_type];
    if (bucket) bucket.add(e.session_id);
  }
  const funnel = Object.fromEntries(FUNNEL_STAGE_KEYS.map((k) => [k, sets[k]!.size])) as Record<string, number>;
  return { since, funnel };
}
