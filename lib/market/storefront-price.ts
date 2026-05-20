import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { priceLabelForContext, resolveDisplayPrice } from "@/lib/market/resolve-display-price";
import type { MarketContext } from "@/lib/market/market-context";

export {
  pricingFromStorefrontProduct,
  pricingFromStorefrontProduct as pricingFromStorefront,
} from "@/lib/market/resolve-display-price";

import type { UserMarket } from "@/lib/market/types";

function contextFromUserMarket(market: UserMarket): MarketContext {
  return {
    marketCode: market.marketCode,
    currency: market.currency,
    displayCurrency: market.currency,
    countryCode: market.countryCode,
    locale: "en",
    originalBaseCurrency: "EUR",
    source: market.source,
  };
}

export function marketPriceLabelForProduct(
  product: StorefrontProduct,
  market: MarketContext | UserMarket,
): string {
  const ctx = "locale" in market ? market : contextFromUserMarket(market);
  return priceLabelForContext(product, ctx);
}

export async function resolveStorefrontPriceLabels(
  product: StorefrontProduct,
  userId?: string | null,
  locale?: MarketContext["locale"],
): Promise<{ market: MarketContext; priceLabel: string; compareAtLabel: string | null }> {
  const market = await getMarketContext({ userId, locale });
  const priceLabel = priceLabelForContext(product, market);
  return { market, priceLabel, compareAtLabel: null };
}

export async function resolveStorefrontDisplayPrice(
  product: StorefrontProduct,
  userId?: string | null,
) {
  const market = await getMarketContext({ userId });
  return { context: market, ...resolveDisplayPrice(product, market, { includeKind: true }) };
}
