import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorInsightDaily } from "@/lib/creator/phase4-types";

const REFUND_WINDOW_DAYS = Number(process.env.CREATOR_REFUND_WINDOW_DAYS ?? "7");

function isMissingInsights(message: string): boolean {
  return message.includes("creator_insights") || message.includes("does not exist");
}

type DailyPoint = { date: string; earningsMinor: number; clicks: number; orders: number };

function linearForecast(points: DailyPoint[], days: number): { minor: number; confidence: number } {
  if (points.length < 3) {
    const avg = points.length ? points.reduce((s, p) => s + p.earningsMinor, 0) / points.length : 0;
    return { minor: Math.round(avg * days), confidence: points.length >= 1 ? 35 : 20 };
  }
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = points[i]!.earningsMinor;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;
  const next = intercept + slope * (n + days - 1);
  const confidence = Math.min(90, 40 + n * 4);
  return { minor: Math.max(0, Math.round(next)), confidence };
}

function hourFromIso(iso: string): number {
  return new Date(iso).getUTCHours();
}

export async function computeCreatorInsight(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorInsightDaily> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const since30 = new Date(today);
  since30.setDate(since30.getDate() - 30);

  const [eventsRes, earningsRes, prevInsightRes] = await Promise.all([
    service
      .from("creator_events")
      .select("event_type, created_at, product_id")
      .eq("creator_id", creatorId)
      .gte("created_at", since30.toISOString())
      .in("event_type", ["click", "order", "campaign_click", "campaign_order"]),
    service
      .from("creator_earnings")
      .select("amount_minor, status, created_at, self_referral")
      .eq("creator_id", creatorId)
      .gte("created_at", since30.toISOString()),
    service
      .from("creator_insights_daily")
      .select("clicks, orders, earnings_minor, insight_date")
      .eq("creator_id", creatorId)
      .gte("insight_date", new Date(since30.getTime() - 7 * 86400000).toISOString().slice(0, 10))
      .order("insight_date", { ascending: false })
      .limit(14),
  ]);

  const events = eventsRes.data ?? [];
  const earnings = (earningsRes.data ?? []).filter((e) => !e.self_referral);

  let clicks = 0;
  let orders = 0;
  const hourBuckets = new Map<number, { clicks: number; orders: number }>();
  const productClicks = new Map<string, number>();

  for (const ev of events) {
    const type = ev.event_type as string;
    const h = hourFromIso(ev.created_at as string);
    const bucket = hourBuckets.get(h) ?? { clicks: 0, orders: 0 };
    if (type === "click" || type === "campaign_click") {
      clicks += 1;
      bucket.clicks += 1;
      if (ev.product_id) {
        const pid = ev.product_id as string;
        productClicks.set(pid, (productClicks.get(pid) ?? 0) + 1);
      }
    }
    if (type === "order" || type === "campaign_order") {
      orders += 1;
      bucket.orders += 1;
    }
    hourBuckets.set(h, bucket);
  }

  let earningsMinor = 0;
  const dailyMap = new Map<string, DailyPoint>();
  for (const row of earnings) {
    const amount = Number(row.amount_minor ?? 0);
    if (row.status === "void") continue;
    earningsMinor += amount;
    const day = (row.created_at as string).slice(0, 10);
    const cur = dailyMap.get(day) ?? { date: day, earningsMinor: 0, clicks: 0, orders: 0 };
    cur.earningsMinor += amount;
    dailyMap.set(day, cur);
  }

  const dailyPoints = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));
  const forecast7 = linearForecast(dailyPoints, 7);
  const forecast30 = linearForecast(dailyPoints, 30);

  let bestPostHour: number | null = null;
  let bestCtr = -1;
  for (const [hour, bucket] of hourBuckets) {
    if (bucket.clicks < 3) continue;
    const ctr = bucket.orders / bucket.clicks;
    if (ctr > bestCtr) {
      bestCtr = ctr;
      bestPostHour = hour;
    }
  }

  let topProductId: string | null = null;
  let topClicks = 0;
  for (const [pid, c] of productClicks) {
    if (c > topClicks) {
      topClicks = c;
      topProductId = pid;
    }
  }

  let topProductTitle: string | null = null;
  if (topProductId) {
    const { data: product } = await service
      .from("salvya_products")
      .select("title")
      .eq("id", topProductId)
      .maybeSingle();
    topProductTitle = (product?.title as string) ?? null;
  }

  const conversionRate = clicks > 0 ? Math.round((orders / clicks) * 1000) / 10 : 0;
  const expectedCtr = clicks > 10 ? orders / clicks : 0;
  const dropOff = clicks > 20 && orders / clicks < expectedCtr * 0.5;
  const viralScore = Math.min(100, Math.round((orders / Math.max(clicks, 1)) * 200 + orders * 2));

  const prevRows = prevInsightRes.data ?? [];
  const lastWeek = prevRows.slice(0, 7).reduce((s, r) => s + Number(r.earnings_minor ?? 0), 0);
  const priorWeek = prevRows.slice(7, 14).reduce((s, r) => s + Number(r.earnings_minor ?? 0), 0);
  const weekOverWeekPct =
    priorWeek > 0 ? Math.round(((lastWeek - priorWeek) / priorWeek) * 1000) / 10 : lastWeek > 0 ? 100 : null;

  const ctrAnomaly = clicks > 15 && conversionRate < 1 ? 70 : clicks > 30 && conversionRate < 2 ? 50 : 15;
  const trendAnomaly = weekOverWeekPct !== null && weekOverWeekPct < -30 ? 60 : 0;
  const anomalyScore = Math.min(100, ctrAnomaly + trendAnomaly + (dropOff ? 25 : 0));

  const recommendations: string[] = [];
  if (weekOverWeekPct !== null && weekOverWeekPct > 10) {
    recommendations.push(`You are trending +${weekOverWeekPct}% this week.`);
  } else if (weekOverWeekPct !== null && weekOverWeekPct < -10) {
    recommendations.push(`Earnings dipped ${Math.abs(weekOverWeekPct)}% vs last week — refresh top links.`);
  }
  if (topProductTitle) recommendations.push(`Best product: ${topProductTitle}.`);
  if (bestPostHour !== null) {
    const end = (bestPostHour + 2) % 24;
    recommendations.push(`Post around ${bestPostHour}:00–${end}:00 UTC for stronger CTR.`);
  }
  if (dropOff) recommendations.push("High clicks but low orders — check product page and pricing.");
  if (!recommendations.length) recommendations.push("Keep sharing promo links to build conversion data.");

  return {
    insightDate: todayStr,
    clicks,
    orders,
    conversionRate,
    earningsMinor,
    topProductId,
    topProductTitle,
    anomalyScore,
    forecast7dMinor: forecast7.minor,
    forecast30dMinor: forecast30.minor,
    forecastConfidence: Math.round((forecast7.confidence + forecast30.confidence) / 2),
    recommendationText: recommendations.join(" "),
    bestPostHour,
    viralScore,
    weekOverWeekPct,
  };
}

