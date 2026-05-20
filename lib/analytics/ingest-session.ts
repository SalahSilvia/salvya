import type { SupabaseClient } from "@supabase/supabase-js";

type SessionRow = {
  session_id: string;
  user_id: string | null;
  started_at: string;
  last_seen_at: string;
  user_agent: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
};

/**
 * Merge-first-touch attribution + merge authenticated `user_id` onto the session row.
 */
export async function mergeAnalyticsSession(
  service: SupabaseClient,
  params: {
    sessionId: string;
    userId: string | null;
    userAgent: string | null;
    referrer: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;
    utm_medium?: string | null;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const { data: existing } = await service
    .from("analytics_sessions")
    .select("session_id,user_id,started_at,last_seen_at,user_agent,referrer,utm_source,utm_campaign,utm_medium")
    .eq("session_id", params.sessionId)
    .maybeSingle<SessionRow>();

  const row: SessionRow = {
    session_id: params.sessionId,
    user_id: params.userId ?? existing?.user_id ?? null,
    started_at: existing?.started_at ?? now,
    last_seen_at: now,
    user_agent: existing?.user_agent ?? params.userAgent,
    referrer: existing?.referrer ?? params.referrer,
    utm_source: existing?.utm_source ?? params.utm_source ?? null,
    utm_campaign: existing?.utm_campaign ?? params.utm_campaign ?? null,
    utm_medium: existing?.utm_medium ?? params.utm_medium ?? null,
  };

  const { error } = await service.from("analytics_sessions").upsert(row, { onConflict: "session_id" });
  if (error) throw new Error(error.message);
}
