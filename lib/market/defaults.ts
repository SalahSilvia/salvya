import type { SalvyaProductCategory } from "@/lib/admin/types";
import type { MarketPricesMap } from "@/lib/market/types";

export type CategoryMarketDefaults = {
  eur: number;
  usd: number;
  mad: number;
};

export const HOODIE_MARKET_DEFAULTS: CategoryMarketDefaults = {
  eur: 45,
  usd: 49,
  mad: 250,
};

export const TEE_MARKET_DEFAULTS: CategoryMarketDefaults = {
  eur: 28,
  usd: 30,
  mad: 175,
};

export function defaultsForCategory(category: SalvyaProductCategory): CategoryMarketDefaults {
  if (category === "tee") return TEE_MARKET_DEFAULTS;
  return HOODIE_MARKET_DEFAULTS;
}

export function buildDefaultMarketPrices(category: SalvyaProductCategory): MarketPricesMap {
  const d = defaultsForCategory(category);
  return {
    MA: { currency: "MAD", price: d.mad },
    EU: { currency: "EUR", price: d.eur },
    US: { currency: "USD", price: d.usd },
  };
}
