import type { SupabaseClient } from "@supabase/supabase-js";
import { writeCreatorAuditLog } from "@/lib/creator/audit-log-service";
import type {
  CampaignAnalyticsPayload,
  CreatorCampaign,
  CreatorCampaignLinkRow,
} from "@/lib/creator/phase4-types";

function isMissingTable(message: string): boolean {
  return message.includes("creator_campaign") || message.includes("does not exist");
}

function mapCampaign(row: Record<string, unknown>, agg?: { clicks: number; orders: number; revenue: number; links: number }): CreatorCampaign {
  const clicks = agg?.clicks ?? 0;
  const orders = agg?.orders ?? 0;
  return {
    id: String(row.id),
    name: String(row.name),
    status: row.status as CreatorCampaign["status"],
    budgetOptional: typeof row.budget_optional === "number" ? row.budget_optional : null,
    startDate: (row.start_date as string | null) ?? null,
    endDate: (row.end_date as string | null) ?? null,
    createdAt: String(row.created_at),
    linkCount: agg?.links ?? 0,
    totalClicks: clicks,
    totalOrders: orders,
    revenueMinor: agg?.revenue ?? 0,
    conversionRate: clicks > 0 ? Math.round((orders / clicks) * 1000) / 10 : 0,
  };
}

export async function listCreatorCampaigns(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorCampaign[]> {
  const { data: campaigns, error } = await service
    .from("creator_campaigns")
    .select("id, name, status, budget_optional, start_date, end_date, created_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || isMissingTable(error.message)) return [];
    throw new Error(error.message);
  }

  if (!campaigns?.length) return [];

  const ids = campaigns.map((c) => c.id as string);
  const { data: links } = await service
    .from("creator_campaign_links")
    .select("campaign_id, clicks, orders, revenue_minor")
    .in("campaign_id", ids);

  const agg = new Map<string, { clicks: number; orders: number; revenue: number; links: number }>();
  for (const link of links ?? []) {
    const cid = link.campaign_id as string;
    const cur = agg.get(cid) ?? { clicks: 0, orders: 0, revenue: 0, links: 0 };
    cur.clicks += Number(link.clicks ?? 0);
    cur.orders += Number(link.orders ?? 0);
    cur.revenue += Number(link.revenue_minor ?? 0);
    cur.links += 1;
    agg.set(cid, cur);
  }

  return campaigns.map((row) => mapCampaign(row as Record<string, unknown>, agg.get(row.id as string)));
}

export type CreateCampaignInput = {
  name: string;
  status?: "active" | "paused" | "ended";
  budgetOptional?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  links?: { creatorProductLinkId: string; trackingCodeVariant?: string }[];
};

export async function createCreatorCampaign(
  service: SupabaseClient,
  creatorId: string,
  input: CreateCampaignInput,
): Promise<CreatorCampaign> {
  const { data: campaign, error } = await service
    .from("creator_campaigns")
    .insert({
      creator_id: creatorId,
      name: input.name.trim(),
      status: input.status ?? "active",
      budget_optional: input.budgetOptional ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
    })
    .select("id, name, status, budget_optional, start_date, end_date, created_at")
    .single();

  if (error) throw new Error(error.message);

  const linkRows = (input.links ?? []).map((l) => ({
    campaign_id: campaign.id,
    creator_product_link_id: l.creatorProductLinkId,
    tracking_code_variant: (l.trackingCodeVariant ?? "default").trim() || "default",
  }));

  if (linkRows.length) {
    const { error: linkErr } = await service.from("creator_campaign_links").insert(linkRows);
    if (linkErr) throw new Error(linkErr.message);
  }

  const created = mapCampaign(campaign as Record<string, unknown>, {
    clicks: 0,
    orders: 0,
    revenue: 0,
    links: linkRows.length,
  });

  await writeCreatorAuditLog(service, {
    creatorId,
    actionType: "campaign_created",
    entityType: "campaign",
    entityId: created.id,
    metadata: { name: created.name, linkCount: linkRows.length },
  });

  return created;
}

export async function getCampaignAnalytics(
  service: SupabaseClient,
  creatorId: string,
  campaignId: string,
): Promise<CampaignAnalyticsPayload | null> {
  const { data: campaign, error } = await service
    .from("creator_campaigns")
    .select("id, name, status, budget_optional, start_date, end_date, created_at, creator_id")
    .eq("id", campaignId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || isMissingTable(error.message)) return null;
    throw new Error(error.message);
  }
  if (!campaign || campaign.creator_id !== creatorId) return null;

  const { data: linkRows, error: linkErr } = await service
    .from("creator_campaign_links")
    .select(
      "id, campaign_id, creator_product_link_id, tracking_code_variant, clicks, orders, revenue_minor, creator_product_links(tracking_code, salvya_products(title))",
    )
    .eq("campaign_id", campaignId);

  if (linkErr) throw new Error(linkErr.message);

  let totalClicks = 0;
  let totalOrders = 0;
  let totalRevenue = 0;

  const links: CreatorCampaignLinkRow[] = (linkRows ?? []).map((row) => {
    const join = row.creator_product_links as
      | { tracking_code?: string; salvya_products?: { title?: string } | { title?: string }[] }
      | null;
    const productJoin = join?.salvya_products;
    const title = Array.isArray(productJoin) ? productJoin[0]?.title : productJoin?.title;
    const clicks = Number(row.clicks ?? 0);
    const orders = Number(row.orders ?? 0);
    const revenueMinor = Number(row.revenue_minor ?? 0);
    totalClicks += clicks;
    totalOrders += orders;
    totalRevenue += revenueMinor;
    return {
      id: row.id as string,
      campaignId: row.campaign_id as string,
      creatorProductLinkId: row.creator_product_link_id as string,
      trackingCodeVariant: row.tracking_code_variant as string,
      clicks,
      orders,
      revenueMinor,
      trackingCode: join?.tracking_code,
      productTitle: title ?? "Product",
    };
  });

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: events } = await service
    .from("creator_events")
    .select("event_type, created_at")
    .eq("creator_id", creatorId)
    .gte("created_at", since.toISOString())
    .in("event_type", ["click", "campaign_click", "order", "campaign_order"]);

  const hourHeatmap = Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, orders: 0 }));
  for (const ev of events ?? []) {
    const hour = new Date(ev.created_at as string).getUTCHours();
    const bucket = hourHeatmap[hour];
    if (!bucket) continue;
    const type = ev.event_type as string;
    if (type === "click" || type === "campaign_click") bucket.clicks += 1;
    if (type === "order" || type === "campaign_order") bucket.orders += 1;
  }

  const topLink =
    links.length > 0
      ? [...links].sort((a, b) => b.revenueMinor - a.revenueMinor || b.orders - a.orders)[0]!
      : null;

  return {
    campaign: mapCampaign(campaign as Record<string, unknown>, {
      clicks: totalClicks,
      orders: totalOrders,
      revenue: totalRevenue,
      links: links.length,
    }),
    links,
    hourHeatmap,
    topLink,
  };
}
