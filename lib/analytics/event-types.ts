/** First-party Salvya analytics event names (stored in `analytics_events.event_type`). */



export const ANALYTICS_EVENT_TYPES = [

  // Core navigation & funnel

  "page_view",

  "product_view",

  "artist_view",

  "search",

  "add_to_cart",

  "begin_checkout",

  "purchase",

  "time_on_page",

  // Commerce funnel

  "remove_from_cart",

  "apply_coupon",

  "shipping_selected",

  "payment_method_selected",

  "checkout_error",

  // Discovery

  "collection_view",

  "artist_profile_view",

  "search_zero_results",

  "recommendation_click",

  // Engagement

  "like",

  "follow_artist",

  "comment",

  "wishlist_add",

  "share_product",

  "notification_signup",

] as const;



export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];



export function isAnalyticsEventType(v: string): v is AnalyticsEventType {

  return (ANALYTICS_EVENT_TYPES as readonly string[]).includes(v);

}


