import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/currency/config";
import type { MarketCode } from "@/lib/market/types";

/** Resolved shopper context for display pricing (never used for PayPal charge amount). */
export type MarketContext = {
  marketCode: MarketCode;
  /** Display currency shown in UI (EUR / USD / MAD). */
  currency: CurrencyCode;
  displayCurrency: CurrencyCode;
  countryCode: string | null;
  locale: AppLocale;
  /** Always EUR — authoritative checkout / PayPal base. */
  originalBaseCurrency: "EUR";
  source: "profile" | "cookie" | "default";
};

export type DisplayPriceResult = {
  displayPrice: string;
  currency: CurrencyCode;
  originalBasePrice: string;
  /** EUR minor units from catalog (price_cents / price_eur). */
  originalBaseCents: number;
  market: MarketCode;
  unitAmount: number;
  unitCents: number;
  /** Optional full shelf label (`45 € · Hoodie`). */
  priceLabel?: string;
};
