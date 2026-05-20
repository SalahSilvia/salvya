import { fulfillmentBadge, paymentBadge } from "@/lib/admin/order-status-ui";
import type { OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

export function AdminFulfillmentBadge({ status }: { status: OrderFulfillmentStatus }) {
  const b = fulfillmentBadge(status);
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${b.className}`}
    >
      {b.label}
    </span>
  );
}

export function AdminPaymentBadge({ status }: { status: OrderPaymentStatus }) {
  const b = paymentBadge(status);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${b.className}`}>
      {b.label}
    </span>
  );
}
