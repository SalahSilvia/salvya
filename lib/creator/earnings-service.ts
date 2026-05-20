import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorAttributionSnapshot } from "@/lib/creator/attribution";
import { loadCreatorApplicationByUserId } from "@/lib/creator/application-service";
import {
  commissionMinorForItems,
  CREATOR_COMMISSION_CURRENCY,
  getCreatorCommissionRate,
} from "@/lib/creator/commission";
import { countOrderLineItems } from "@/lib/creator/order-item-count";
import type { OrderLineItem } from "@/lib/orders/types";
import { recordTrustedCreatorEvent } from "@/lib/creator/trusted-events";
import { scheduleWalletRefresh } from "@/lib/creator/wallet-service";

export type CreatorEarningsBalances = {
  totalMinor: number;
  pendingMinor: number;
  availableMinor: number;
  paidMinor: number;
  voidMinor: number;
  currency: string;
};

function isMissingEarningsTable(message: string): boolean {
  return message.includes("creator_earnings") || message.includes("does not exist");
}

function grossMinorFromOrder(finalPrice: number | null | undefined, currency: string | null | undefined): {
  grossMinor: number;
  currency: string;
} {
  const cur = (currency ?? "EUR").toUpperCase();
  if (typeof finalPrice !== "number" || !Number.isFinite(finalPrice) || finalPrice <= 0) {
    return { grossMinor: 0, currency: cur };
  }
  return { grossMinor: Math.round(finalPrice * 100), currency: cur };
}

function earningStatusForPayment(paymentStatus: string, selfReferral: boolean): "pending" | "available" | "void" {
  if (selfReferral) return "void";
  if (paymentStatus === "paid") return "available";
  return "pending";
}

function fraudStatusForAttribution(selfReferral: boolean): "valid" | "void" {
  return selfReferral ? "void" : "valid";
}

/** After order insert: record order event + ledger row (idempotent on order_id). */
export async function processCreatorMonetizationForOrder(
  service: SupabaseClient,
  opts: {
    orderId: string;
    paymentStatus: string;
    finalPrice: number | null;
    orderCurrency: string | null;
    buyerUserId: string | null;
    attribution: CreatorAttributionSnapshot | null;
    lineItem?: OrderLineItem | null;
  },
): Promise<void> {
  const { attribution } = opts;
  if (!attribution) return;

  const application = await loadCreatorApplicationByUserId(service, attribution.creatorId);
  const followersCount = application?.followers_count ?? 0;
  const itemCount = countOrderLineItems(opts.lineItem);
  const { grossMinor, currency: orderCurrency } = grossMinorFromOrder(opts.finalPrice, opts.orderCurrency);
  const currency = CREATOR_COMMISSION_CURRENCY;
  const amountMinor = attribution.selfReferral
    ? 0
    : commissionMinorForItems(followersCount, itemCount);
  const rate = getCreatorCommissionRate();
  const status = earningStatusForPayment(opts.paymentStatus, attribution.selfReferral);
  const fraudStatus = fraudStatusForAttribution(attribution.selfReferral);
  const now = new Date().toISOString();

  await recordTrustedCreatorEvent(
    service,
    {
      eventType: "order",
      creatorId: attribution.creatorId,
      productId: attribution.productId,
      linkId: attribution.creatorProductLinkId,
      trackingCode: attribution.creatorTrackingCode,
      userId: opts.buyerUserId,
      orderId: opts.orderId,
      metadata: {
        selfReferral: attribution.selfReferral,
        paymentStatus: opts.paymentStatus,
        attributionSource: attribution.referralSource,
        followersCount,
        itemCount,
        orderCurrency,
        orderGrossMinor: grossMinor,
      },
    },
    { dedupWindowMinutes: 60 * 24, revenueMinor: amountMinor },
  );

  const { error } = await service.from("creator_earnings").upsert(
    {
      creator_id: attribution.creatorId,
      order_id: opts.orderId,
      link_id: attribution.creatorProductLinkId,
      gross_amount_minor: grossMinor,
      commission_rate: rate,
      amount_minor: amountMinor,
      currency,
      status,
      fraud_status: fraudStatus,
      locked: fraudStatus !== "valid",
      self_referral: attribution.selfReferral,
      available_at: status === "available" ? now : null,
    },
    { onConflict: "order_id", ignoreDuplicates: true },
  );

  if (error && error.code !== "42P01" && !isMissingEarningsTable(error.message)) {
    throw new Error(error.message);
  }

  scheduleWalletRefresh(service, attribution.creatorId);
}

