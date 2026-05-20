import type { SupabaseClient } from "@supabase/supabase-js";
import { getCreatorEarningsBalances } from "@/lib/creator/earnings-service";
import { getCreatorRealtimeMetrics } from "@/lib/creator/metrics-realtime";
import { listCreatorCampaigns } from "@/lib/creator/campaign-service";
import type {
  CreatorAnalyticsPayload,
  CreatorDashboardStats,
  CreatorLinkPerformanceRow,
  CreatorRecentActivityItem,
} from "@/lib/creator/monetization-types";

function isMissingMonetization(message: string): boolean {
  return (
    message.includes("creator_events") ||
    message.includes("creator_earnings") ||
    message.includes("does not exist") ||
    message.includes("get_creator_")
  );
}

type EventTotalsRow = { total_clicks: number; total_orders: number; total_views: number; conversion_rate: number };

async function fetchEventTotals(service: SupabaseClient, creatorId: string): Promise<EventTotalsRow> {
  const realtime = await getCreatorRealtimeMetrics(service, creatorId);
  if (realtime) {
    return {
      total_clicks: realtime.totalClicks,
      total_orders: realtime.totalOrders,
      total_views: realtime.totalViews,
      conversion_rate: realtime.conversionRate,
    };
  }

  const { data, error } = await service.rpc("get_creator_event_totals", {
    p_creator_id: creatorId,
  });

  if (error) {
    if (error.code === "42P01" || isMissingMonetization(error.message)) {
      return { total_clicks: 0, total_orders: 0, total_views: 0, conversion_rate: 0 };
    }
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { total_clicks: 0, total_orders: 0, total_views: 0, conversion_rate: 0 };
  const totalClicks = Number(row.total_clicks ?? 0);
  const totalOrders = Number(row.total_orders ?? 0);
  return {
    total_clicks: totalClicks,
    total_orders: totalOrders,
    total_views: Number(row.total_views ?? 0),
    conversion_rate: totalClicks > 0 ? Math.round((totalOrders / totalClicks) * 1000) / 10 : 0,
  };
}

type TopProductRow = { product_id: string; tracking_code: string | null; clicks: number };

async function fetchTopProduct(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorDashboardStats["topProduct"]> {
  const realtime = await getCreatorRealtimeMetrics(service, creatorId);
  if (realtime?.topProductId) {
    const { data: product } = await service
      .from("salvya_products")
      .select("title")
      .eq("id", realtime.topProductId)
      .maybeSingle();
    return {
      title: (product?.title as string) ?? "Product",
      clicks: realtime.totalClicks,
      trackingCode: realtime.topTrackingCode ?? "",
      productId: realtime.topProductId,
    };
  }

  const { data, error } = await service.rpc("get_creator_top_product_by_clicks", {
    p_creator_id: creatorId,
  });

  if (error) {
    if (error.code === "42P01" || isMissingMonetization(error.message)) return null;
    throw new Error(error.message);
  }

  const row = (Array.isArray(data) ? data[0] : data) as TopProductRow | undefined;
  if (!row?.product_id) return null;

  const { data: product } = await service
    .from("salvya_products")
    .select("title")
    .eq("id", row.product_id)
    .maybeSingle();

  return {
    title: (product?.title as string) ?? "Product",
    clicks: Number(row.clicks ?? 0),
    trackingCode: row.tracking_code ?? "",
    productId: row.product_id,
  };
}

async function fetchRecentActivity(
  service: SupabaseClient,
  creatorId: string,
  limit = 8,
): Promise<CreatorRecentActivityItem[]> {
  const { data, error } = await service
    .from("creator_events")
    .select(
      "id, event_type, tracking_code, product_id, order_id, created_at, salvya_products(title)",
    )
    .eq("creator_id", creatorId)
    .in("event_type", ["click", "order"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || isMissingMonetization(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const productJoin = row.salvya_products as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(productJoin) ? productJoin[0]?.title : productJoin?.title;
    return {
      id: row.id as string,
      eventType: row.event_type as "click" | "order",
      trackingCode: (row.tracking_code as string | null) ?? "",
      productTitle: title ?? "Product",
      productId: (row.product_id as string | null) ?? null,
      orderId: (row.order_id as string | null) ?? null,
      createdAt: row.created_at as string,
    };
  });
}

export async function getCreatorDashboardStats(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorDashboardStats> {
  const [totals, earnings, realtime, activeLinksRes, topProduct, recentActivity] = await Promise.all([
    fetchEventTotals(service, creatorId),
    getCreatorEarningsBalances(service, creatorId),
    getCreatorRealtimeMetrics(service, creatorId),
    service
      .from("creator_product_links")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId),
    fetchTopProduct(service, creatorId),
    fetchRecentActivity(service, creatorId),
  ]);

  if (activeLinksRes.error && activeLinksRes.error.code !== "42P01") {
    throw new Error(activeLinksRes.error.message);
  }

  const activeLinks = activeLinksRes.count ?? 0;
  const conversionRate =
    totals.conversion_rate > 0
      ? totals.conversion_rate
      : totals.total_clicks > 0
        ? Math.round((totals.total_orders / totals.total_clicks) * 1000) / 10
        : 0;

  return {
    promotedCount: activeLinks,
    activeLinks,
    totalClicks: totals.total_clicks,
    totalOrders: totals.total_orders,
    totalViews: totals.total_views,
    conversionRate,
    today: {
      clicks: realtime?.clicksToday ?? 0,
      orders: realtime?.ordersToday ?? 0,
      revenueMinor: realtime?.revenueTodayMinor ?? 0,
    },
    earnings: {
      totalMinor: earnings.totalMinor,
      pendingMinor: earnings.pendingMinor,
      availableMinor: earnings.availableMinor,
      paidMinor: earnings.paidMinor,
      voidMinor: earnings.voidMinor,
      currency: earnings.currency,
    },
    topProduct,
    recentActivity,
  };
}

async function fetchHourHeatmap(
  service: SupabaseClient,
  creatorId: string,
  campaignId?: string | null,
): Promise<{ hour: number; clicks: number; orders: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  let query = service
    .from("creator_events")
    .select("event_type, created_at, metadata")
    .eq("creator_id", creatorId)
    .gte("created_at", since.toISOString())
    .in("event_type", ["click", "order", "campaign_click", "campaign_order"]);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01" || isMissingMonetization(error.message)) {
      return Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, orders: 0 }));
    }
    throw new Error(error.message);
  }

  const heatmap = Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, orders: 0 }));
  for (const ev of data ?? []) {
    if (campaignId) {
      const meta = ev.metadata as Record<string, unknown> | null;
      const metaCampaign = meta?.campaign_id ?? meta?.campaignId;
      if (metaCampaign !== campaignId) continue;
    }
    const hour = new Date(ev.created_at as string).getUTCHours();
    const bucket = heatmap[hour];
    if (!bucket) continue;
    const type = ev.event_type as string;
    if (type === "click" || type === "campaign_click") bucket.clicks += 1;
    if (type === "order" || type === "campaign_order") bucket.orders += 1;
  }
  return heatmap;
}

