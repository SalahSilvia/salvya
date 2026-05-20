import type { CustomerOrder } from "@/lib/orders/types";
import { adminOrderTotalCents } from "@/lib/admin/order-money";
import { carrierLabel } from "@/lib/admin/shipping-carriers";

function escCell(v: string) {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function ordersToCsv(orders: CustomerOrder[]): string {
  const header = [
    "order_number",
    "created_at",
    "buyer_email",
    "buyer_name",
    "country",
    "payment_method",
    "payment_status",
    "fulfillment_status",
    "total_eur",
    "product_title",
    "qty",
    "tracking_number",
    "carrier",
    "tracking_url",
  ].join(",");

  const rows = orders.map((o) => {
    const cents = adminOrderTotalCents(o);
    return [
      o.orderNumber,
      o.createdAt,
      o.shipping.buyerEmail,
      o.shipping.buyerName,
      o.shipping.buyerCountry,
      o.payment.method,
      o.paymentStatus,
      o.fulfillmentStatus,
      (cents / 100).toFixed(2),
      o.lineItem.displayTitle,
      String(o.lineItem.qty),
      o.shipping.trackingNumber ?? "",
      carrierLabel(o.shipping.carrier),
      o.shipping.trackingUrl ?? "",
    ]
      .map((c) => escCell(String(c ?? "")))
      .join(",");
  });

  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
