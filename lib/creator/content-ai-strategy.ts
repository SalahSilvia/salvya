import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStrategy } from "@/lib/creator/phase6-types";
import { getLatestCreatorInsight } from "@/lib/creator/insights-engine";
import type { ViralitySnapshot } from "@/lib/creator/phase6-types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekdayFromEvents(events: { created_at: string }[]): number {
  const counts = new Array(7).fill(0);
  for (const e of events) {
    const d = new Date(e.created_at).getUTCDay();
    counts[d] = (counts[d] ?? 0) + 1;
  }
  let best = 0;
  for (let i = 1; i < 7; i++) {
    if (counts[i]! > counts[best]!) best = i;
  }
  return best;
}

export async function generateContentStrategy(
  service: SupabaseClient,
  creatorId: string,
  virality: ViralitySnapshot[],
): Promise<ContentStrategy> {
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const [insight, eventsRes, linksRes] = await Promise.all([
    getLatestCreatorInsight(service, creatorId),
    service
      .from("creator_events")
      .select("created_at, event_type")
      .eq("creator_id", creatorId)
      .gte("created_at", since30.toISOString())
      .in("event_type", ["click", "order", "campaign_click", "campaign_order"]),
    service
      .from("creator_product_links")
      .select("id, product_id, tracking_code, salvya_products(title)")
      .eq("creator_id", creatorId)
      .limit(50),
  ]);

  const events = eventsRes.data ?? [];
  const hourBuckets = new Map<number, { clicks: number; orders: number }>();
  for (const e of events) {
    const h = new Date(e.created_at as string).getUTCHours();
    const b = hourBuckets.get(h) ?? { clicks: 0, orders: 0 };
    if (String(e.event_type).includes("click")) b.clicks += 1;
    if (String(e.event_type).includes("order")) b.orders += 1;
    hourBuckets.set(h, b);
  }

  let bestHour = insight?.bestPostHour ?? 19;
  let bestCtr = -1;
  for (const [hour, b] of hourBuckets) {
    if (b.clicks < 3) continue;
    const ctr = b.orders / b.clicks;
    if (ctr > bestCtr) {
      bestCtr = ctr;
      bestHour = hour;
    }
  }

  const bestWeekday = weekdayFromEvents(events as { created_at: string }[]);

  const topViral = virality.find((v) => v.productId) ?? virality[0];
  let recommendedProductId = topViral?.productId ?? insight?.topProductId ?? null;
  let recommendedProductTitle = topViral?.productTitle ?? insight?.topProductTitle ?? "your top product";

  if (!recommendedProductId && linksRes.data?.length) {
    const link = linksRes.data[0]!;
    recommendedProductId = link.product_id as string;
    const join = link.salvya_products as { title?: string } | { title?: string }[] | null;
    recommendedProductTitle = Array.isArray(join) ? join[0]?.title ?? "Product" : join?.title ?? "Product";
  }

  const endHour = (bestHour + 2) % 24;
  const ctrBoost = bestCtr > 0 ? Math.round(bestCtr * 100) : 32;

  const insights: string[] = [
    `Post between ${String(bestHour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00 UTC for stronger CTR (up to +${ctrBoost}% vs average).`,
    `Best day: ${WEEKDAYS[bestWeekday]} based on your click patterns.`,
  ];

  if (topViral && topViral.viralStage !== "cold") {
    insights.push(`Push ${recommendedProductTitle} again — momentum is ${topViral.viralStage}.`);
  }

  const captionHooks = [
    "Use scarcity hook: ‘limited drop’ increases conversion on trending items.",
    "Lead with social proof: ‘selling fast’ when viral_score is rising.",
    "Pair product close-up with your creator link in the first line.",
  ];

  if (topViral?.viralStage === "viral" || topViral?.viralStage === "hot") {
    captionHooks.unshift("Strike while hot: post within the predicted peak window.");
  }

  const campaignSuggestion =
    topViral && topViral.viralScore >= 50
      ? `Launch a campaign grouping links for “${recommendedProductTitle}” to A/B test angles.`
      : "Bundle 3–5 links into one campaign to compare CTR by placement.";

  return {
    bestPostingHour: bestHour,
    bestPostingWeekday: bestWeekday,
    recommendedProductId,
    recommendedProductTitle,
    campaignSuggestion,
    captionHooks,
    insights,
  };
}
