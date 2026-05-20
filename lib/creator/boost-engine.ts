import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoostOpportunity } from "@/lib/creator/phase6-types";
import type { GrowthScoreSnapshot } from "@/lib/creator/phase6-types";
import type { ViralitySnapshot } from "@/lib/creator/phase6-types";

const BOOST_TTL_HOURS = 48;

export async function refreshBoostCandidates(
  service: SupabaseClient,
  creatorId: string,
  virality: ViralitySnapshot[],
  growth: GrowthScoreSnapshot | null,
): Promise<number> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + BOOST_TTL_HOURS);

  const growthSurge = (growth?.revenueGrowthPct ?? 0) >= 20;
  const candidates: {
    product_id: string;
    creator_id: string;
    boost_weight: number;
    reason: string;
    badge: string | null;
    expires_at: string;
  }[] = [];

  for (const v of virality) {
    if (!v.productId) continue;
    const shouldBoost = v.viralScore >= 80 || (growthSurge && v.viralScore >= 55);
    if (!shouldBoost) continue;

    const weight = v.viralScore >= 80 ? 1.35 : 1.2;
    candidates.push({
      product_id: v.productId,
      creator_id: creatorId,
      boost_weight: weight,
      reason:
        v.viralScore >= 80
          ? `viral_score_${v.viralScore}`
          : `growth_surge_${growth?.revenueGrowthPct ?? 0}%`,
      badge: v.viralScore >= 80 ? "Trending Creator" : "Rising",
      expires_at: expiresAt.toISOString(),
    });
  }

  if (!candidates.length) return 0;

  await service
    .from("creator_boost_candidates")
    .delete()
    .eq("creator_id", creatorId)
    .gt("expires_at", new Date().toISOString());

  const { error } = await service.from("creator_boost_candidates").insert(candidates);
  if (error && error.code !== "42P01") throw new Error(error.message);
  return candidates.length;
}

export async function loadActiveBoostWeights(
  service: SupabaseClient,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const { data, error } = await service
    .from("creator_boost_candidates")
    .select("product_id, boost_weight")
    .gt("expires_at", new Date().toISOString());

  if (error) {
    if (error.code === "42P01") return map;
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const pid = row.product_id as string;
    const w = Number(row.boost_weight ?? 1);
    map.set(pid, Math.max(map.get(pid) ?? 1, w));
  }
  return map;
}

export async function computeBoostOpportunities(
  service: SupabaseClient,
  creatorId: string,
  virality: ViralitySnapshot[],
): Promise<BoostOpportunity[]> {
  const since24 = new Date();
  since24.setHours(since24.getHours() - 24);
  const since48 = new Date();
  since48.setHours(since48.getHours() - 48);

  const opportunities: BoostOpportunity[] = [];

  for (const v of virality.filter((x) => x.productId)) {
    const { count: recent } = await service
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("product_id", v.productId!)
      .gte("created_at", since24.toISOString())
      .in("event_type", ["click", "campaign_click"]);

    const { count: prior } = await service
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("product_id", v.productId!)
      .gte("created_at", since48.toISOString())
      .lt("created_at", since24.toISOString())
      .in("event_type", ["click", "campaign_click"]);

    const r = recent ?? 0;
    const p = prior ?? 1;
    const changePct = Math.round(((r - p) / p) * 100);

    if (changePct >= 10 || v.viralScore >= 60) {
      const { data: link } = await service
        .from("creator_product_links")
        .select("tracking_code")
        .eq("creator_id", creatorId)
        .eq("product_id", v.productId!)
        .limit(1)
        .maybeSingle();

      opportunities.push({
        productId: v.productId!,
        productTitle: v.productTitle ?? "Product",
        changePct24h: changePct,
        message:
          changePct >= 10
            ? `This product is rising +${changePct}% in the last 24h — re-promote to maximize revenue.`
            : `Momentum building (viral score ${v.viralScore}) — repost during peak window.`,
        trackingCode: (link?.tracking_code as string) ?? undefined,
      });
    }
  }

  return opportunities.slice(0, 5);
}

export async function runBoostRefreshForAllCreators(service: SupabaseClient): Promise<number> {
  const { loadGrowthScore } = await import("@/lib/creator/growth-score");
  const { loadViralitySnapshots } = await import("@/lib/creator/virality-engine");

  const { data: creators } = await service.from("creator_profiles").select("user_id");
  let total = 0;
  for (const row of creators ?? []) {
    const creatorId = row.user_id as string;
    try {
      const [virality, growth] = await Promise.all([
        loadViralitySnapshots(service, creatorId),
        loadGrowthScore(service, creatorId),
      ]);
      total += await refreshBoostCandidates(service, creatorId, virality, growth);
    } catch {
      /* skip */
    }
  }
  return total;
}
