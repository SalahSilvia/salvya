import type { SupabaseClient } from "@supabase/supabase-js";
import { REFUND_WINDOW_DAYS } from "@/lib/creator/insights-engine";
import { scheduleWalletRefresh } from "@/lib/creator/wallet-service";

export type PayoutEligibilityResult = {
  scanned: number;
  promoted: number;
};

const BLOCKED_REFUNDS = new Set(["refunded", "approved", "processed", "refund_requested"]);

function refundWindowPassed(referenceIso: string): boolean {
  const ref = new Date(referenceIso).getTime();
  const cutoff = Date.now() - REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return ref <= cutoff;
}

function orderEligibleForClearance(order: {
  payment_status: string;
  fulfillment_status: string;
  refund_status: string | null;
  paypal_capture_id: string | null;
  updated_at: string;
  created_at: string;
}): boolean {
  if (order.payment_status !== "paid") return false;
  if (order.refund_status && BLOCKED_REFUNDS.has(order.refund_status)) return false;

  const delivered = order.fulfillment_status === "delivered";
  const captured = Boolean(order.paypal_capture_id?.trim());
  if (!delivered && !captured) return false;

  const reference = delivered ? order.updated_at : order.updated_at || order.created_at;
  return refundWindowPassed(reference);
}

/** Promote pending earnings to available after delivery/capture + refund window. */
export async function runCreatorPayoutEligibilityJob(
  service: SupabaseClient,
): Promise<PayoutEligibilityResult> {
  const result: PayoutEligibilityResult = { scanned: 0, promoted: 0 };

  const { data: pending, error } = await service
    .from("creator_earnings")
    .select("id, creator_id, order_id, status, fraud_status, locked, self_referral")
    .eq("status", "pending")
    .eq("fraud_status", "valid")
    .eq("locked", false)
    .eq("self_referral", false)
    .gt("amount_minor", 0)
    .limit(500);

  if (error) {
    if (error.code === "42P01" || error.message.includes("creator_earnings")) return result;
    throw new Error(error.message);
  }

  if (!pending?.length) return result;

  const orderIds = [...new Set(pending.map((r) => r.order_id as string).filter(Boolean))];
  const { data: orders, error: orderErr } = await service
    .from("customer_orders")
    .select(
      "id, payment_status, fulfillment_status, refund_status, paypal_capture_id, updated_at, created_at",
    )
    .in("id", orderIds);

  if (orderErr) throw new Error(orderErr.message);

  const orderMap = new Map((orders ?? []).map((o) => [o.id as string, o]));

  for (const row of pending) {
    result.scanned += 1;
    const order = orderMap.get(row.order_id as string);
    if (!order || !orderEligibleForClearance(order as Parameters<typeof orderEligibleForClearance>[0])) {
      continue;
    }

    const { error: updErr } = await service
      .from("creator_earnings")
      .update({ status: "available", available_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending");

    if (!updErr) {
      result.promoted += 1;
      scheduleWalletRefresh(service, row.creator_id as string);
    }
  }

  return result;
}
