import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ViralStage,
  ViralityPrediction,
  ViralitySignals,
  ViralitySnapshot,
} from "@/lib/creator/phase6-types";

function stageFromScore(score: number): ViralStage {
  if (score >= 85) return "viral";
  if (score >= 70) return "hot";
  if (score >= 45) return "warming";
  if (score >= 20) return "cold";
  return "cold";
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hourDensity(events: { created_at: string }[]): number {
  if (events.length < 5) return 0;
  const hours = new Map<number, number>();
  for (const e of events) {
    const h = new Date(e.created_at).getUTCHours();
    hours.set(h, (hours.get(h) ?? 0) + 1);
  }
  const max = Math.max(...hours.values());
  return max / events.length;
}

function computeSignals(
  clicks: number,
  orders: number,
  clicksPrev: number,
  ordersPrev: number,
  hourEvents: { created_at: string }[],
): ViralitySignals {
  const ctr = clicks > 0 ? orders / clicks : 0;
  const ctrPrev = clicksPrev > 0 ? ordersPrev / clicksPrev : 0;
  const ctrVelocity = ctrPrev > 0 ? ((ctr - ctrPrev) / ctrPrev) * 100 : ctr > 0 ? 50 : 0;
  const conversionAcceleration = ordersPrev > 0 ? ((orders - ordersPrev) / ordersPrev) * 100 : orders > 0 ? 40 : 0;
  const engagementDensity = hourDensity(hourEvents) * 100;
  const repeatClickClusters = clicks > 20 ? Math.min(100, (clicks / Math.max(hourEvents.length, 1)) * 10) : 0;
  const momentumGrowthRate =
    clicksPrev > 0 ? ((clicks - clicksPrev) / clicksPrev) * 100 : clicks > 10 ? 30 : 0;

  return {
    ctrVelocity: Math.round(ctrVelocity * 10) / 10,
    conversionAcceleration: Math.round(conversionAcceleration * 10) / 10,
    engagementDensity: Math.round(engagementDensity * 10) / 10,
    repeatClickClusters: Math.round(repeatClickClusters),
    momentumGrowthRate: Math.round(momentumGrowthRate * 10) / 10,
  };
}

function scoreFromSignals(signals: ViralitySignals, clicks: number, orders: number): number {
  let score = 0;
  score += Math.min(30, Math.max(0, signals.ctrVelocity * 0.3));
  score += Math.min(25, Math.max(0, signals.conversionAcceleration * 0.25));
  score += Math.min(20, signals.engagementDensity * 0.2);
  score += Math.min(15, signals.repeatClickClusters * 0.15);
  score += Math.min(10, Math.max(0, signals.momentumGrowthRate * 0.1));
  if (clicks > 50 && orders === 0) score = Math.max(score - 15, 10);
  if (orders >= 3 && clicks < 30) score += 15;
  return clampScore(score);
}

function predictionFromSignals(
  signals: ViralitySignals,
  stage: ViralStage,
): ViralityPrediction {
  const peak = new Date();
  if (stage === "viral" || stage === "hot") peak.setHours(peak.getHours() + 6);
  else if (stage === "warming") peak.setHours(peak.getHours() + 24);
  else peak.setHours(peak.getHours() + 72);

  const mult =
    1 +
    Math.min(2.5, Math.max(0, signals.momentumGrowthRate / 100) + signals.conversionAcceleration / 200);

  return {
    expectedPeakTime: peak.toISOString(),
    expectedRevenueMultiplier: Math.round(mult * 100) / 100,
  };
}

export async function computeViralityForCreator(
  service: SupabaseClient,
  creatorId: string,
): Promise<ViralitySnapshot[]> {
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const since14 = new Date();
  since14.setDate(since14.getDate() - 14);

  const { data: events } = await service
    .from("creator_events")
    .select("event_type, created_at, product_id, link_id")
    .eq("creator_id", creatorId)
    .gte("created_at", since14.toISOString())
    .in("event_type", ["click", "order", "campaign_click", "campaign_order"]);

  const all = events ?? [];
  const recent = all.filter((e) => e.created_at >= since7.toISOString());
  const prior = all.filter((e) => e.created_at < since7.toISOString());

  const productIds = [...new Set(all.map((e) => e.product_id).filter(Boolean))] as string[];

  const snapshots: ViralitySnapshot[] = [];

  for (const productId of productIds.length ? productIds : [null]) {
    const pid = productId as string | null;
    const r = pid ? recent.filter((e) => e.product_id === pid) : recent;
    const p = pid ? prior.filter((e) => e.product_id === pid) : prior;

    const clicks = r.filter((e) => e.event_type.includes("click")).length;
    const orders = r.filter((e) => e.event_type.includes("order")).length;
    const clicksPrev = p.filter((e) => e.event_type.includes("click")).length;
    const ordersPrev = p.filter((e) => e.event_type.includes("order")).length;

    const signals = computeSignals(clicks, orders, clicksPrev, ordersPrev, r);
    const viralScore = scoreFromSignals(signals, clicks, orders);
    const viralStage = stageFromScore(viralScore);
    const prediction = predictionFromSignals(signals, viralStage);

    let productTitle: string | null = null;
    if (pid) {
      const { data: product } = await service
        .from("salvya_products")
        .select("title")
        .eq("id", pid)
        .maybeSingle();
      productTitle = (product?.title as string) ?? null;
    }

    snapshots.push({
      productId: pid,
      linkId: null,
      productTitle,
      viralScore,
      viralStage,
      prediction,
      signals,
      updatedAt: new Date().toISOString(),
    });
  }

  if (!snapshots.length) {
    snapshots.push({
      productId: null,
      linkId: null,
      productTitle: null,
      viralScore: 0,
      viralStage: "cold",
      prediction: { expectedPeakTime: null, expectedRevenueMultiplier: 1 },
      signals: {
        ctrVelocity: 0,
        conversionAcceleration: 0,
        engagementDensity: 0,
        repeatClickClusters: 0,
        momentumGrowthRate: 0,
      },
      updatedAt: new Date().toISOString(),
    });
  }

  return snapshots.sort((a, b) => b.viralScore - a.viralScore);
}

export async function persistViralitySnapshots(
  service: SupabaseClient,
  creatorId: string,
  snapshots: ViralitySnapshot[],
): Promise<void> {
  await service.from("creator_virality_snapshots").delete().eq("creator_id", creatorId);

  const rows = snapshots.map((s) => ({
    creator_id: creatorId,
    product_id: s.productId,
    link_id: s.linkId,
    viral_score: s.viralScore,
    viral_stage: s.viralStage,
    expected_peak_time: s.prediction.expectedPeakTime,
    expected_revenue_multiplier: s.prediction.expectedRevenueMultiplier,
    signals: s.signals,
    updated_at: s.updatedAt,
  }));

  const { error } = await service.from("creator_virality_snapshots").insert(rows);
  if (error && error.code !== "42P01") throw new Error(error.message);
}

export async function loadViralitySnapshots(
  service: SupabaseClient,
  creatorId: string,
): Promise<ViralitySnapshot[]> {
  const { data, error } = await service
    .from("creator_virality_snapshots")
    .select(
      "product_id, link_id, viral_score, viral_stage, expected_peak_time, expected_revenue_multiplier, signals, updated_at, salvya_products(title)",
    )
    .eq("creator_id", creatorId)
    .order("viral_score", { ascending: false })
    .limit(20);

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const join = row.salvya_products as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(join) ? join[0]?.title : join?.title;
    return {
      productId: (row.product_id as string | null) ?? null,
      linkId: (row.link_id as string | null) ?? null,
      productTitle: title ?? null,
      viralScore: Number(row.viral_score ?? 0),
      viralStage: row.viral_stage as ViralStage,
      prediction: {
        expectedPeakTime: (row.expected_peak_time as string | null) ?? null,
        expectedRevenueMultiplier: Number(row.expected_revenue_multiplier ?? 1),
      },
      signals: (row.signals as ViralitySignals) ?? {
        ctrVelocity: 0,
        conversionAcceleration: 0,
        engagementDensity: 0,
        repeatClickClusters: 0,
        momentumGrowthRate: 0,
      },
      updatedAt: row.updated_at as string,
    };
  });
}

export type ViralityJobResult = { creatorsProcessed: number; snapshotsWritten: number };

export async function runViralityUpdateJob(service: SupabaseClient): Promise<ViralityJobResult> {
  const result: ViralityJobResult = { creatorsProcessed: 0, snapshotsWritten: 0 };
  const { data: creators, error } = await service.from("creator_profiles").select("user_id");
  if (error) {
    if (error.code === "42P01") return result;
    throw new Error(error.message);
  }

  for (const row of creators ?? []) {
    const creatorId = row.user_id as string;
    result.creatorsProcessed += 1;
    try {
      const snapshots = await computeViralityForCreator(service, creatorId);
      await persistViralitySnapshots(service, creatorId, snapshots);
      result.snapshotsWritten += snapshots.length;
    } catch {
      /* per-creator */
    }
  }

  return result;
}
