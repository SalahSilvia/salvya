import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { priceLabelForContext } from "@/lib/market/resolve-display-price";
import type { MarketContext } from "@/lib/market/market-context";

/**
 * @deprecated Use `getMarketContext()` + `resolveDisplayPrice()` / `priceLabelForContext()`.
 */
export async function catalogDisplayPriceOptions(userId?: string | null) {
  const ctx = await getMarketContext({ userId });
  return { currency: ctx.displayCurrency, locale: ctx.locale };
}

export async function catalogPriceLabelForProduct(product: StorefrontProduct, userId?: string | null) {
  const ctx = await getMarketContext({ userId });
  return priceLabelForContext(product, ctx);
}

export async function getCatalogMarketContext(userId?: string | null): Promise<MarketContext> {
  return getMarketContext({ userId });
}
