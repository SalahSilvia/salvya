import type { SupabaseClient } from "@supabase/supabase-js";

export type CreatorRealtimeMetrics = {
  totalClicks: number;
  totalOrders: number;
  totalViews: number;
  clicksToday: number;
  ordersToday: number;
  revenueTodayMinor: number;
  conversionRate: number;
  topProductId: string | null;
  topTrackingCode: string | null;
  updatedAt: string | null;
};

const EMPTY: CreatorRealtimeMetrics = {
  totalClicks: 0,
  totalOrders: 0,
  totalViews: 0,
  clicksToday: 0,
  ordersToday: 0,
  revenueTodayMinor: 0,
  conversionRate: 0,
  topProductId: null,
  topTrackingCode: null,
  updatedAt: null,
};

export async function getCreatorRealtimeMetrics(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorRealtimeMetrics | null> {
  const { data, error } = await service
    .from("creator_metrics_realtime")
    .select(
      "total_clicks, total_orders, total_views, clicks_today, orders_today, revenue_today_minor, conversion_rate, top_product_id, top_tracking_code, updated_at",
    )
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("creator_metrics_realtime")) return null;
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    totalClicks: Number(data.total_clicks ?? 0),
    totalOrders: Number(data.total_orders ?? 0),
    totalViews: Number(data.total_views ?? 0),
    clicksToday: Number(data.clicks_today ?? 0),
    ordersToday: Number(data.orders_today ?? 0),
    revenueTodayMinor: Number(data.revenue_today_minor ?? 0),
    conversionRate: Number(data.conversion_rate ?? 0),
    topProductId: (data.top_product_id as string | null) ?? null,
    topTrackingCode: (data.top_tracking_code as string | null) ?? null,
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}

export function realtimeMetricsToTotals(metrics: CreatorRealtimeMetrics) {
  return {
    total_clicks: metrics.totalClicks,
    total_orders: metrics.totalOrders,
    total_views: metrics.totalViews,
    conversion_rate: metrics.conversionRate,
  };
}
