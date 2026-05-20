import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorAnyEventType } from "@/lib/creator/events-service";
import { writeCreatorAuditLog } from "@/lib/creator/audit-log-service";

const CLICK_SPAM_THRESHOLD = Number(process.env.CREATOR_CLICK_SPAM_THRESHOLD ?? "8");
const CLICK_SPAM_WINDOW_MIN = Number(process.env.CREATOR_CLICK_SPAM_WINDOW_MIN ?? "10");
const CTR_SPIKE_CLICKS = Number(process.env.CREATOR_CTR_SPIKE_CLICKS ?? "50");
const CTR_SPIKE_MIN_ORDERS = Number(process.env.CREATOR_CTR_SPIKE_MIN_ORDERS ?? "0");

export type FraudSeverity = "low" | "medium" | "high";
export type FraudAction = "allow" | "flag" | "hold_earnings";

export type CreatorRiskEvaluation = {
  riskScore: number;
  action: FraudAction;
  reasons: string[];
};

async function insertFraudFlag(
  service: SupabaseClient,
  row: {
    creatorId: string;
    eventId: string | null;
    reason: string;
    severity: FraudSeverity;
    autoBlocked: boolean;
    riskScore: number;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await service.from("creator_fraud_flags").insert({
    creator_id: row.creatorId,
    event_id: row.eventId,
    reason: row.reason,
    severity: row.severity,
    auto_blocked: row.autoBlocked,
    metadata: { ...row.metadata, risk_score: row.riskScore },
  });

  if (error && error.code !== "42P01" && !error.message.includes("creator_fraud_flags")) {
    throw new Error(error.message);
  }
}

async function lockEarningsForOrder(service: SupabaseClient, orderId: string, fraudStatus: "suspicious" | "void") {
  const { error } = await service
    .from("creator_earnings")
    .update({ fraud_status: fraudStatus, locked: true })
    .eq("order_id", orderId);

  if (error && error.code !== "42P01") throw new Error(error.message);
}

export function scoreToAction(score: number, hasHighSeverity: boolean): FraudAction {
  if (hasHighSeverity || score >= 75) return "hold_earnings";
  if (score >= 40) return "flag";
  return "allow";
}

/** Lightweight order-time check (non-blocking caller). */
export async function evaluateOrderAttributionRisk(
  service: SupabaseClient,
  input: {
    creatorId: string;
    buyerUserId: string | null;
    orderId: string;
    selfReferral: boolean;
  },
): Promise<CreatorRiskEvaluation> {
  const reasons: string[] = [];
  let score = 0;

  if (input.selfReferral || (input.buyerUserId && input.buyerUserId === input.creatorId)) {
    reasons.push("fraud_self_purchase");
    score += 90;
  }

  const evaluation: CreatorRiskEvaluation = {
    riskScore: Math.min(100, score),
    action: scoreToAction(score, score >= 75),
    reasons,
  };

  if (reasons.length) {
    await insertFraudFlag(service, {
      creatorId: input.creatorId,
      eventId: null,
      reason: "fraud_self_purchase",
      severity: "high",
      autoBlocked: true,
      riskScore: evaluation.riskScore,
      metadata: { orderId: input.orderId, buyerUserId: input.buyerUserId },
    });

    await writeCreatorAuditLog(service, {
      creatorId: input.creatorId,
      actionType: "fraud_detected",
      entityType: "order",
      entityId: input.orderId,
      metadata: { reasons, riskScore: evaluation.riskScore, action: evaluation.action },
    });

    if (evaluation.action === "hold_earnings") {
      await lockEarningsForOrder(service, input.orderId, "void");
    }
  }

  return evaluation;
}

export async function runCreatorFraudChecks(
  service: SupabaseClient,
  input: {
    eventId: string;
    eventType: CreatorAnyEventType;
    creatorId: string;
    linkId: string | null;
    userId: string | null;
    trackingCode: string | null;
    orderId: string | null;
    ipHash: string;
    metadata?: Record<string, unknown>;
  },
): Promise<CreatorRiskEvaluation> {
  const since = new Date(Date.now() - CLICK_SPAM_WINDOW_MIN * 60_000).toISOString();
  const reasons: string[] = [];
  let score = 0;
  let hasHigh = false;

  if (input.eventType === "click" && input.linkId) {
    let clickQuery = service
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "click")
      .eq("link_id", input.linkId)
      .gte("created_at", since);

    if (input.ipHash) {
      clickQuery = clickQuery.contains("metadata", { ip_hash: input.ipHash });
    }

    const { count: ipClicks } = await clickQuery;
    const clicks = ipClicks ?? 0;

    if (input.userId && input.userId === input.creatorId) {
      reasons.push("fraud_self_purchase");
      score += 85;
      hasHigh = true;
      await insertFraudFlag(service, {
        creatorId: input.creatorId,
        eventId: input.eventId,
        reason: "fraud_self_purchase",
        severity: "high",
        autoBlocked: true,
        riskScore: 85,
      });
    }

    if (clicks >= CLICK_SPAM_THRESHOLD) {
      reasons.push("fraud_click_spam");
      score += clicks >= CLICK_SPAM_THRESHOLD * 2 ? 70 : 45;
      if (clicks >= CLICK_SPAM_THRESHOLD * 2) hasHigh = true;
      await insertFraudFlag(service, {
        creatorId: input.creatorId,
        eventId: input.eventId,
        reason: "fraud_click_spam",
        severity: clicks >= CLICK_SPAM_THRESHOLD * 2 ? "high" : "medium",
        autoBlocked: clicks >= CLICK_SPAM_THRESHOLD * 2,
        riskScore: Math.min(100, score),
        metadata: { clicks, windowMin: CLICK_SPAM_WINDOW_MIN, trackingCode: input.trackingCode },
      });
    }

    const { count: totalClicks } = await service
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("link_id", input.linkId)
      .in("event_type", ["click", "campaign_click"]);

    const { count: totalOrders } = await service
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("link_id", input.linkId)
      .in("event_type", ["order", "campaign_order"]);

    const allClicks = totalClicks ?? 0;
    const allOrders = totalOrders ?? 0;

    if (allClicks >= CTR_SPIKE_CLICKS && allOrders <= CTR_SPIKE_MIN_ORDERS) {
      reasons.push("fraud_bot_pattern");
      score += 55;
      await insertFraudFlag(service, {
        creatorId: input.creatorId,
        eventId: input.eventId,
        reason: "fraud_bot_pattern",
        severity: "medium",
        autoBlocked: false,
        riskScore: Math.min(100, score),
        metadata: { clicks: allClicks, orders: allOrders },
      });
    }

    const instantCheckout = input.metadata?.instant_checkout === true;
    const zeroDwell = input.metadata?.dwell_ms === 0;
    if (instantCheckout || zeroDwell) {
      reasons.push("fraud_bot_pattern");
      score += 35;
      await insertFraudFlag(service, {
        creatorId: input.creatorId,
        eventId: input.eventId,
        reason: "fraud_bot_pattern",
        severity: "low",
        autoBlocked: false,
        riskScore: Math.min(100, score),
        metadata: { instantCheckout, zeroDwell },
      });
    }
  }

  if (input.eventType === "order" && input.orderId) {
    if (input.userId && input.userId === input.creatorId) {
      reasons.push("fraud_self_purchase");
      score = Math.max(score, 90);
      hasHigh = true;
    }

    const { data: flags } = await service
      .from("creator_fraud_flags")
      .select("severity, auto_blocked")
      .eq("creator_id", input.creatorId)
      .gte("created_at", since)
      .in("severity", ["high", "medium"]);

    const blocked = (flags ?? []).some((f) => f.auto_blocked || f.severity === "high");
    if (blocked) {
      score = Math.max(score, 80);
      hasHigh = true;
    }
  }

  const evaluation: CreatorRiskEvaluation = {
    riskScore: Math.min(100, score),
    action: scoreToAction(score, hasHigh),
    reasons,
  };

  if (reasons.length) {
    await writeCreatorAuditLog(service, {
      creatorId: input.creatorId,
      actionType: "fraud_detected",
      entityType: "event",
      entityId: input.eventId,
      metadata: {
        reasons,
        riskScore: evaluation.riskScore,
        action: evaluation.action,
        eventType: input.eventType,
      },
    });
  }

  if (input.eventType === "order" && input.orderId && evaluation.action === "hold_earnings") {
    await lockEarningsForOrder(service, input.orderId, "suspicious");
  }

  if (input.eventType === "order" && input.orderId && evaluation.action === "flag") {
    const { data: row } = await service
      .from("creator_earnings")
      .select("id, locked")
      .eq("order_id", input.orderId)
      .maybeSingle();
    if (row && !row.locked) {
      await service
        .from("creator_earnings")
        .update({ fraud_status: "suspicious" })
        .eq("order_id", input.orderId);
    }
  }

  return evaluation;
}
