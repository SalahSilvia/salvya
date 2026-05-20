import type { SalvyaProductCategory } from "@/lib/admin/types";
import { buildDefaultMarketPrices, defaultsForCategory } from "@/lib/market/defaults";
import type { MarketPricesMap } from "@/lib/market/types";

export type ImportMarketPricing = {
  priceEur: number;
  priceUsd: number;
  priceMad: number;
  priceCents: number;
  marketPrices: MarketPricesMap;
};

/** Default list prices when importing folder / legacy catalog rows (sync only). */
export function importPricingForCategory(category: SalvyaProductCategory): ImportMarketPricing {
  const d = defaultsForCategory(category);
  const marketPrices = buildDefaultMarketPrices(category);
  return {
    priceEur: d.eur,
    priceUsd: d.usd,
    priceMad: d.mad,
    priceCents: Math.round(d.eur * 100),
    marketPrices,
  };
}

/** @deprecated Use importPricingForCategory — kept for scripts referencing labels. */
export const IMPORT_HOODIE_PRICE_CENTS = importPricingForCategory("hoodie").priceCents;
export const IMPORT_TEE_PRICE_CENTS = importPricingForCategory("tee").priceCents;
export const IMPORT_HOODIE_PRICE_LABEL = "250 DH";
export const IMPORT_TEE_PRICE_LABEL = "175 DH";
export const IMPORT_DEFAULT_STOCK = 12;
