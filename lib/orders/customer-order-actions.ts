import { isMoroccoOrder } from "@/lib/orders/morocco-order";
import { orderToRefundPolicy } from "@/lib/orders/order-refund-policy";
import type { RefundEligibility } from "@/lib/orders/refund-policy";
import type { CustomerOrder } from "@/lib/orders/types";

export type CustomerOrderActions = {
  canCancel: boolean;
  cancelHref: string | null;
  cancelLabel: string;
  policyNote: string;
  showReturnsLink: boolean;
  returnsHref: string;
  showInvoice: boolean;
  isActive: boolean;
};

export function isOrderActive(order: CustomerOrder): boolean {
  return order.fulfillmentStatus !== "delivered" && order.fulfillmentStatus !== "cancelled";
}

export function buildCustomerOrderActions(
  order: CustomerOrder,
  eligibility: RefundEligibility,
): CustomerOrderActions {
  const morocco = isMoroccoOrder(orderToRefundPolicy(order));
  const cod = order.payment.method === "cod";

  return {
    canCancel: eligibility.eligible,
    cancelHref: eligibility.eligible ? `/account/refunds/${order.id}` : null,
    cancelLabel: cod && morocco ? "Cancel order" : "Cancel & refund",
    policyNote: eligibility.reason,
    showReturnsLink: morocco && order.fulfillmentStatus === "delivered",
    returnsHref: "/returns",
    showInvoice: true,
    isActive: isOrderActive(order),
  };
}

export function formatOrderTotal(order: CustomerOrder): string {
  if (typeof order.finalPrice === "number" && Number.isFinite(order.finalPrice)) {
    return `${order.finalPrice} ${order.orderCurrency ?? ""}`.trim();
  }
  return order.lineItem.priceLabel;
}
