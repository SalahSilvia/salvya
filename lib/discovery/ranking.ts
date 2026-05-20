import type { PersonalizationProfile, ProductMetrics, RankedProductInput } from "@/lib/discovery/types";
import { textMatchScore } from "@/lib/discovery/fuzzy";

export const DISCOVERY_RANK_WEIGHTS = {
  textMatch: 0.4,
  popularity: 0.25,
  trending: 0.15,
  stock: 0.1,
  recency: 0.1,
} as const;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function popularityNorm(metrics: ProductMetrics | null | undefined): number {
  if (!metrics) return 0;
  if (metrics.popularityScore > 0) return clamp01(metrics.popularityScore / 100);
  const raw = metrics.views7d * 0.3 + metrics.sales7d * 8 + metrics.conversionRate * 40;
  return clamp01(raw / 120);
}

function trendingNorm(metrics: ProductMetrics | null | undefined): number {
  if (!metrics) return 0;
  if (metrics.trendingScore > 0) return clamp01(metrics.trendingScore / 100);
  const raw = metrics.sales24h * 3 + metrics.cartAdds * 2 + metrics.views24h;
  return clamp01(raw / 80);
}

function recencyNorm(publishedAt: string | null): number {
  if (!publishedAt) return 0.3;
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const days = ageMs / (24 * 60 * 60 * 1000);
  if (days <= 3) return 1;
  if (days <= 14) return 0.85;
  if (days <= 45) return 0.6;
  if (days <= 120) return 0.35;
  return 0.15;
}

/** Personalization multiplier (1.0 = none). Caps ~1.7 composite boost. */
export function personalizationMultiplier(
  input: RankedProductInput,
  profile: PersonalizationProfile | null | undefined,
): number {
  if (!profile) return 1;
  let boost = 0;
  if (profile.likedProductIds.has(input.likedProductId)) boost += 0.25;
  if (profile.likedArtistSlugs.has(input.artistSlug)) boost += 0.2;
  if (profile.viewedProductIds.has(input.productId)) boost += 0.1;
  if (profile.viewedArtistSlugs.has(input.artistSlug)) boost += 0.05;
  if (profile.purchasedArtistSlugs.has(input.artistSlug)) boost += 0.2;
  if (profile.purchasedCategories.has(input.category)) boost += 0.15;
  return 1 + Math.min(boost, 0.7);
}

export function computeTrendingScore(metrics: {
  sales24h: number;
  cartAdds: number;
  views24h: number;
}): number {
  return metrics.sales24h * 3 + metrics.cartAdds * 2 + metrics.views24h;
}

export function computePopularityScore(metrics: {
  views7d: number;
  sales7d: number;
  conversionRate: number;
}): number {
  return Math.min(100, metrics.views7d * 0.5 + metrics.sales7d * 10 + metrics.conversionRate * 50);
}

/** Final discovery rank 0–100+ (personalization applied after weighted sum). */
export function rankProductScore(
  input: RankedProductInput,
  profile?: PersonalizationProfile | null,
  organicBoostMultiplier = 1,
): number {
  const text = textMatchScore(input.query, input.title, input.artistLabel, input.artistSlug) / 100;
  const pop = popularityNorm(input.metrics);
  const trend = trendingNorm(input.metrics);
  const stock = input.inStock ? 1 : 0;
  const recency = recencyNorm(input.publishedAt);

  const base =
    text * DISCOVERY_RANK_WEIGHTS.textMatch +
    pop * DISCOVERY_RANK_WEIGHTS.popularity +
    trend * DISCOVERY_RANK_WEIGHTS.trending +
    stock * DISCOVERY_RANK_WEIGHTS.stock +
    recency * DISCOVERY_RANK_WEIGHTS.recency;

  const emptyQueryBoost = !input.query.trim() ? trend * 0.08 + pop * 0.05 : 0;

  const boost = organicBoostMultiplier > 1 ? Math.min(organicBoostMultiplier, 1.5) : 1;
  return (base + emptyQueryBoost) * 100 * personalizationMultiplier(input, profile) * boost;
}

export function compareRanked<T extends { rankScore: number }>(a: T, b: T): number {
  return b.rankScore - a.rankScore;
}
