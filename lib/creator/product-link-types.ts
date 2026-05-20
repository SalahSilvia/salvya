import type { StorefrontProduct } from "@/lib/catalog/storefront-product";

export type CreatorProductLinkRow = {
  id: string;
  creator_id: string;
  product_id: string;
  creator_code: string;
  tracking_code: string;
  slug: string;
  clicks_count: number;
  orders_count: number;
  created_at: string;
};

export type CreatorProductLinkWithProduct = CreatorProductLinkRow & {
  product: StorefrontProduct | null;
  shareUrl: string;
};

export type CreatorLinkStats = {
  promotedCount: number;
  activeLinks: number;
  totalClicks: number;
  totalOrders: number;
  /** Percentage 0–100 (orders / clicks). */
  conversionRate: number;
  topProduct: {
    title: string;
    clicks: number;
    trackingCode: string;
    productId: string;
  } | null;
  recentLinks: CreatorProductLinkWithProduct[];
};

export type AdminCreatorPromoInsights = {
  topProducts: { productId: string; title: string; linkCount: number; clicks: number }[];
  topCreators: { creatorId: string; creatorCode: string; linkCount: number; clicks: number }[];
};

/** URL segment: `artistSlug__productSlug` */
export function encodeCreatorProductSlug(artistSlug: string, productSlug: string): string {
  return `${artistSlug.trim().toLowerCase()}__${productSlug.trim().toLowerCase()}`;
}

export function decodeCreatorProductSlug(segment: string): { artistSlug: string; productSlug: string } | null {
  const idx = segment.indexOf("__");
  if (idx <= 0) return null;
  const artistSlug = segment.slice(0, idx).trim();
  const productSlug = segment.slice(idx + 2).trim();
  if (!artistSlug || !productSlug) return null;
  return { artistSlug, productSlug };
}
