import type { SupabaseClient } from "@supabase/supabase-js";
import type { GrowthScoreSnapshot, RankTier } from "@/lib/creator/phase6-types";
import { loadViralitySnapshots } from "@/lib/creator/virality-engine";

function tierFromScore(score: number): RankTier {
  if (score >= 800) return "diamond";
  if (score >= 600) return "gold";
  if (score >= 350) return "silver";
  return "bronze";
}

function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function computeGrowthScore(
  service: SupabaseClient,
  creatorId: string,
): Promise<GrowthScoreSnapshot> {
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const since14 = new Date();
  since14.setDate(since14.getDate() - 14);

  const [earningsRes, eventsRes, insightsRes, virality] = await Promise.all([
    service
      .from("creator_earnings")
      .select("amount_minor, created_at, self_referral, status")
      .eq("creator_id", creatorId)
      .gte("created_at", since30.toISOString()),
    service
      .from("creator_events")
      .select("event_type, created_at")
      .eq("creator_id", creatorId)
      .gte("created_at", since30.toISOString())
      .in("event_type", ["click", "order", "campaign_click", "campaign_order"]),
    service
      .from("creator_insights_daily")
      .select("insight_date, clicks, orders, conversion_rate, earnings_minor")
      .eq("creator_id", creatorId)
      .gte("insight_date", since30.toISOString().slice(0, 10))
      .order("insight_date", { ascending: true }),
    loadViralitySnapshots(service, creatorId),
  ]);

  const earnings = (earningsRes.data ?? []).filter((e) => !e.self_referral && e.status !== "void");
  const events = eventsRes.data ?? [];
  const insights = insightsRes.data ?? [];

  const rev7 = earnings
    .filter((e) => e.created_at >= since7.toISOString())
    .reduce((s, e) => s + Number(e.amount_minor ?? 0), 0);
  const revPrev = earnings
    .filter((e) => e.created_at >= since14.toISOString() && e.created_at < since7.toISOString())
    .reduce((s, e) => s + Number(e.amount_minor ?? 0), 0);
  const revenueGrowthPct = revPrev > 0 ? Math.round(((rev7 - revPrev) / revPrev) * 1000) / 10 : rev7 > 0 ? 100 : 0;

  const clicks7 = events.filter(
    (e) => e.created_at >= since7.toISOString() && String(e.event_type).includes("click"),
  ).length;
  const orders7 = events.filter(
    (e) => e.created_at >= since7.toISOString() && String(e.event_type).includes("order"),
  ).length;
  const clicksPrev = events.filter(
    (e) =>
      e.created_at >= since14.toISOString() &&
      e.created_at < since7.toISOString() &&
      String(e.event_type).includes("click"),
  ).length;
  const ordersPrev = events.filter(
    (e) =>
      e.created_at >= since14.toISOString() &&
      e.created_at < since7.toISOString() &&
      String(e.event_type).includes("order"),
  ).length;

  const ctr7 = clicks7 > 0 ? orders7 / clicks7 : 0;
  const ctrPrev = clicksPrev > 0 ? ordersPrev / clicksPrev : 0;
  const ctrTrendPct = ctrPrev > 0 ? Math.round(((ctr7 - ctrPrev) / ctrPrev) * 1000) / 10 : ctr7 > 0 ? 50 : 0;

  const activeDays = new Set(
    events.map((e) => (e.created_at as string).slice(0, 10)),
  ).size;
  const consistencyDays = Math.min(30, activeDays);

  const maxViral = virality.length ? Math.max(...virality.map((v) => v.viralScore)) : 0;
  const viralityComponent = Math.round(maxViral * 10);

  const revenueComponent = Math.min(400, Math.max(0, revenueGrowthPct * 2));
  const ctrComponent = Math.min(250, Math.max(0, ctrTrendPct * 2.5));
  const consistencyComponent = Math.min(200, consistencyDays * 7);
  const growthScore = Math.min(
    1000,
    Math.round(revenueComponent * 0.4 + ctrComponent * 0.25 + consistencyComponent * 0.2 + viralityComponent * 0.15),
  );

  const weekProgression = insights.slice(-7).map((row) => ({
    week: row.insight_date as string,
    score: Math.round(
      Number(row.clicks ?? 0) * 2 +
        Number(row.orders ?? 0) * 15 +
        Number(row.earnings_minor ?? 0) / 100,
    ),
  }));

  return {
    growthScore,
    rankTier: tierFromScore(growthScore),
    revenueGrowthPct,
    ctrTrendPct,
    consistencyDays,
    viralityComponent,
    weekProgression,
    updatedAt: new Date().toISOString(),
  };
}

