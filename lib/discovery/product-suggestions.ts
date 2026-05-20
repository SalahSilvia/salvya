import { fetchPublishedProductsByArtist } from "@/lib/catalog/fetch-published-products";
import { attachVariantsToProducts } from "@/lib/catalog/attach-variants-to-products";
import { loadProductMetricsMap } from "@/lib/discovery/metrics-store";
import { pickTopRecommendations } from "@/lib/discovery/recommendations";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { marketPriceLabelForProduct } from "@/lib/market/storefront-price";

export type SuggestedShopItem = {
  id: string;
  kind: "hoodie" | "tshirt";
  title: string;
  href: string;
  imageSrc: string;
  priceLabel: string;
};

const PDP_SUGGESTIONS_MAX = 12;

/** Ranked PDP recommendations — same artist, category, price band, trending. */
export async function getSuggestedProductsForPdp(
  artistSlug: string,
  exclude: { kind: "hoodie" | "tshirt"; itemSlug: string },
  max = PDP_SUGGESTIONS_MAX,
): Promise<SuggestedShopItem[]> {
  const [published, market, metricsMap] = await Promise.all([
    fetchPublishedProductsByArtist(artistSlug),
    getMarketContext(),
    loadProductMetricsMap(),
  ]);

  const withVariants = await attachVariantsToProducts(published);
  const anchor = withVariants.find((p) => p.productKind === exclude.kind && p.slug === exclude.itemSlug);
  if (!anchor) return [];

  const candidates = withVariants
    .filter((p) => p.images.length > 0)
    .map((p) => ({ ...p, metrics: metricsMap.get(p.id) ?? null }));

  const picked = pickTopRecommendations(anchor, candidates, max);

  return picked.map((product) => ({
    id: product.id,
    kind: product.productKind,
    title: product.title,
    href: pdpPath(product),
    imageSrc: product.images[0]!,
    priceLabel: marketPriceLabelForProduct(product, market),
  }));
}