export async function upsertCreatorInsightDaily(
  service: SupabaseClient,
  creatorId: string,
  insight: CreatorInsightDaily,
): Promise<void> {
  const { error } = await service.from("creator_insights_daily").upsert(
    {
      creator_id: creatorId,
      insight_date: insight.insightDate,
      clicks: insight.clicks,
      orders: insight.orders,
      conversion_rate: insight.conversionRate,
      earnings_minor: insight.earningsMinor,
      top_product_id: insight.topProductId,
      anomaly_score: insight.anomalyScore,
      forecast_7d_minor: insight.forecast7dMinor,
      forecast_30d_minor: insight.forecast30dMinor,
      forecast_confidence: insight.forecastConfidence,
      recommendation_text: insight.recommendationText,
      best_post_hour: insight.bestPostHour,
      viral_score: insight.viralScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "creator_id,insight_date" },
  );

  if (error && !isMissingInsights(error.message)) throw new Error(error.message);
}

export async function getLatestCreatorInsight(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorInsightDaily | null> {
  const { data, error } = await service
    .from("creator_insights_daily")
    .select(
      "insight_date, clicks, orders, conversion_rate, earnings_minor, top_product_id, anomaly_score, forecast_7d_minor, forecast_30d_minor, forecast_confidence, recommendation_text, best_post_hour, viral_score, salvya_products(title)",
    )
    .eq("creator_id", creatorId)
    .order("insight_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || isMissingInsights(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const productJoin = data.salvya_products as { title?: string } | { title?: string }[] | null;
  const title = Array.isArray(productJoin) ? productJoin[0]?.title : productJoin?.title;

  const prev = await service
    .from("creator_insights_daily")
    .select("earnings_minor")
    .eq("creator_id", creatorId)
    .lt("insight_date", data.insight_date as string)
    .order("insight_date", { ascending: false })
    .limit(7);

  const lastWeek = Number(data.earnings_minor ?? 0);
  const priorWeek = (prev.data ?? []).reduce((s, r) => s + Number(r.earnings_minor ?? 0), 0);
  const weekOverWeekPct =
    priorWeek > 0 ? Math.round(((lastWeek - priorWeek) / priorWeek) * 1000) / 10 : null;

  return {
    insightDate: data.insight_date as string,
    clicks: Number(data.clicks ?? 0),
    orders: Number(data.orders ?? 0),
    conversionRate: Number(data.conversion_rate ?? 0),
    earningsMinor: Number(data.earnings_minor ?? 0),
    topProductId: (data.top_product_id as string | null) ?? null,
    topProductTitle: title ?? null,
    anomalyScore: Number(data.anomaly_score ?? 0),
    forecast7dMinor: Number(data.forecast_7d_minor ?? 0),
    forecast30dMinor: Number(data.forecast_30d_minor ?? 0),
    forecastConfidence: Number(data.forecast_confidence ?? 50),
    recommendationText: (data.recommendation_text as string) ?? "",
    bestPostHour: typeof data.best_post_hour === "number" ? data.best_post_hour : null,
    viralScore: Number(data.viral_score ?? 0),
    weekOverWeekPct,
  };
}

export type InsightsJobResult = { creatorsProcessed: number; insightsWritten: number };

export async function runCreatorInsightsJob(service: SupabaseClient): Promise<InsightsJobResult> {
  const result: InsightsJobResult = { creatorsProcessed: 0, insightsWritten: 0 };

  const { data: creators, error } = await service
    .from("creator_profiles")
    .select("user_id");

  if (error) {
    if (error.code === "42P01") return result;
    throw new Error(error.message);
  }

  for (const row of creators ?? []) {
    const creatorId = row.user_id as string;
    result.creatorsProcessed += 1;
    try {
      const insight = await computeCreatorInsight(service, creatorId);
      await upsertCreatorInsightDaily(service, creatorId, insight);
      result.insightsWritten += 1;
    } catch {
      /* per-creator failure must not abort batch */
    }
  }

  return result;
}

export { REFUND_WINDOW_DAYS };
