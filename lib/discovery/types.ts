/** Precomputed row from `product_metrics`. */
export type ProductMetrics = {
  productId: string;
  views24h: number;
  views7d: number;
  sales24h: number;
  sales7d: number;
  cartAdds: number;
  conversionRate: number;
  trendingScore: number;
  popularityScore: number;
  metricsUpdatedAt: string;
};

export type ProductMetricsRow = {
  product_id: string;
  views_24h: number;
  views_7d: number;
  sales_24h: number;
  sales_7d: number;
  cart_adds: number;
  conversion_rate: number;
  trending_score: number;
  popularity_score: number;
  metrics_updated_at: string;
};

export function rowToProductMetrics(row: ProductMetricsRow): ProductMetrics {
  return {
    productId: row.product_id,
    views24h: row.views_24h ?? 0,
    views7d: row.views_7d ?? 0,
    sales24h: row.sales_24h ?? 0,
    sales7d: row.sales_7d ?? 0,
    cartAdds: row.cart_adds ?? 0,
    conversionRate: Number(row.conversion_rate) || 0,
    trendingScore: Number(row.trending_score) || 0,
    popularityScore: Number(row.popularity_score) || 0,
    metricsUpdatedAt: row.metrics_updated_at,
  };
}

export type PersonalizationProfile = {
  likedProductIds: Set<string>;
  likedArtistSlugs: Set<string>;
  viewedProductIds: Set<string>;
  viewedArtistSlugs: Set<string>;
  purchasedArtistSlugs: Set<string>;
  purchasedCategories: Set<string>;
};

export type RankedProductInput = {
  query: string;
  title: string;
  artistSlug: string;
  artistLabel: string;
  category: string;
  priceCents: number;
  inStock: boolean;
  publishedAt: string | null;
  productId: string;
  likedProductId: string;
  metrics?: ProductMetrics | null;
};
