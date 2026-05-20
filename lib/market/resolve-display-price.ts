import { kindLabelFromProduct, type StorefrontProduct } from "@/lib/catalog/storefront-product";
import { convertMinorUnits } from "@/lib/currency/convert";
import { formatMoneyMinor } from "@/lib/currency/display";
import type { MarketContext, DisplayPriceResult } from "@/lib/market/market-context";
import {
  getMarketPrice,
  pricingFromProductRow,
  type ProductPricingSource,
} from "@/lib/market/product-pricing";

export function pricingFromStorefrontProduct(product: StorefrontProduct): ProductPricingSource {
  return pricingFromProductRow({
    id: product.id,
    category: product.category,
    price_cents: product.priceCents,
    price_eur: product.priceEur,
    price_usd: product.priceUsd,
    price_mad: product.priceMad,
    market_prices: product.marketPrices,
  });
}

export type ResolveDisplayPriceOptions = {
  includeKind?: boolean;
  qty?: number;
  locale?: string;
};

/**
 * Display-only price from Supabase market columns. Never used for PayPal / order charge.
 */
export function resolveDisplayPrice(
  product: StorefrontProduct | ProductPricingSource,
  marketContext: MarketContext,
  options?: ResolveDisplayPriceOptions,
): DisplayPriceResult {
  const pricing =
    "priceCents" in product && "marketPrices" in product
      ? pricingFromStorefrontProduct(product as StorefrontProduct)
      : (product as ProductPricingSource);

  const qty = Math.max(1, Math.min(5, Math.floor(options?.qty ?? 1)));
  const unit = getMarketPrice(pricing, marketContext.marketCode, options?.locale ?? marketContext.locale);
  const marketUnitCents = unit.unitCents * qty;
  const displayCurrency = marketContext.displayCurrency;
  const displayMoney =
    displayCurrency === unit.currency
      ? { amountCents: marketUnitCents, currency: unit.currency }
      : convertMinorUnits({ amountCents: marketUnitCents, currency: unit.currency }, displayCurrency);
  const displayPrice = formatMoneyMinor(displayMoney, {
    locale: options?.locale ?? marketContext.locale,
  });

  const eurCents = Math.max(0, Math.round((pricing.priceEur ?? pricing.priceCents / 100) * 100));
  const originalBasePrice = formatMoneyMinor(
    { amountCents: eurCents * qty, currency: "EUR" },
    { locale: options?.locale ?? marketContext.locale },
  );

  const kindSuffix =
    options?.includeKind && "title" in product
      ? kindLabelFromProduct(product as StorefrontProduct)
      : options?.includeKind
        ? ""
        : undefined;

  return {
    displayPrice,
    currency: displayCurrency,
    originalBasePrice,
    originalBaseCents: eurCents * qty,
    market: marketContext.marketCode,
    unitAmount: displayMoney.amountCents / 100,
    unitCents: displayMoney.amountCents,
    priceLabel: kindSuffix ? `${displayPrice} · ${kindSuffix}` : undefined,
  };
}

export function priceLabelForContext(
  product: StorefrontProduct,
  marketContext: MarketContext,
): string {
  return (
    resolveDisplayPrice(product, marketContext, { includeKind: true }).priceLabel ??
    `${resolveDisplayPrice(product, marketContext).displayPrice} · ${kindLabelFromProduct(product)}`
  );
}
