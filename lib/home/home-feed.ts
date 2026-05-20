import { defaultCommerceSectionOrder, type HomeCommerceSectionId } from "@/lib/home/feed-engine";
import { followedArtistSlugSet } from "@/lib/home/follows-personalize";
import type { FeaturedDropCard, PremiumTrendingCard } from "@/lib/home/premium-trending";
import { FEATURED_DROPS } from "@/lib/home/premium-trending";
import { productIdFromPremiumCard } from "@/lib/member/likes-from-card";
import { likedArtistSlugSet, likedProductIdSet } from "@/lib/member/likes-personalize";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

export type HomeFeedPlan = {
  heroBackdrop: string | null;
  heroSubtitle: string;
  heroPrimaryHref: string;
  heroPrimaryLabel: string;
  forYou: PremiumTrendingCard[];
  limitedDrops: FeaturedDropCard[];
  trending: PremiumTrendingCard[];
  commerceSections: HomeCommerceSectionId[];
};

export type BuildHomeFeedInput = {
  catalog: PremiumTrendingCard[];
  follows: ArtistFollowRecord[];
  likes: LikedItemRecord[];
  bagQty: number;
  isSignedIn: boolean;
};

const FOR_YOU_MAX = 8;
const TRENDING_MAX = 14;

/** 0–1 position in catalog for tiebreaks (first item ≈ 1). */
function catalogGlobalScore(catalogLen: number, index: number): number {
  if (catalogLen <= 1) return 1;
  return (catalogLen - index) / (catalogLen - 1);
}

/**
 * For You = follows (70%) + likes similarity (20%) + catalog tiebreak (10%).
 * Only includes products tied to followed artists or saved taste (liked product / artist).
 */
function forYouScore(
  card: PremiumTrendingCard,
  index: number,
  catalogLen: number,
  followSlugs: Set<string>,
  likedProducts: Set<string>,
  likedArtists: Set<string>,
): number {
  const follow = followSlugs.has(card.artistSlug) ? 1 : 0;
  const likedProduct = likedProducts.has(productIdFromPremiumCard(card)) ? 1 : 0;
  const likedArtist = likedArtists.has(card.artistSlug) ? 1 : 0;
  const likeTier = Math.max(likedProduct, likedArtist);
  const global = catalogGlobalScore(catalogLen, index);
  return 7 * follow + 2 * likeTier + 1 * global;
}

function isPersonalizedCandidate(
  card: PremiumTrendingCard,
  followSlugs: Set<string>,
  likedProducts: Set<string>,
  likedArtists: Set<string>,
): boolean {
  return (
    followSlugs.has(card.artistSlug) ||
    likedProducts.has(productIdFromPremiumCard(card)) ||
    likedArtists.has(card.artistSlug)
  );
}

/** Global “market” ranking only — not personalization. */
function globalPopularityScore(card: PremiumTrendingCard, index: number, catalogLen: number): number {
  const badge =
    card.badge === "limited" ? 4 : card.badge === "new" ? 2.5 : 0;
  const pos = catalogGlobalScore(catalogLen, index);
  return badge + pos;
}

function takeUnique(
  pool: PremiumTrendingCard[],
  count: number,
  used: Set<string>,
): PremiumTrendingCard[] {
  const out: PremiumTrendingCard[] = [];
  for (const card of pool) {
    if (used.has(card.id)) continue;
    out.push(card);
    used.add(card.id);
    if (out.length >= count) break;
  }
  return out;
}

function activeLimitedDrops(): FeaturedDropCard[] {
  return FEATURED_DROPS.filter((d) => d.label === "LIMITED DROP");
}

function buildHeroSubtitle(
  input: BuildHomeFeedInput,
  personalizedTop: PremiumTrendingCard | null,
): string {
  const { follows, likes, bagQty, isSignedIn } = input;
  if (bagQty > 0) {
    return `${bagQty} ${bagQty === 1 ? "piece" : "pieces"} in your bag — checkout when you're ready.`;
  }
  if (personalizedTop) {
    if (follows.length > 0) {
      const more = follows.length > 1 ? ` and ${follows.length - 1} more you follow` : "";
      return `Your feed leads with ${personalizedTop.artistLabel}${more}.`;
    }
    if (likes.length > 0) {
      return `Your feed reflects what you saved — starting with ${personalizedTop.artistLabel}.`;
    }
  }
  if (isSignedIn) {
    return "Follow artists and save pieces to unlock a personalized shelf.";
  }
  return "Official artist merch — discover drops, then make the home feed yours.";
}

export function buildHomeFeed(input: BuildHomeFeedInput): HomeFeedPlan {
  const followSlugs = followedArtistSlugSet(input.follows);
  const likedProducts = likedProductIdSet(input.likes);
  const likedArtists = likedArtistSlugSet(input.likes);

  const catalogLen = input.catalog.length;
  const indexed = input.catalog.map((card, index) => ({ card, index }));

  const personalizedPool = indexed
    .filter(({ card }) =>
      isPersonalizedCandidate(card, followSlugs, likedProducts, likedArtists),
    )
    .sort((a, b) => {
      const sa = forYouScore(a.card, a.index, catalogLen, followSlugs, likedProducts, likedArtists);
      const sb = forYouScore(b.card, b.index, catalogLen, followSlugs, likedProducts, likedArtists);
      return sb - sa;
    })
    .map(({ card }) => card);

  const used = new Set<string>();

  const forYou = takeUnique(personalizedPool, FOR_YOU_MAX, used);

  const trendingPool = [...indexed]
    .sort((a, b) => {
      const pa = globalPopularityScore(a.card, a.index, catalogLen);
      const pb = globalPopularityScore(b.card, b.index, catalogLen);
      return pb - pa;
    })
    .map(({ card }) => card);

  const trending = takeUnique(trendingPool, TRENDING_MAX, used);

  const limitedDrops = activeLimitedDrops();

  const personalizedTop = forYou[0] ?? null;
  const heroBackdrop =
    personalizedTop?.imageSrc ?? trending[0]?.imageSrc ?? input.catalog[0]?.imageSrc ?? null;

  let heroPrimaryHref = "/search";
  let heroPrimaryLabel = "Search";
  if (input.bagQty > 0) {
    heroPrimaryHref = "/preview-bag";
    heroPrimaryLabel = `Bag · ${input.bagQty}`;
  } else if (personalizedTop) {
    heroPrimaryHref = personalizedTop.href;
    heroPrimaryLabel = "Your top pick";
  } else if (trending[0]) {
    heroPrimaryHref = trending[0].href;
    heroPrimaryLabel = "Shop trending";
  } else if (limitedDrops[0]) {
    heroPrimaryHref = limitedDrops[0].href;
    heroPrimaryLabel = "View drops";
  }

  const commerceSections = defaultCommerceSectionOrder({ forYou, limitedDrops, trending });

  return {
    heroBackdrop,
    heroSubtitle: buildHeroSubtitle(input, personalizedTop),
    heroPrimaryHref,
    heroPrimaryLabel,
    forYou,
    limitedDrops,
    trending,
    commerceSections,
  };
}
