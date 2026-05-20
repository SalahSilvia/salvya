import { convertMinorUnits, type MoneyMinor } from "@/lib/currency/convert";
import { getBaseCurrency, type CurrencyCode } from "@/lib/currency/config";

export type FormatPriceOptions = {
  currency?: CurrencyCode;
  locale?: string;
  /** Show currency code suffix (e.g. "€40 EUR"). */
  showCode?: boolean;
};

function localeTagForCurrency(currency: CurrencyCode, locale?: string): string {
  if (locale) return locale;
  switch (currency) {
    case "MAD":
      return "fr-MA";
    case "EUR":
      return "fr-FR";
    case "USD":
      return "en-US";
    case "GBP":
      return "en-GB";
    case "CHF":
      return "de-CH";
    default:
      return "en";
  }
}

export function formatMoneyMinor(money: MoneyMinor, opts?: FormatPriceOptions): string {
  const tag = localeTagForCurrency(money.currency, opts?.locale);
  const formatted = new Intl.NumberFormat(tag, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: "symbol",
    maximumFractionDigits: money.currency === "MAD" ? 0 : 2,
  }).format(money.amountCents / 100);

  if (opts?.showCode) {
    return `${formatted} ${money.currency}`;
  }
  return formatted;
}

/** Format catalog base cents in the shopper's display currency. */
export function formatBaseCentsForDisplay(
  cents: number,
  displayCurrency: CurrencyCode,
  opts?: Omit<FormatPriceOptions, "currency">,
): string {
  const base = getBaseCurrency();
  const safeCents = Math.max(0, Math.round(cents));
  if (displayCurrency === base) {
    return formatMoneyMinor({ amountCents: safeCents, currency: base }, opts);
  }
  const converted = convertMinorUnits({ amountCents: safeCents, currency: base }, displayCurrency);
  return formatMoneyMinor(converted, { ...opts, currency: displayCurrency });
}
