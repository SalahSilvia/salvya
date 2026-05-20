import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorGrowthIntelligence } from "@/lib/creator/phase6-types";
import { generateContentStrategy } from "@/lib/creator/content-ai-strategy";
import { computeBoostOpportunities } from "@/lib/creator/boost-engine";
import { computeGrowthScore, loadGrowthScore } from "@/lib/creator/growth-score";
import { buildPersonalizedCreatorFeed } from "@/lib/creator/personalized-feed";
import {
  computeViralityForCreator,
  loadViralitySnapshots,
} from "@/lib/creator/virality-engine";
import type { ViralStage, ViralityPrediction } from "@/lib/creator/phase6-types";

export async function getCreatorGrowthIntelligence(
  service: SupabaseClient,
  creatorId: string,
  opts: { refresh?: boolean } = {},
): Promise<CreatorGrowthIntelligence> {
  let virality = opts.refresh
    ? await computeViralityForCreator(service, creatorId)
    : await loadViralitySnapshots(service, creatorId);

  if (!virality.length) {
    virality = await computeViralityForCreator(service, creatorId);
  }

  const top = virality[0];
  const overallScore = Math.max(...virality.map((v) => v.viralScore), 0);
  const stage: ViralStage = top?.viralStage ?? "cold";
  const prediction: ViralityPrediction = top?.prediction ?? {
    expectedPeakTime: null,
    expectedRevenueMultiplier: 1,
  };

  let growth = await loadGrowthScore(service, creatorId);
  if (!growth || opts.refresh) {
    growth = await computeGrowthScore(service, creatorId);
  }

  const contentStrategy = await generateContentStrategy(service, creatorId, virality);
  const [boostOpportunities, personalizedFeed] = await Promise.all([
    computeBoostOpportunities(service, creatorId, virality),
    buildPersonalizedCreatorFeed(service, creatorId, contentStrategy, virality),
  ]);

  return {
    virality: {
      overallScore,
      stage,
      prediction,
      topProducts: virality.slice(0, 5),
    },
    growth,
    contentStrategy,
    boostOpportunities,
    personalizedFeed,
  };
}