/** When payment transitions to paid — unlock pending earnings if fraud-valid. */
export async function settleCreatorEarningsOnOrderPaid(
  service: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { data: row, error: loadErr } = await service
    .from("creator_earnings")
    .select("id, status, self_referral, amount_minor, fraud_status, locked")
    .eq("order_id", orderId)
    .maybeSingle();

  if (loadErr) {
    if (loadErr.code === "42P01" || isMissingEarningsTable(loadErr.message)) return;
    throw new Error(loadErr.message);
  }

  if (!row || row.self_referral || row.amount_minor <= 0) return;
  if (row.fraud_status !== "valid" || row.locked) return;
  if (row.status === "paid" || row.status === "void" || row.status === "available") return;

  const { error } = await service
    .from("creator_earnings")
    .update({
      status: "available",
      available_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .eq("status", "pending")
    .eq("fraud_status", "valid")
    .eq("locked", false);

  if (error && error.code !== "42P01" && !isMissingEarningsTable(error.message)) {
    throw new Error(error.message);
  }
}

/** Void commission when order is fully refunded. */
export async function voidCreatorEarningsForOrder(service: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await service
    .from("creator_earnings")
    .update({ status: "void", fraud_status: "void", locked: true })
    .eq("order_id", orderId)
    .in("status", ["pending", "available"]);

  if (error && error.code !== "42P01" && !isMissingEarningsTable(error.message)) {
    throw new Error(error.message);
  }
}

export async function getCreatorEarningsBalances(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorEarningsBalances> {
  const empty: CreatorEarningsBalances = {
    totalMinor: 0,
    pendingMinor: 0,
    availableMinor: 0,
    paidMinor: 0,
    voidMinor: 0,
    currency: "EUR",
  };

  const { data, error } = await service
    .from("creator_earnings")
    .select("amount_minor, status, currency, self_referral, fraud_status, locked")
    .eq("creator_id", creatorId);

  if (error) {
    if (error.code === "42P01" || isMissingEarningsTable(error.message)) return empty;
    throw new Error(error.message);
  }

  const rows = data ?? [];
  let pendingMinor = 0;
  let availableMinor = 0;
  let paidMinor = 0;
  let voidMinor = 0;
  let currency = "EUR";

  for (const row of rows) {
    if (row.self_referral) continue;
    const amount = typeof row.amount_minor === "number" ? row.amount_minor : 0;
    if (typeof row.currency === "string" && row.currency) currency = row.currency;

    const fraudStatus = row.fraud_status as string | undefined;
    const locked = row.locked === true;
    const status = row.status as string;

    if (status === "void" || fraudStatus === "void") {
      voidMinor += amount;
      continue;
    }

    if (fraudStatus === "suspicious" || locked) {
      voidMinor += amount;
      continue;
    }

    if (status === "pending" && fraudStatus === "valid") pendingMinor += amount;
    else if (status === "available" && fraudStatus === "valid") availableMinor += amount;
    else if (status === "paid") paidMinor += amount;
  }

  return {
    totalMinor: pendingMinor + availableMinor + paidMinor,
    pendingMinor,
    availableMinor,
    paidMinor,
    voidMinor,
    currency,
  };
}

export async function listCreatorPayouts(
  service: SupabaseClient,
  creatorId: string,
  limit = 20,
): Promise<
  {
    id: string;
    amountMinor: number;
    currency: string;
    status: string;
    method: string;
    reference: string | null;
    createdAt: string;
  }[]
> {
  const { data, error } = await service
    .from("creator_payouts")
    .select("id, amount_minor, currency, status, method, reference, created_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("creator_payouts")) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    amountMinor: row.amount_minor as number,
    currency: (row.currency as string) ?? "EUR",
    status: (row.status as string) === "completed" ? "paid" : (row.status as string),
    method: (row.method as string) ?? "manual",
    reference: (row.reference as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}
