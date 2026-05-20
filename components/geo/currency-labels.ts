import type { CurrencyCode } from "@/lib/currency/config";

/** Human label for geo suggestion copy (e.g. "EUR €"). */
export function currencyDisplayLabel(currency: CurrencyCode, locale?: string): string {
  const tag = locale ?? "en";
  const sample = new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(0);
  const symbol = sample.replace(/[\d\s.,]/g, "").trim() || currency;
  return `${currency} ${symbol}`.trim();
}
