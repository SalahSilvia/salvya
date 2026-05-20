import { isMoroccoCodOrder, isMoroccoOrder } from "@/lib/orders/morocco-order";
import {
  ORDER_CANCELLATION_REFUND_HOURS,
  type ProductionStatus,
  type RefundLifecycleStatus,
} from "@/lib/orders/production-types";

export type RefundPolicyOrder = {
  id: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: "cod" | "paypal";
  productionStatus: ProductionStatus;
  productionStartsAt: string | null;
  refundStatus: RefundLifecycleStatus;
  fulfillmentStatus: string;
  marketCode?: string | null;
  buyerCountry?: string | null;
};
export type RefundEligibilityCode =
  | "eligible"
  | "already_refunded"
  | "refund_in_progress"
  | "production_started"
  | "window_closed"
  | "payment_not_refundable"
  | "cancelled"
  | "order_locked"
  | "delivered_no_refund";

export type RefundEligibility = {
  eligible: boolean;
  code: RefundEligibilityCode;
  /** User-facing policy label for transparency. */
  policyReason: string;
  reason: string;
  refundDeadlineAt: string | null;
  productionStartsAt: string | null;
};

const BLOCKED_PRODUCTION: ProductionStatus[] = ["queued", "in_production", "shipped"];

export function cancellationRefundDeadline(createdAt: string): Date {
  return new Date(new Date(createdAt).getTime() + ORDER_CANCELLATION_REFUND_HOURS * 60 * 60 * 1000);
}

export function isProductionNotStarted(status: ProductionStatus): boolean {
  return status === "pending";
}

export function assessRefundEligibility(
  order: RefundPolicyOrder,
  now: Date = new Date(),
): RefundEligibility {
  const deadline = cancellationRefundDeadline(order.createdAt);
  const deadlineIso = deadline.toISOString();

  if (order.refundStatus === "refunded" || order.refundStatus === "processed") {
    return {
      eligible: false,
      code: "already_refunded",
      policyReason: "Refund completed",
      reason: "This order has already been refunded.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (order.refundStatus === "requested" || order.refundStatus === "approved") {
    return {
      eligible: false,
      code: "refund_in_progress",
      policyReason: "Refund in progress",
      reason: "A refund is already being processed for this order.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (order.fulfillmentStatus === "cancelled") {
    return {
      eligible: false,
      code: "cancelled",
      policyReason: "Order cancelled",
      reason: "This order was cancelled.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (order.fulfillmentStatus === "delivered") {
    const morocco = isMoroccoOrder(order);
    return {
      eligible: false,
      code: "delivered_no_refund",
      policyReason: morocco ? "Morocco · after delivery" : "Delivered",
      reason: morocco
        ? "After you receive your order, online refunds are not available. Returns in Morocco follow our returns policy only."
        : "This order was delivered — refunds are no longer available online.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  const paidOk =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "cod_pending" ||
    order.paymentStatus === "refund_rejected";

  if (isMoroccoCodOrder(order) && paidOk) {
    return {
      eligible: true,
      code: "eligible",
      policyReason: "Morocco COD cancellation",
      reason:
        "Cash on delivery in Morocco can be cancelled anytime before delivery. After delivery, refunds are not available online.",
      refundDeadlineAt: null,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (!isProductionNotStarted(order.productionStatus) || BLOCKED_PRODUCTION.includes(order.productionStatus)) {
    return {
      eligible: false,
      code: "production_started",
      policyReason: "Production started",
      reason: "Production has started — refunds are no longer available for this order.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (!paidOk) {
    return {
      eligible: false,
      code: "payment_not_refundable",
      policyReason: "Payment not refundable",
      reason: "Only confirmed paid orders can be refunded.",
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  if (now.getTime() > deadline.getTime()) {
    return {
      eligible: false,
      code: "window_closed",
      policyReason: "24h cancellation rule",
      reason: `The 24-hour cancellation window closed at ${deadline.toLocaleString()}.`,
      refundDeadlineAt: deadlineIso,
      productionStartsAt: order.productionStartsAt,
    };
  }

  return {
    eligible: true,
    code: "eligible",
    policyReason: "24h cancellation rule",
    reason: "You can request a refund within 24 hours while production has not started.",
    refundDeadlineAt: deadlineIso,
    productionStartsAt: order.productionStartsAt,
  };
}

export function assertRefundAllowed(
  order: RefundPolicyOrder,
  opts?: { godOverride?: boolean; now?: Date },
): RefundEligibility {
  const assessment = assessRefundEligibility(order, opts?.now);
  if (assessment.eligible) return assessment;
  if (opts?.godOverride) return assessment;
  throw new Error(assessment.reason);
}
