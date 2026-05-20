import { analyticsValueFromPriceLabel } from "@/lib/analytics/currency-value";
import { utmToMetaCustomData } from "@/lib/analytics/utm";
import { shouldEnableMarketing } from "@/lib/cookie-consent";

const PIXEL_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_META_PIXEL_ID
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID.trim()
    : "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    __salvyaMetaPixelInitPromise?: Promise<void>;
    __salvyaMetaPixelInited?: boolean;
  }
}

function isDebug(): boolean {
  return process.env.NODE_ENV !== "production";
}

function debugLog(message: string, payload?: unknown) {
  if (isDebug()) {
    // eslint-disable-next-line no-console -- dev-only analytics verification
    console.log(`[Salvya Meta Pixel] ${message}`, payload ?? "");
  }
}

function mergePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const utm = utmToMetaCustomData();
  return Object.keys(utm).length ? { ...payload, ...utm } : { ...payload };
}

function safeFbq(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch (e) {
    debugLog("fbq call error", e);
  }
}

/**
 * Loads `fbevents.js` once, calls `fbq('init', pixelId)` once.
 * Safe to call from any client analytics hook.
 */
export function initMetaPixel(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!PIXEL_ID) {
    debugLog("disabled (NEXT_PUBLIC_META_PIXEL_ID unset)");
    return Promise.resolve();
  }

  if (window.__salvyaMetaPixelInitPromise) return window.__salvyaMetaPixelInitPromise;

  window.__salvyaMetaPixelInitPromise = new Promise<void>((resolve) => {
    const finish = () => {
      if (!window.__salvyaMetaPixelInited) {
        safeFbq("init", PIXEL_ID);
        window.__salvyaMetaPixelInited = true;
        debugLog("initialized", { pixelId: PIXEL_ID });
      }
      resolve();
    };

    if (document.getElementById("salvya-meta-fbevents")) {
      finish();
      return;
    }

    const t = document.createElement("script");
    t.id = "salvya-meta-fbevents";
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    t.onload = () => finish();
    t.onerror = () => {
      debugLog("script failed to load");
      resolve();
    };

    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(t, first);
  });

  return window.__salvyaMetaPixelInitPromise;
}

function track(event: string, payload: Record<string, unknown> = {}) {
  const merged = mergePayload(payload);
  debugLog(`track → ${event}`, merged);
  safeFbq("track", event, merged);
}

export async function trackPageView(): Promise<void> {
  if (!shouldEnableMarketing()) return;
  await initMetaPixel();
  if (!PIXEL_ID) return;
  track("PageView", {});
}

export type ViewContentPayload = {
  contentId: string;
  contentName: string;
  contentCategory: string;
  currency: string;
  value: number;
};

export async function trackViewContent(input: ViewContentPayload): Promise<void> {
  if (!shouldEnableMarketing()) return;
  await initMetaPixel();
  if (!PIXEL_ID) return;
  track("ViewContent", {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    content_category: input.contentCategory,
    value: input.value,
    currency: input.currency,
    contents: [{ id: input.contentId, quantity: 1, item_price: input.value }],
  });
}

export type AddToCartPayload = {
  contentId: string;
  contentName: string;
  priceLabel: string;
  quantity: number;
};

export async function trackAddToCart(input: AddToCartPayload): Promise<void> {
  if (!shouldEnableMarketing()) return;
  await initMetaPixel();
  if (!PIXEL_ID) return;
  const { value, currency } = analyticsValueFromPriceLabel(input.priceLabel, input.quantity);
  const unit = input.quantity > 0 ? Math.round((value / input.quantity) * 100) / 100 : value;
  track("AddToCart", {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    value,
    currency,
    contents: [{ id: input.contentId, quantity: input.quantity, item_price: unit }],
  });
}

export type InitiateCheckoutPayload = {
  priceLabel: string;
  recapQty: number;
  contentId: string;
  contentName: string;
};

export async function trackInitiateCheckout(input: InitiateCheckoutPayload): Promise<void> {
  if (!shouldEnableMarketing()) return;
  await initMetaPixel();
  if (!PIXEL_ID) return;
  const { value, currency } = analyticsValueFromPriceLabel(input.priceLabel, input.recapQty);
  const unit = input.recapQty > 0 ? Math.round((value / input.recapQty) * 100) / 100 : value;
  track("InitiateCheckout", {
    value,
    currency,
    num_items: input.recapQty,
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    contents: [{ id: input.contentId, quantity: input.recapQty, item_price: unit }],
  });
}

export type PurchaseLine = {
  id: string;
  quantity: number;
  item_price: number;
  title: string;
};

export type PurchasePayload = {
  orderNumber: string;
  value: number;
  currency: string;
  contents: PurchaseLine[];
  /** Align with future Meta CAPI deduplication */
  eventId?: string;
};

export async function trackPurchase(input: PurchasePayload): Promise<void> {
  if (!shouldEnableMarketing()) return;
  await initMetaPixel();
  if (!PIXEL_ID) return;
  const content_ids = input.contents.map((c) => c.id);
  const eventID = input.eventId ?? `salvya_order_${input.orderNumber}`;
  const merged = mergePayload({
    value: input.value,
    currency: input.currency,
    content_ids,
    content_type: "product",
    contents: input.contents.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      item_price: c.item_price,
    })),
    order_id: input.orderNumber,
  });
  debugLog("track → Purchase", { ...merged, eventID });
  safeFbq("track", "Purchase", merged, { eventID });
}