export async function persistGrowthScore(
  service: SupabaseClient,
  creatorId: string,
  snapshot: GrowthScoreSnapshot,
): Promise<void> {
  const { error } = await service.from("creator_growth_scores").upsert({
    creator_id: creatorId,
    growth_score: snapshot.growthScore,
    rank_tier: snapshot.rankTier,
    revenue_growth_pct: snapshot.revenueGrowthPct,
    ctr_trend_pct: snapshot.ctrTrendPct,
    consistency_days: snapshot.consistencyDays,
    virality_component: snapshot.viralityComponent,
    week_progression: snapshot.weekProgression,
    updated_at: snapshot.updatedAt,
  });

  if (error && error.code !== "42P01") throw new Error(error.message);
}

export async function loadGrowthScore(
  service: SupabaseClient,
  creatorId: string,
): Promise<GrowthScoreSnapshot | null> {
  const { data, error } = await service
    .from("creator_growth_scores")
    .select(
      "growth_score, rank_tier, revenue_growth_pct, ctr_trend_pct, consistency_days, virality_component, week_progression, updated_at",
    )
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    growthScore: Number(data.growth_score ?? 0),
    rankTier: data.rank_tier as RankTier,
    revenueGrowthPct: Number(data.revenue_growth_pct ?? 0),
    ctrTrendPct: Number(data.ctr_trend_pct ?? 0),
    consistencyDays: Number(data.consistency_days ?? 0),
    viralityComponent: Number(data.virality_component ?? 0),
    weekProgression: (data.week_progression as GrowthScoreSnapshot["weekProgression"]) ?? [],
    updatedAt: data.updated_at as string,
  };
}

export type GrowthJobResult = { creatorsProcessed: number; scoresWritten: number };

export async function runGrowthRecomputeJob(service: SupabaseClient): Promise<GrowthJobResult> {
  const result: GrowthJobResult = { creatorsProcessed: 0, scoresWritten: 0 };
  const weekKey = isoWeekKey();

  const { data: creators, error } = await service.from("creator_profiles").select("user_id");
  if (error) {
    if (error.code === "42P01") return result;
    throw new Error(error.message);
  }

  const leaderboardRows: {
    creator_id: string;
    growth_score: number;
    revenue_minor: number;
    viral_score: number;
    conversion_rate: number;
    badges: string[];
    display_name: string | null;
  }[] = [];

  for (const row of creators ?? []) {
    const creatorId = row.user_id as string;
    result.creatorsProcessed += 1;
    try {
      const snapshot = await computeGrowthScore(service, creatorId);
      await persistGrowthScore(service, creatorId, snapshot);
      result.scoresWritten += 1;

      const virality = await loadViralitySnapshots(service, creatorId);
      const maxViral = virality[0]?.viralScore ?? 0;
      const { data: weekEarnings } = await service
        .from("creator_earnings")
        .select("amount_minor")
        .eq("creator_id", creatorId)
        .eq("self_referral", false)
        .neq("status", "void")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      const revenueMinor = (weekEarnings ?? []).reduce(
        (s, e) => s + Number(e.amount_minor ?? 0),
        0,
      );
      const conversionRate = snapshot.ctrTrendPct;

      const badges: string[] = [];
      if (snapshot.revenueGrowthPct >= 20) badges.push("Rising Star");
      if (maxViral >= 70) badges.push("Viral Creator");
      if (conversionRate >= 5) badges.push("Top Converter");

      const { data: profile } = await service
        .from("creator_profiles")
        .select("display_name, creator_code")
        .eq("user_id", creatorId)
        .maybeSingle();

      leaderboardRows.push({
        creator_id: creatorId,
        growth_score: snapshot.growthScore,
        revenue_minor: revenueMinor,
        viral_score: maxViral,
        conversion_rate: conversionRate,
        badges,
        display_name:
          (profile?.display_name as string) ?? (profile?.creator_code as string) ?? "Creator",
      });
    } catch {
      /* per-creator */
    }
  }

  leaderboardRows.sort((a, b) => b.growth_score - a.growth_score);

  await service.from("creator_leaderboard_weekly").delete().eq("week_key", weekKey);

  const inserts = leaderboardRows.slice(0, 100).map((r, i) => ({
    week_key: weekKey,
    creator_id: r.creator_id,
    growth_score: r.growth_score,
    revenue_minor: r.revenue_minor,
    viral_score: r.viral_score,
    conversion_rate: r.conversion_rate,
    badges: r.badges,
    rank_position: i + 1,
    display_name: r.display_name,
    updated_at: new Date().toISOString(),
  }));

  if (inserts.length) {
    await service.from("creator_leaderboard_weekly").insert(inserts);
  }

  return result;
}

export { isoWeekKey };
