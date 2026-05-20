import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonalizedFeedItem } from "@/lib/creator/phase6-types";
import type { ContentStrategy } from "@/lib/creator/phase6-types";
import type { ViralitySnapshot } from "@/lib/creator/phase6-types";
import { listCreatorCampaigns } from "@/lib/creator/campaign-service";

export async function buildPersonalizedCreatorFeed(
  service: SupabaseClient,
  creatorId: string,
  strategy: ContentStrategy,
  virality: ViralitySnapshot[],
): Promise<PersonalizedFeedItem[]> {
  const items: PersonalizedFeedItem[] = [];

  const { data: links } = await service
    .from("creator_product_links")
    .select("id, product_id, tracking_code, clicks_count, orders_count, salvya_products(title)")
    .eq("creator_id", creatorId)
    .order("clicks_count", { ascending: false })
    .limit(30);

  const viralByProduct = new Map(virality.filter((v) => v.productId).map((v) => [v.productId!, v]));

  for (const link of links ?? []) {
    const pid = link.product_id as string;
    const join = link.salvya_products as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(join) ? join[0]?.title ?? "Product" : join?.title ?? "Product";
    const viral = viralByProduct.get(pid);
    const clicks = Number(link.clicks_count ?? 0);
    const orders = Number(link.orders_count ?? 0);
    const ctr = clicks > 0 ? orders / clicks : 0;

    let score = clicks * 2 + orders * 20 + (viral?.viralScore ?? 0) * 0.5;
    if (pid === strategy.recommendedProductId) score += 50;

    items.push({
      type: "link",
      id: link.id as string,
      title,
      href: `/creator/products/${pid}`,
      score,
      reason:
        viral && viral.viralScore >= 60
          ? `High viral potential (${viral.viralStage})`
          : ctr > 0.05
            ? `Strong CTR ${Math.round(ctr * 100)}%`
            : "Top click volume",
    });
  }

  const campaigns = await listCreatorCampaigns(service, creatorId);
  for (const c of campaigns.filter((x) => x.status === "active").slice(0, 5)) {
    items.push({
      type: "campaign",
      id: c.id,
      title: c.name,
      href: "/creator/analytics",
      score: c.totalOrders * 25 + c.totalClicks,
      reason: c.conversionRate > 0 ? `Campaign CTR ${c.conversionRate}%` : "Active campaign",
    });
  }

  if (strategy.recommendedProductId) {
    items.push({
      type: "product",
      id: strategy.recommendedProductId,
      title: strategy.recommendedProductTitle,
      href: `/creator/products`,
      score: 1000,
      reason: "AI recommended next push",
    });
  }

  return [...items].sort((a, b) => b.score - a.score).slice(0, 15);
}
