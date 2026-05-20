/**
 * Future: TikTok Pixel, Google Analytics 4, Meta Conversion API, etc.
 * Register providers here and invoke from a thin orchestrator when added.
 */

export type AnalyticsProviderId = "meta_pixel" | "tiktok_pixel" | "google_analytics" | "meta_capi";

export type PageContext = {
  path: string;
  search: string;
};
