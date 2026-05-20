import type { OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

export type StatusBadgeStyle = {
  label: string;
  className: string;
};

const FULFILLMENT_STYLES: Record<OrderFulfillmentStatus, StatusBadgeStyle> = {
  confirmed: {
    label: "Confirmed",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  preparing: {
    label: "Processing",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  shipped: {
    label: "Shipped",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  delivered: {
    label: "Delivered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

const PAYMENT_STYLES: Record<OrderPaymentStatus, StatusBadgeStyle> = {
  pending: { label: "Pending", className: "border-[#e3e5e7] bg-[#f6f6f7] text-[#6d7175]" },
  awaiting_payment_verification: {
    label: "Verifying payment",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  authorized: { label: "Authorized", className: "border-sky-200 bg-sky-50 text-sky-800" },
  paid: { label: "Paid", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  cod_pending: { label: "COD pending", className: "border-amber-200 bg-amber-50 text-amber-900" },
  failed: { label: "Failed", className: "border-rose-200 bg-rose-50 text-rose-800" },
  refunded: { label: "Refunded", className: "border-violet-200 bg-violet-50 text-violet-800" },
  refund_requested: {
    label: "Refund requested",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  refund_approved: {
    label: "Refund approved",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  refund_rejected: {
    label: "Refund rejected",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  payment_abandoned: {
    label: "Abandoned",
    className: "border-[#e3e5e7] bg-[#f6f6f7] text-[#6d7175]",
  },
  payment_failed: { label: "Payment failed", className: "border-rose-200 bg-rose-50 text-rose-800" },
  payment_recovered: {
    label: "Payment recovered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function fulfillmentBadge(status: OrderFulfillmentStatus): StatusBadgeStyle {
  return FULFILLMENT_STYLES[status] ?? { label: status, className: "border-[#e3e5e7] bg-[#f6f6f7] text-[#202223]" };
}

export function paymentBadge(status: OrderPaymentStatus): StatusBadgeStyle {
  return PAYMENT_STYLES[status] ?? { label: status, className: "border-[#e3e5e7] bg-[#f6f6f7] text-[#202223]" };
}

export const FULFILLMENT_STEPS: { id: OrderFulfillmentStatus; label: string }[] = [
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export function fulfillmentStepIndex(status: OrderFulfillmentStatus): number {
  if (status === "cancelled") return -1;
  const i = FULFILLMENT_STEPS.findIndex((s) => s.id === status);
  return i >= 0 ? i : 0;
}
