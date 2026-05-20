import type { SupabaseClient } from "@supabase/supabase-js";

export type CreatorRiskInsights = {
  suspiciousCreators: {
    creatorId: string;
    flagCount: number;
    highSeverityCount: number;
    lastReason: string | null;
  }[];
  recentFlags: {
    id: string;
    creatorId: string;
    reason: string;
    severity: string;
    autoBlocked: boolean;
    createdAt: string;
  }[];
  blockedEarningsMinor: number;
  ctrAnomalies: { creatorId: string; clicks: number; orders: number }[];
};

export async function getCreatorRiskInsights(service: SupabaseClient): Promise<CreatorRiskInsights> {
  const empty: CreatorRiskInsights = {
    suspiciousCreators: [],
    recentFlags: [],
    blockedEarningsMinor: 0,
    ctrAnomalies: [],
  };

  const { data: flags, error: flagsErr } = await service
    .from("creator_fraud_flags")
    .select("id, creator_id, reason, severity, auto_blocked, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (flagsErr) {
    if (flagsErr.code === "42P01") return empty;
    throw new Error(flagsErr.message);
  }

  const creatorMap = new Map<
    string,
    { flagCount: number; highSeverityCount: number; lastReason: string | null }
  >();

  for (const f of flags ?? []) {
    const cid = f.creator_id as string;
    const cur = creatorMap.get(cid) ?? { flagCount: 0, highSeverityCount: 0, lastReason: null };
    cur.flagCount += 1;
    if (f.severity === "high") cur.highSeverityCount += 1;
    if (!cur.lastReason) cur.lastReason = f.reason as string;
    creatorMap.set(cid, cur);
  }

  const suspiciousCreators = [...creatorMap.entries()]
    .map(([creatorId, v]) => ({ creatorId, ...v }))
    .filter((c) => c.highSeverityCount > 0 || c.flagCount >= 3)
    .sort((a, b) => b.highSeverityCount - a.highSeverityCount)
    .slice(0, 20);

  const { data: blocked } = await service
    .from("creator_earnings")
    .select("amount_minor")
    .in("fraud_status", ["suspicious", "void"])
    .in("status", ["pending", "available"]);

  const blockedEarningsMinor = (blocked ?? []).reduce(
    (s, r) => s + (typeof r.amount_minor === "number" ? r.amount_minor : 0),
    0,
  );

  const { data: metrics } = await service
    .from("creator_metrics_realtime")
    .select("creator_id, total_clicks, total_orders, conversion_rate")
    .gt("total_clicks", 30)
    .order("total_clicks", { ascending: false })
    .limit(30);

  const ctrAnomalies = (metrics ?? [])
    .filter((m) => {
      const clicks = Number(m.total_clicks ?? 0);
      const orders = Number(m.total_orders ?? 0);
      return clicks > 40 && orders === 0;
    })
    .map((m) => ({
      creatorId: m.creator_id as string,
      clicks: Number(m.total_clicks ?? 0),
      orders: Number(m.total_orders ?? 0),
    }))
    .slice(0, 15);

  return {
    suspiciousCreators,
    recentFlags: (flags ?? []).slice(0, 40).map((f) => ({
      id: f.id as string,
      creatorId: f.creator_id as string,
      reason: f.reason as string,
      severity: f.severity as string,
      autoBlocked: Boolean(f.auto_blocked),
      createdAt: f.created_at as string,
    })),
    blockedEarningsMinor,
    ctrAnomalies,
  };
}
