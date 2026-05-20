import type { CustomerOrder } from "@/lib/orders/types";
import { carrierLabel } from "@/lib/admin/shipping-carriers";

function escCell(v: string) {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** Warehouse / carrier handoff export with full ship-to address. */
export function ordersToPackingCsv(orders: CustomerOrder[]): string {
  const header = [
    "order_number",
    "buyer_name",
    "buyer_phone",
    "buyer_email",
    "address",
    "city",
    "country",
    "product",
    "size",
    "color",
    "qty",
    "fulfillment_status",
    "carrier",
    "tracking_number",
    "tracking_url",
  ].join(",");

  const rows = orders.map((o) => {
    const li = o.lineItem;
    return [
      o.orderNumber,
      o.shipping.buyerName,
      o.shipping.buyerPhone,
      o.shipping.buyerEmail,
      o.shipping.buyerAddress,
      o.shipping.buyerCity,
      o.shipping.buyerCountry,
      li.displayTitle,
      li.size,
      li.colorLabel,
      String(li.qty),
      o.fulfillmentStatus,
      carrierLabel(o.shipping.carrier),
      o.shipping.trackingNumber ?? "",
      o.shipping.trackingUrl ?? "",
    ]
      .map((c) => escCell(String(c ?? "")))
      .join(",");
  });

  return [header, ...rows].join("\n");
}
