/**
 * Feed engine — ordered rails after personalization + discovery (see PremiumHomePage).
 * Extend this list later for influencer / admin promoted slots without rewriting builders.
 */

import type { FeaturedDropCard, PremiumTrendingCard } from "@/lib/home/premium-trending";

/** Commerce + market rails (rendered after “For You” + artists strip). */
export const HOME_COMMERCE_PIPELINE = ["limitedDrops", "trending"] as const;

export type HomeCommerceSectionId = (typeof HOME_COMMERCE_PIPELINE)[number];

export type HomeFeedSnapshot = {
  forYou: PremiumTrendingCard[];
  limitedDrops: FeaturedDropCard[];
  trending: PremiumTrendingCard[];
};

/** Swappable later: e.g. insert `adminPromoted` between limited and trending. */
export function defaultCommerceSectionOrder(snapshot: HomeFeedSnapshot): HomeCommerceSectionId[] {
  const order: HomeCommerceSectionId[] = [];
  if (snapshot.limitedDrops.length > 0) order.push("limitedDrops");
  if (snapshot.trending.length > 0) order.push("trending");
  return order;
}
