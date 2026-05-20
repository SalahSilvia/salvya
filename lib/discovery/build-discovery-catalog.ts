import { attachVariantsToProducts } from "@/lib/catalog/attach-variants-to-products";
import { fetchAllPublishedProducts } from "@/lib/catalog/fetch-published-products";
import { getMarketContext } from "@/lib/market/get-market-context";
import {
  storefrontProductToSearchHit,
  type SearchProductHit,
} from "@/lib/member/search-catalog";
import { loadProductMetricsMap } from "@/lib/discovery/metrics-store";
import type { ProductMetrics } from "@/lib/discovery/types";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";

export type EnrichedSearchProductHit = SearchProductHit & {
  rankMeta: {
    dbProductId: string;
    category: string;
    priceCents: number;
    inStock: boolean;
    publishedAt: string | null;
    metrics: ProductMetrics | null;
  };
};

function publishedAtFromProduct(p: StorefrontProductWithVariants): string | null {
  return p.publishedAt ?? null;
}

export async function buildDiscoveryProductHits(limit = 64): Promise<EnrichedSearchProductHit[]> {
  const [published, market, metricsMap] = await Promise.all([
    fetchAllPublishedProducts(limit),
    getMarketContext(),
    loadProductMetricsMap(),
  ]);

  const withVariants = await attachVariantsToProducts(published);

  return withVariants
    .filter((p) => p.images.length > 0 && p.title.length > 0)
    .map((p) => {
      const base = storefrontProductToSearchHit(p, market);
      const stock = p.variants.length
        ? p.variants.some((v) => v.stock > 0)
        : p.stock > 0;
      return {
        ...base,
        rankMeta: {
          dbProductId: p.id,
          category: p.category,
          priceCents: p.priceCents,
          inStock: stock && !p.soldOut,
          publishedAt: publishedAtFromProduct(p),
          metrics: metricsMap.get(p.id) ?? null,
        },
      };
    });
}

export type ProductWithDiscoveryMetrics = StorefrontProductWithVariants & {
  metrics: ProductMetrics | null;
};

export async function loadPublishedProductsForDiscovery(limit = 80): Promise<{
  products: ProductWithDiscoveryMetrics[];
  metricsMap: Map<string, ProductMetrics>;
}> {
  const [published, metricsMap] = await Promise.all([
    fetchAllPublishedProducts(limit),
    loadProductMetricsMap(),
  ]);
  const products = await attachVariantsToProducts(published);
  return {
    products: products.map((p) => ({
      ...p,
      metrics: metricsMap.get(p.id) ?? null,
    })),
    metricsMap,
  };
}
