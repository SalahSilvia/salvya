import type { EnrichedSearchProductHit } from "@/lib/discovery/build-discovery-catalog";
import type { PersonalizationProfile } from "@/lib/discovery/types";
import type { ArtistCard } from "@/lib/site-data";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import { runRankedSearch, sortProductsByDiscoveryRank, type RankedSearchContext } from "@/lib/search/ranked-search";
import type {
  GroupedSearchResults,
  SearchCollection,
  SearchFilters,
  SearchResult,
  TrendBlock,
  ArtistSearchHit,
  ProductSearchHit,
  CollectionSearchHit,
  TrendSearchHit,
} from "@/lib/search/types";

export type UnifiedSearchContext = {
  artists: ArtistCard[];
  products: EnrichedSearchProductHit[];
  collections: SearchCollection[];
  trends: TrendBlock[];
  likedProductIds: Set<string>;
  personalization?: PersonalizationProfile | null;
  artistBySlug: Map<string, ArtistCard>;
};

function toRankedCtx(ctx: UnifiedSearchContext): RankedSearchContext {
  return {
    artists: ctx.artists,
    products: ctx.products,
    collections: ctx.collections,
    trends: ctx.trends,
    personalization: ctx.personalization,
    artistBySlug: ctx.artistBySlug,
  };
}

/** Ranked discovery search (replaces static filter-only behavior). */
export function runUnifiedSearch(
  query: string,
  filters: SearchFilters,
  ctx: UnifiedSearchContext,
): GroupedSearchResults {
  return runRankedSearch(query, filters, toRankedCtx(ctx));
}

export { sortProductsByDiscoveryRank };
