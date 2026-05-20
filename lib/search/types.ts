import type { ArtistCard } from "@/lib/site-data";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import type { TrendingEditorialCard, DiscoverCategoryTile } from "@/lib/member/search-discovery";

/** Editorial / culture surface in results & default rail */
export type TrendBlock = TrendingEditorialCard;

/** Discovery tile elevated to a searchable collection */
export type SearchCollection = {
  id: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
};

export type SearchFilters = {
  category: "all" | "artists" | "products" | "drops";
  availability: "all" | "in_stock" | "limited";
  popularity: "all" | "trending";
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  category: "all",
  availability: "all",
  popularity: "all",
};

export type SearchResult =
  | { type: "artist"; data: ArtistCard; score: number }
  | { type: "product"; data: SearchProductHit; score: number }
  | { type: "collection"; data: SearchCollection; score: number }
  | { type: "trend"; data: TrendBlock; score: number };

export type ArtistSearchHit = Extract<SearchResult, { type: "artist" }>;
export type ProductSearchHit = Extract<SearchResult, { type: "product" }>;
export type CollectionSearchHit = Extract<SearchResult, { type: "collection" }>;
export type TrendSearchHit = Extract<SearchResult, { type: "trend" }>;

export type GroupedSearchResults = {
  artists: ArtistSearchHit[];
  products: ProductSearchHit[];
  collections: CollectionSearchHit[];
  trends: TrendSearchHit[];
};

export function discoverTilesToCollections(tiles: DiscoverCategoryTile[]): SearchCollection[] {
  return tiles.map((t) => ({
    id: t.id,
    title: t.label,
    description: "Browse this lane on Salvya.",
    href: t.href,
    gradient: t.gradient,
  }));
}
