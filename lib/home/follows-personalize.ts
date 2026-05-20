import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";

export function followedArtistSlugSet(follows: ArtistFollowRecord[]): Set<string> {
  return new Set(follows.map((f) => f.slug));
}

export function firstFollowedArtistName(follows: ArtistFollowRecord[]): string | null {
  return follows[0]?.name ?? null;
}

/** Boost cards from followed artists (home rails). */
export function sortPremiumCardsByFollows(
  cards: PremiumTrendingCard[],
  follows: ArtistFollowRecord[],
): PremiumTrendingCard[] {
  if (!follows.length) return cards;
  const slugs = followedArtistSlugSet(follows);
  return [...cards].sort((a, b) => {
    const score = (c: PremiumTrendingCard) => (slugs.has(c.artistSlug) ? 2 : 0);
    return score(b) - score(a);
  });
}

export function sortArtistsByFollows<T extends { slug: string }>(
  list: T[],
  follows: ArtistFollowRecord[],
): T[] {
  if (!follows.length) return list;
  const slugs = followedArtistSlugSet(follows);
  return [...list].sort((a, b) => {
    const sa = slugs.has(a.slug) ? 1 : 0;
    const sb = slugs.has(b.slug) ? 1 : 0;
    return sb - sa;
  });
}

/** Follows first, then taste (likes) within each tier. */
export function sortPremiumCardsByFollowsAndTaste(
  cards: PremiumTrendingCard[],
  follows: ArtistFollowRecord[],
  tasteBoost: (cards: PremiumTrendingCard[]) => PremiumTrendingCard[],
): PremiumTrendingCard[] {
  if (!follows.length) return tasteBoost(cards);
  const boosted = sortPremiumCardsByFollows(cards, follows);
  return tasteBoost(boosted);
}
