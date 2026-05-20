import type { CustomerOrder, OrderFulfillmentStatus } from "@/lib/orders/types";

export function fulfillmentStatusLabel(status: OrderFulfillmentStatus): string {
  if (status === "preparing") return "Preparing";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Confirmed";
}

export function fulfillmentStatusHeadline(status: OrderFulfillmentStatus): string {
  if (status === "preparing") return "Preparing your order";
  if (status === "shipped") return "Shipped — on the way";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Order confirmed";
}

export function fulfillmentStatusTone(status: OrderFulfillmentStatus): string {
  if (status === "preparing") return "text-amber-200/90";
  if (status === "shipped") return "text-sky-200/90";
  if (status === "delivered") return "text-emerald-200/90";
  if (status === "cancelled") return "text-rose-200/80";
  return "text-white/55";
}

export function orderTrackHref(order: CustomerOrder): string {
  const email = order.shipping.buyerEmail.trim();
  return `/track-order?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(email)}`;
}

export function orderDetailHref(order: CustomerOrder): string {
  return `/orders/${order.id}`;
}

export function orderListLabel(order: CustomerOrder): string {
  const li = order.lineItem;
  return `${li.qty}× ${li.displayTitle} · ${li.colorLabel}`;
}
