import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import { productIdFromPremiumCard } from "@/lib/member/likes-from-card";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

export function likedArtistSlugSet(items: LikedItemRecord[]): Set<string> {
  return new Set(items.map((i) => i.artistSlug));
}

export function likedProductIdSet(items: LikedItemRecord[]): Set<string> {
  return new Set(items.map((i) => i.productId));
}

/** Boost cards that match liked artists or exact liked products (for home rails). */
export function sortPremiumCardsByTaste(cards: PremiumTrendingCard[], items: LikedItemRecord[]): PremiumTrendingCard[] {
  if (!items.length) return cards;
  const pids = likedProductIdSet(items);
  const artists = likedArtistSlugSet(items);
  return [...cards].sort((a, b) => {
    const score = (c: PremiumTrendingCard) => {
      let s = 0;
      if (pids.has(productIdFromPremiumCard(c))) s += 4;
      if (artists.has(c.artistSlug)) s += 2;
      if (c.kind === "hoodie") s += 0.1;
      return s;
    };
    return score(b) - score(a);
  });
}

export function sortSearchHitsByTaste(
  hits: SearchProductHit[],
  items: LikedItemRecord[],
): SearchProductHit[] {
  if (!items.length) return hits;
  const pids = likedProductIdSet(items);
  const artists = likedArtistSlugSet(items);
  return [...hits].sort((a, b) => {
    const s = (h: SearchProductHit) =>
      (pids.has(h.productId) ? 4 : 0) + (artists.has(h.artistSlug) ? 2 : 0);
    return s(b) - s(a);
  });
}

export function sortArtistsByTaste<T extends { slug: string }>(list: T[], items: LikedItemRecord[]): T[] {
  if (!items.length) return list;
  const artists = likedArtistSlugSet(items);
  return [...list].sort((a, b) => {
    const sa = artists.has(a.slug) ? 1 : 0;
    const sb = artists.has(b.slug) ? 1 : 0;
    return sb - sa;
  });
}

export function firstLikedTitle(items: LikedItemRecord[]): string | null {
  return items[0]?.title ?? null;
}
