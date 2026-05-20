import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry, RankTier } from "@/lib/creator/phase6-types";
import { isoWeekKey } from "@/lib/creator/growth-score";
import { loadGrowthScore } from "@/lib/creator/growth-score";

export async function getWeeklyLeaderboard(
  service: SupabaseClient,
  weekKey?: string,
  limit = 50,
): Promise<{ weekKey: string; entries: LeaderboardEntry[] }> {
  const key = weekKey ?? isoWeekKey();

  const { data, error } = await service
    .from("creator_leaderboard_weekly")
    .select(
      "rank_position, creator_id, growth_score, revenue_minor, viral_score, conversion_rate, badges, display_name",
    )
    .eq("week_key", key)
    .order("rank_position", { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return { weekKey: key, entries: [] };
    throw new Error(error.message);
  }

  const entries: LeaderboardEntry[] = (data ?? []).map((row) => ({
    rank: Number(row.rank_position ?? 0),
    creatorId: row.creator_id as string,
    displayName: (row.display_name as string) ?? "Creator",
    growthScore: Number(row.growth_score ?? 0),
    revenueMinor: Number(row.revenue_minor ?? 0),
    viralScore: Number(row.viral_score ?? 0),
    conversionRate: Number(row.conversion_rate ?? 0),
    rankTier: tierFromGrowthScore(Number(row.growth_score ?? 0)),
    badges: Array.isArray(row.badges) ? (row.badges as string[]) : [],
  }));

  return { weekKey: key, entries };
}

function tierFromGrowthScore(score: number): RankTier {
  if (score >= 800) return "diamond";
  if (score >= 600) return "gold";
  if (score >= 350) return "silver";
  return "bronze";
}

export async function getLeaderboardContextForCreator(
  service: SupabaseClient,
  creatorId: string,
): Promise<{ weekKey: string; myRank: number | null; myEntry: LeaderboardEntry | null }> {
  const weekKey = isoWeekKey();
  const { entries } = await getWeeklyLeaderboard(service, weekKey, 100);
  const mine = entries.find((e) => e.creatorId === creatorId) ?? null;

  if (mine) {
    return { weekKey, myRank: mine.rank, myEntry: mine };
  }

  const growth = await loadGrowthScore(service, creatorId);
  if (!growth) return { weekKey, myRank: null, myEntry: null };

  return {
    weekKey,
    myRank: null,
    myEntry: {
      rank: 0,
      creatorId,
      displayName: "You",
      growthScore: growth.growthScore,
      revenueMinor: 0,
      viralScore: growth.viralityComponent / 10,
      conversionRate: growth.ctrTrendPct,
      rankTier: growth.rankTier,
      badges: [],
    },
  };
}
