import { fetchAllPublishedProducts } from "@/lib/catalog/fetch-published-products";
import { getMarketContext } from "@/lib/market/get-market-context";
import { storefrontProductToSearchHit } from "@/lib/member/search-catalog";

const SEARCH_CATALOG_LIMIT = 64;

/** Search index from published Supabase products only. */
export async function buildFullSearchProductHits(dbLimit = SEARCH_CATALOG_LIMIT) {
  const [published, market] = await Promise.all([
    fetchAllPublishedProducts(dbLimit),
    getMarketContext(),
  ]);
  return published
    .filter((p) => p.images.length > 0 && p.title.length > 0)
    .map((p) => storefrontProductToSearchHit(p, market));
}
