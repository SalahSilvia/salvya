/** Admin funnel stage labels grouped for the analytics dashboard. */

export type FunnelStageGroup = "core" | "commerce" | "discovery" | "engagement";

export type FunnelStageDef = {
  key: string;
  label: string;
  group: FunnelStageGroup;
};

export const FUNNEL_STAGE_DEFINITIONS: FunnelStageDef[] = [
  { key: "page_view", label: "Sessions with page view", group: "core" },
  { key: "product_view", label: "Product viewed", group: "core" },
  { key: "add_to_cart", label: "Add to cart", group: "core" },
  { key: "remove_from_cart", label: "Remove from cart", group: "commerce" },
  { key: "begin_checkout", label: "Checkout started", group: "core" },
  { key: "shipping_selected", label: "Shipping selected", group: "commerce" },
  { key: "payment_method_selected", label: "Payment method selected", group: "commerce" },
  { key: "apply_coupon", label: "Coupon applied", group: "commerce" },
  { key: "purchase", label: "Purchase", group: "core" },
  { key: "checkout_error", label: "Checkout error (session)", group: "commerce" },
  { key: "collection_view", label: "Collection viewed", group: "discovery" },
  { key: "artist_profile_view", label: "Artist profile viewed", group: "discovery" },
  { key: "search_zero_results", label: "Search with zero results", group: "discovery" },
  { key: "recommendation_click", label: "Recommendation click", group: "discovery" },
  { key: "wishlist_add", label: "Wishlist add", group: "engagement" },
  { key: "share_product", label: "Product shared", group: "engagement" },
  { key: "notification_signup", label: "Restock notification signup", group: "engagement" },
];

export const FUNNEL_STAGE_KEYS = FUNNEL_STAGE_DEFINITIONS.map((s) => s.key);

export type FunnelCounts = Record<string, number>;

export function funnelCountsFromApi(funnel: FunnelCounts | undefined) {
  const f = funnel ?? {};
  return FUNNEL_STAGE_DEFINITIONS.map((def) => ({
    ...def,
    count: f[def.key] ?? 0,
  }));
}
