import type { CurrencyCode } from "@/lib/currency/config";

/** Commercial region for list pricing (not the same as shipping country). */
export type MarketCode = "MA" | "EU" | "US";

export type MarketPriceEntry = {
  currency: CurrencyCode;
  /** Major units (e.g. 45.00 EUR, 250 MAD). */
  price: number;
};

export type MarketPricesMap = Partial<Record<MarketCode, MarketPriceEntry>>;

export type UserMarket = {
  marketCode: MarketCode;
  currency: CurrencyCode;
  countryCode: string | null;
  source: "profile" | "cookie" | "default";
};

export type ResolvedMarketPrice = {
  marketCode: MarketCode;
  currency: CurrencyCode;
  /** Major units (one unit). */
  unitAmount: number;
  /** Minor units (one unit). */
  unitCents: number;
  /** Formatted for display (no kind suffix). */
  displayPrice: string;
};
