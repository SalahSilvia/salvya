import type { CustomerEmailsBundle } from "@/lib/email/types";
import type { OrderLineItem } from "@/lib/orders/types";

export type EmailMergeContext = Record<string, string>;

export function mergeEmailText(template: string, ctx: EmailMergeContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => ctx[key] ?? `{{${key}}}`);
}

export function sampleMergeContext(bundle: CustomerEmailsBundle): EmailMergeContext {
  const origin =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
      : "https://salvyastore.com";
  return {
    customer_name: "Alex",
    customer_email: "alex@example.com",
    order_number: "SVY-482910",
    product_title: "Salvya Essential Hoodie",
    order_total: "€89.00",
    tracking_number: "MA123456789MA",
    tracking_url: "https://www.dhl.com/track",
    store_name: bundle.global.fromName || "Salvya",
    support_email: bundle.global.supportEmail || "support@salvyastore.com",
    track_order_url: `${origin}/track-order?order=SVY-482910&email=alex@example.com`,
    cart_url: `${origin}/shop`,
    discount_code: "SALVYA10",
    artist_name: "ElGrandeToto",
    collection_name: "Spring Drop 2026",
    unsubscribe_url: `${origin}/contact`,
  };
}

export function mergeContextFromOrder(
  order: {
    orderNumber: string;
    shipping: { buyerName: string; buyerEmail: string };
    lineItem: Pick<OrderLineItem, "displayTitle" | "priceLabel" | "artistSlug">;
    orderCurrency?: string | null;
    finalPrice?: number | null;
    shippingMeta?: { trackingNumber?: string; trackingUrl?: string };
  },
  bundle: CustomerEmailsBundle,
  siteOrigin: string,
): EmailMergeContext {
  const first = order.shipping.buyerName.trim().split(/\s+/)[0] || "there";
  const email = order.shipping.buyerEmail.trim().toLowerCase();
  const trackUrl = `${siteOrigin}/track-order?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(email)}`;
  return {
    customer_name: first,
    customer_email: email,
    order_number: order.orderNumber,
    product_title: order.lineItem.displayTitle,
    order_total: order.lineItem.priceLabel,
    order_display_currency: order.orderCurrency ?? "",
    order_charge_currency: "EUR",
    order_final_price:
      typeof order.finalPrice === "number" && Number.isFinite(order.finalPrice)
        ? String(order.finalPrice)
        : "",
    tracking_number: order.shippingMeta?.trackingNumber ?? "",
    tracking_url: order.shippingMeta?.trackingUrl ?? trackUrl,
    store_name: bundle.global.fromName || "Salvya",
    support_email: bundle.global.supportEmail,
    track_order_url: trackUrl,
    cart_url: `${siteOrigin}/shop`,
    discount_code: "",
    artist_name: order.lineItem.artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    collection_name: order.lineItem.displayTitle,
    unsubscribe_url: `${siteOrigin}/contact`,
  };
}
