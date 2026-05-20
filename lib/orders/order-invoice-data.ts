import { checkoutCountryLabel } from "@/lib/checkout-country";
import {
  formatSkuDisplayText,
  resolveProductBarcodeValue,
} from "@/lib/barcode/product-barcode";
import type { ProductOrderSnapshot } from "@/lib/orders/resolve-server-checkout";
import { fulfillmentStatusLabel } from "@/lib/orders/display";
import { formatOrderTotal } from "@/lib/orders/customer-order-actions";
import type { CustomerOrder, OrderLineItem } from "@/lib/orders/types";

export type OrderInvoiceLine = {
  title: string;
  kindLabel: string;
  size: string;
  colorLabel: string;
  qty: number;
  lineAmount: string;
  variantId: string;
  skuRaw: string;
  skuDisplay: string;
  gtin13: string | null;
};

export type OrderInvoiceDocument = {
  orderNumber: string;
  orderId: string;
  placedAt: string;
  placedAtIso: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shipTo: string;
  paymentLabel: string;
  fulfillmentLabel: string;
  currency: string;
  total: string;
  lines: OrderInvoiceLine[];
  proofNote: string;
};

function catalogCategory(productKind: OrderLineItem["productKind"]): string {
  return productKind === "tshirt" ? "tee" : "hoodie";
}

function resolveLineSku(
  line: OrderLineItem,
  snapshotSku: string | undefined,
  variantSkuById: Map<string, string>,
): { skuRaw: string; skuDisplay: string; gtin13: string | null } {
  const skuRaw =
    snapshotSku?.trim() ||
    variantSkuById.get(line.variantId)?.trim() ||
    line.variantId.slice(0, 8).toUpperCase();

  const gtin13 = resolveProductBarcodeValue({
    sku: skuRaw,
    slug: line.itemSlug,
    artistSlug: line.artistSlug,
    category: catalogCategory(line.productKind),
  });

  const skuDisplay = gtin13 ? formatSkuDisplayText(gtin13) : skuRaw;

  return { skuRaw, skuDisplay, gtin13 };
}

function isProductSnapshot(x: unknown): x is ProductOrderSnapshot {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.variantSku === "string" && typeof o.variantId === "string";
}

export function orderLinesForInvoice(order: CustomerOrder): OrderLineItem[] {
  const bag = order.lineItem.bagLines;
  if (bag?.length) return bag;
  return [order.lineItem];
}

export function buildOrderInvoiceDocument(
  order: CustomerOrder,
  productSnapshot: unknown,
  variantSkuById: Map<string, string> = new Map(),
): OrderInvoiceDocument {
  const snapshot = isProductSnapshot(productSnapshot) ? productSnapshot : null;
  const lines = orderLinesForInvoice(order);
  const currency = order.orderCurrency ?? snapshot?.currency ?? "";

  const invoiceLines: OrderInvoiceLine[] = lines.map((line) => {
    const snapForLine =
      lines.length === 1 && snapshot?.variantId === line.variantId ? snapshot.variantSku : undefined;
    const { skuRaw, skuDisplay, gtin13 } = resolveLineSku(line, snapForLine, variantSkuById);

    return {
      title: line.displayTitle,
      kindLabel: line.kindLabel,
      size: line.size,
      colorLabel: line.colorLabel,
      qty: line.qty,
      lineAmount: line.priceLabel,
      variantId: line.variantId,
      skuRaw,
      skuDisplay,
      gtin13,
    };
  });

  const placed = new Date(order.createdAt);
  const placedAt = placed.toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shipTo = [
    order.shipping.buyerName,
    order.shipping.buyerAddress,
    `${order.shipping.buyerCity}, ${checkoutCountryLabel(order.shipping.buyerCountry)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const paymentLabel =
    order.payment.method === "cod"
      ? "Cash on delivery (COD)"
      : order.payment.instrument === "paypal_card"
        ? "PayPal · Card"
        : "PayPal";

  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    placedAt,
    placedAtIso: order.createdAt,
    buyerName: order.shipping.buyerName,
    buyerEmail: order.shipping.buyerEmail,
    buyerPhone: order.shipping.buyerPhone,
    shipTo,
    paymentLabel,
    fulfillmentLabel: fulfillmentStatusLabel(order.fulfillmentStatus),
    currency,
    total: formatOrderTotal(order),
    lines: invoiceLines,
    proofNote:
      "This document is issued by Salvya as proof of purchase. Retain it for warranty, customs, or refund inquiries. SKU / GTIN codes identify the exact variant purchased.",
  };
}

export function collectVariantIdsForInvoice(order: CustomerOrder): string[] {
  return orderLinesForInvoice(order).map((l) => l.variantId).filter(Boolean);
}
