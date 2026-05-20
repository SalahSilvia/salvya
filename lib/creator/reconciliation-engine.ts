import type { SupabaseClient } from "@supabase/supabase-js";
import {
  processCreatorMonetizationForOrder,
  voidCreatorEarningsForOrder,
} from "@/lib/creator/earnings-service";
import { writeCreatorAuditLog } from "@/lib/creator/audit-log-service";
import { scheduleWalletRefresh } from "@/lib/creator/wallet-service";
import type { CreatorAttributionSnapshot } from "@/lib/creator/attribution";
import type { OrderLineItem } from "@/lib/orders/types";

export type ReconciliationResult = {
  ordersScanned: number;
  earningsRepaired: number;
  earningsVoided: number;
  mismatches: string[];
};

const PAID_STATUSES = new Set(["paid", "authorized", "cod_pending"]);
const REFUNDED = new Set(["refunded", "processed", "approved"]);

export async function runCreatorReconciliation(
  service: SupabaseClient,
  opts: { repair?: boolean; limit?: number } = {},
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    ordersScanned: 0,
    earningsRepaired: 0,
    earningsVoided: 0,
    mismatches: [],
  };

  const limit = opts.limit ?? 500;
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: orders, error } = await service
    .from("customer_orders")
    .select(
      "id, creator_id, creator_tracking_code, creator_product_link_id, referral_source, creator_self_referral, payment_status, refund_status, final_price, order_currency, user_id, line_item",
    )
    .not("creator_id", "is", null)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return result;
    throw new Error(error.message);
  }

  const orderIds = (orders ?? []).map((o) => o.id as string);
  if (!orderIds.length) return result;

  const { data: earnings } = await service
    .from("creator_earnings")
    .select("id, order_id, status, creator_id")
    .in("order_id", orderIds);

  const earningByOrder = new Map((earnings ?? []).map((e) => [e.order_id as string, e]));

  for (const order of orders ?? []) {
    result.ordersScanned += 1;
    const orderId = order.id as string;
    const creatorId = order.creator_id as string;
    const earning = earningByOrder.get(orderId);
    const paymentStatus = order.payment_status as string;
    const refundStatus = (order.refund_status as string | null) ?? "";

    const isPaid = PAID_STATUSES.has(paymentStatus);
    const isRefunded = REFUNDED.has(refundStatus);

    if (isPaid && !earning && opts.repair !== false) {
      result.mismatches.push(`missing_earning:${orderId}`);
      const referralRaw = (order.referral_source as string | null) ?? "creator_link";
      const referralSource: CreatorAttributionSnapshot["referralSource"] =
        referralRaw === "creator_cookie" || referralRaw === "creator_last_touch"
          ? referralRaw
          : "creator_link";

      const attribution: CreatorAttributionSnapshot = {
        creatorId,
        creatorTrackingCode: (order.creator_tracking_code as string | null) ?? "",
        creatorProductLinkId: (order.creator_product_link_id as string | null) ?? "",
        productId: "",
        referralSource,
        selfReferral: order.creator_self_referral === true,
      };

      try {
        await processCreatorMonetizationForOrder(service, {
          orderId,
          paymentStatus,
          finalPrice: order.final_price as number | null,
          orderCurrency: order.order_currency as string | null,
          buyerUserId: (order.user_id as string | null) ?? null,
          attribution,
          lineItem: order.line_item as OrderLineItem | null,
        });
        result.earningsRepaired += 1;
        await writeCreatorAuditLog(service, {
          creatorId,
          actionType: "reconciliation_repair_earning",
          entityType: "reconciliation",
          entityId: orderId,
          metadata: { type: "missing_earning" },
        });
        scheduleWalletRefresh(service, creatorId);
      } catch {
        /* repair failed — logged via mismatch */
      }
    }

    if (isRefunded && earning && earning.status !== "void") {
      result.mismatches.push(`refunded_with_earning:${orderId}`);
      if (opts.repair !== false) {
        try {
          await voidCreatorEarningsForOrder(service, orderId);
          result.earningsVoided += 1;
          await writeCreatorAuditLog(service, {
            creatorId,
            actionType: "reconciliation_void_earning",
            entityType: "reconciliation",
            entityId: orderId,
            metadata: { refundStatus },
          });
          scheduleWalletRefresh(service, creatorId);
        } catch {
          /* non-fatal */
        }
      }
    }

    if (earning && !isPaid && earning.status === "available") {
      result.mismatches.push(`unpaid_order_available_earning:${orderId}`);
    }
  }

  return result;
}