export async function getCreatorAnalyticsPayload(
  service: SupabaseClient,
  creatorId: string,
  opts?: { campaignId?: string | null },
): Promise<CreatorAnalyticsPayload> {
  const [totals, earnings, realtime, perfRes, hourHeatmap, campaigns] = await Promise.all([
    fetchEventTotals(service, creatorId),
    getCreatorEarningsBalances(service, creatorId),
    getCreatorRealtimeMetrics(service, creatorId),
    service.rpc("get_creator_link_performance", { p_creator_id: creatorId }),
    fetchHourHeatmap(service, creatorId, opts?.campaignId),
    listCreatorCampaigns(service, creatorId),
  ]);

  if (perfRes.error) {
    if (perfRes.error.code === "42P01" || isMissingMonetization(perfRes.error.message)) {
      return {
        totalClicks: totals.total_clicks,
        totalOrders: totals.total_orders,
        conversionRate:
          totals.total_clicks > 0
            ? Math.round((totals.total_orders / totals.total_clicks) * 1000) / 10
            : 0,
        totalRevenueMinor: earnings.availableMinor + earnings.pendingMinor,
        currency: earnings.currency,
        today: {
          clicks: realtime?.clicksToday ?? 0,
          orders: realtime?.ordersToday ?? 0,
          revenueMinor: realtime?.revenueTodayMinor ?? 0,
        },
        links: [],
        hourHeatmap,
        campaigns: campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          totalClicks: c.totalClicks,
          totalOrders: c.totalOrders,
          revenueMinor: c.revenueMinor,
        })),
        selectedCampaignId: opts?.campaignId ?? null,
      };
    }
    throw new Error(perfRes.error.message);
  }

  const links: CreatorLinkPerformanceRow[] = (perfRes.data ?? []).map(
    (row: Record<string, unknown>) => {
      const clicks = Number(row.clicks ?? 0);
      const orders = Number(row.orders ?? 0);
      return {
        linkId: String(row.link_id ?? ""),
        trackingCode: String(row.tracking_code ?? ""),
        productId: String(row.product_id ?? ""),
        productTitle: String(row.product_title ?? "Product"),
        clicks,
        orders,
        conversionRate: clicks > 0 ? Math.round((orders / clicks) * 1000) / 10 : 0,
        revenueMinor: Number(row.revenue_minor ?? 0),
      };
    },
  );

  const totalRevenueMinor = links.reduce((s, l) => s + l.revenueMinor, 0);
  const sortedLinks = [...links].sort((a, b) => b.revenueMinor - a.revenueMinor);

  return {
    totalClicks: totals.total_clicks,
    totalOrders: totals.total_orders,
    conversionRate:
      totals.conversion_rate > 0
        ? totals.conversion_rate
        : totals.total_clicks > 0
          ? Math.round((totals.total_orders / totals.total_clicks) * 1000) / 10
          : 0,
    totalRevenueMinor,
    currency: earnings.currency,
    today: {
      clicks: realtime?.clicksToday ?? 0,
      orders: realtime?.ordersToday ?? 0,
      revenueMinor: realtime?.revenueTodayMinor ?? 0,
    },
    links: sortedLinks,
    hourHeatmap,
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      totalClicks: c.totalClicks,
      totalOrders: c.totalOrders,
      revenueMinor: c.revenueMinor,
    })),
    selectedCampaignId: opts?.campaignId ?? null,
  };
}
