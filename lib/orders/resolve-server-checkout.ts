import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import { findVariantById, findVariantForSelection } from "@/lib/catalog/fetch-product-variants";
import { kindLabelFromProduct } from "@/lib/catalog/storefront-product";
import type { OrderLineItem } from "@/lib/orders/types";
import { getUserMarket } from "@/lib/market/get-user-market";
import { getMarketPrice, lineTotalForQty, type ProductPricingSource } from "@/lib/market/product-pricing";
import { pricingFromStorefrontProduct } from "@/lib/market/resolve-display-price";
import type { ResolvedMarketPrice } from "@/lib/market/types";
import { logFraudEvent } from "@/lib/security/fraud-log";
import type { UserMarket } from "@/lib/market/types";
import { logCheckoutEvent } from "@/lib/checkout/checkout-log";
import { formatMoneyMinor } from "@/lib/currency/display";
import type { CurrencyCode } from "@/lib/currency/config";
import { hasActiveCheckoutStockReservation } from "@/lib/inventory/checkout-reservation";

export type CheckoutQuoteOptions = {
  /** Placement key / checkout session — honors active stock holds after reserve-stock. */
  checkoutSessionId?: string;
};

export type ProductOrderSnapshot = {
  productId: string;
  variantId: string;
  variantSku: string;
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  title: string;
  size: string;
  colorId: string;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  marketCode: string;
  qty: number;
  capturedAt: string;
};

export type ServerCheckoutQuote = {
  productId: string;
  variantId: string;
  pricing: ProductPricingSource;
  market: UserMarket;
  unitPrice: ResolvedMarketPrice;
  lineTotal: ResolvedMarketPrice;
  qty: number;
  priceLabel: string;
  productSnapshot: ProductOrderSnapshot;
  availableStock: number;
};

function applyVariantPriceDelta(unit: ResolvedMarketPrice, deltaCents: number): ResolvedMarketPrice {
  if (!deltaCents) return unit;
  const unitCents = Math.max(0, unit.unitCents + deltaCents);
  const currency = unit.currency as CurrencyCode;
  return {
    ...unit,
    unitCents,
    unitAmount: unitCents / 100,
    displayPrice: formatMoneyMinor({ amountCents: unitCents, currency }, {}),
  };
}

/**
 * Authoritative checkout quote — never trust client price labels or amounts.
 */
export async function resolveServerCheckoutQuote(
  lineItem: OrderLineItem,
  userId?: string | null,
  options?: CheckoutQuoteOptions,
): Promise<
  | { ok: true; quote: ServerCheckoutQuote }
  | { ok: false; error: string; code: string; status: number }
> {
  const product = await fetchPublishedProductBySlug(lineItem.artistSlug, lineItem.itemSlug);
  if (!product) {
    logCheckoutEvent("resolveServerCheckoutQuote", "warn", {
      reason: "product_unavailable",
      artistSlug: lineItem.artistSlug,
      itemSlug: lineItem.itemSlug,
      variantId: lineItem.variantId,
    });
    return { ok: false, error: "Product is not available for checkout", code: "product_unavailable", status: 404 };
  }

  const kindOk =
    lineItem.productKind === "tshirt"
      ? product.productKind === "tshirt"
      : product.productKind === "hoodie";
  if (!kindOk) {
    return { ok: false, error: "Product is not available for checkout", code: "product_unavailable", status: 404 };
  }

  const qty = Math.max(1, Math.min(5, Math.floor(lineItem.qty)));

  const variant =
    findVariantById(product.variants, lineItem.variantId) ??
    findVariantForSelection(product.variants, lineItem.size, lineItem.colorId);

  if (!variant) {
    return { ok: false, error: "Variant is not available", code: "variant_unavailable", status: 404 };
  }

  if (lineItem.variantId.trim() !== variant.id) {
    logFraudEvent("variant_id_mismatch", {
      clientVariantId: lineItem.variantId,
      resolvedVariantId: variant.id,
      productId: product.id,
    });
    return { ok: false, error: "Invalid variant selection", code: "variant_unavailable", status: 400 };
  }

  const sessionId = options?.checkoutSessionId?.trim() ?? "";
  const physicallyAvailable = !variant.soldOut && variant.stock >= qty;
  let stockAllowed = physicallyAvailable;
  if (!stockAllowed && sessionId) {
    stockAllowed = await hasActiveCheckoutStockReservation(variant.id, qty, sessionId);
  }
  if (!stockAllowed) {
    logCheckoutEvent("resolveServerCheckoutQuote", "warn", {
      reason: "out_of_stock",
      variantId: variant.id,
      requestedQty: qty,
      availableStock: variant.stock,
      checkoutSessionId: sessionId || undefined,
    });
    return { ok: false, error: "This item is out of stock", code: "out_of_stock", status: 409 };
  }

  const pricing = pricingFromStorefrontProduct(product);
  const market = await getUserMarket(userId);
  const unitBase = getMarketPrice(pricing, market.marketCode);
  const unitPrice = applyVariantPriceDelta(unitBase, variant.priceDeltaCents);
  const lineTotal = lineTotalForQty(unitPrice, qty);
  const priceLabel = `${lineTotal.displayPrice} · ${kindLabelFromProduct(product)}`;

  const capturedAt = new Date().toISOString();
  const productSnapshot: ProductOrderSnapshot = {
    productId: product.id,
    variantId: variant.id,
    variantSku: variant.sku,
    artistSlug: product.artistSlug,
    itemSlug: product.slug,
    productKind: product.productKind,
    title: product.title,
    size: lineItem.size,
    colorId: lineItem.colorId,
    unitPrice: unitPrice.unitAmount,
    lineTotal: lineTotal.unitAmount,
    currency: lineTotal.currency,
    marketCode: market.marketCode,
    qty,
    capturedAt,
  };

  return {
    ok: true,
    quote: {
      productId: product.id,
      variantId: variant.id,
      pricing,
      market,
      unitPrice,
      lineTotal,
      qty,
      priceLabel,
      productSnapshot,
      availableStock: variant.stock,
    },
  };
}

/** Reject manipulated client payloads (log only — quote is authoritative). */
export function logClientPriceIgnored(lineItem: OrderLineItem, quote: ServerCheckoutQuote): void {
  if (lineItem.priceLabel.trim() !== quote.priceLabel.trim()) {
    logFraudEvent("price_label_mismatch", {
      clientLabel: lineItem.priceLabel,
      serverLabel: quote.priceLabel,
      productId: quote.productId,
      variantId: quote.variantId,
    });
  }
}
