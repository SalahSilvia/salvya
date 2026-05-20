import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import type { ProductMetrics } from "@/lib/discovery/types";

export type RecommendationCandidate = StorefrontProductWithVariants & {
  metrics?: ProductMetrics | null;
};

export type ScoredRecommendation = {
  product: RecommendationCandidate;
  score: number;
};

function priceSimilarity(aCents: number, bCents: number): number {
  if (aCents <= 0 || bCents <= 0) return 0.5;
  const ratio = Math.min(aCents, bCents) / Math.max(aCents, bCents);
  return ratio;
}

/** Lightweight PDP recommendations v1. */
export function scoreRecommendations(
  anchor: StorefrontProductWithVariants,
  candidates: RecommendationCandidate[],
  opts?: { coPurchaseProductIds?: Set<string> },
): ScoredRecommendation[] {
  const anchorCents = anchor.priceCents;
  const anchorCat = anchor.category;
  const anchorArtist = anchor.artistSlug;

  const scored = candidates
    .filter((c) => c.id !== anchor.id)
    .map((c) => {
      let score = 0;
      if (c.artistSlug === anchorArtist) score += 45;
      if (c.category === anchorCat) score += 25;
      score += priceSimilarity(anchorCents, c.priceCents) * 20;
      if (opts?.coPurchaseProductIds?.has(c.id)) score += 30;
      const trend = c.metrics?.trendingScore ?? 0;
      score += Math.min(15, trend / 8);
      if (!c.soldOut && c.stock > 0) score += 5;
      return { product: c, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function pickTopRecommendations(
  anchor: StorefrontProductWithVariants,
  candidates: RecommendationCandidate[],
  max = 12,
  opts?: { coPurchaseProductIds?: Set<string> },
): StorefrontProductWithVariants[] {
  return scoreRecommendations(anchor, candidates, opts)
    .slice(0, max)
    .map((s) => s.product);
}
