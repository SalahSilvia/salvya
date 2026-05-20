import type { RefundPolicyOrder } from "@/lib/orders/refund-policy";
import type { CustomerOrder } from "@/lib/orders/types";

export function orderToRefundPolicy(order: CustomerOrder): RefundPolicyOrder {
  return {
    id: order.id,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.payment.method,
    productionStatus: order.productionStatus,
    productionStartsAt: order.productionStartsAt ?? null,
    refundStatus: order.refundStatus ?? null,
    fulfillmentStatus: order.fulfillmentStatus,
    marketCode: order.marketCode ?? null,
    buyerCountry: order.shipping.buyerCountry,
  };
}

export function dbRowToRefundPolicy(row: {
  id: string;
  created_at: string;
  payment_status: string;
  payment: unknown;
  production_status?: string | null;
  production_starts_at?: string | null;
  refund_status?: string | null;
  fulfillment_status: string;
  market_code?: string | null;
  shipping?: unknown;
}): RefundPolicyOrder | null {
  const payment = row.payment as { method?: string } | null;
  const method = payment?.method === "paypal" ? "paypal" : "cod";
  const productionStatus = row.production_status ?? "pending";
  if (
    productionStatus !== "pending" &&
    productionStatus !== "queued" &&
    productionStatus !== "in_production" &&
    productionStatus !== "shipped"
  ) {
    return null;
  }
  const refundStatus = row.refund_status;
  const refund =
    refundStatus === "requested" ||
    refundStatus === "approved" ||
    refundStatus === "rejected" ||
    refundStatus === "refunded" ||
    refundStatus === "failed" ||
    refundStatus === "processed"
      ? refundStatus
      : null;

  const shipping = row.shipping as { buyerCountry?: string } | null;
  return {
    id: row.id,
    createdAt: row.created_at,
    paymentStatus: row.payment_status,
    paymentMethod: method,
    productionStatus,
    productionStartsAt: row.production_starts_at ?? null,
    refundStatus: refund,
    fulfillmentStatus: row.fulfillment_status,
    marketCode: row.market_code ?? null,
    buyerCountry: typeof shipping?.buyerCountry === "string" ? shipping.buyerCountry : null,
  };
}

export function generateRefundReferenceId(orderNumber: string): string {
  const tail = orderNumber.replace(/\D/g, "").slice(-6) || orderNumber.slice(-6);
  return `RF-${tail}-${Date.now().toString(36).toUpperCase()}`;
}
