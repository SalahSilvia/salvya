export type CurrencyCode = "EUR" | "USD" | "MAD" | "GBP" | "CHF";

/** Currencies shoppers can pick for display (checkout still uses EUR / PayPal rules). */
export const DISPLAY_CURRENCIES: readonly CurrencyCode[] = ["EUR", "USD", "MAD", "GBP", "CHF"];

const CURRENCY_RE = /^[A-Z]{3}$/;

function readEnvCurrency(key: string, fallback: CurrencyCode): CurrencyCode {
  const raw = typeof process !== "undefined" ? process.env[key] : undefined;
  if (!raw || typeof raw !== "string") return fallback;
  const parsed = parseDisplayCurrency(raw.trim());
  return parsed ?? fallback;
}

function readFxRate(key: string, fallback: number): number {
  const raw = typeof process !== "undefined" ? process.env[key] : undefined;
  if (!raw) return fallback;
  const n = Number.parseFloat(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseDisplayCurrency(raw: unknown): CurrencyCode | null {
  if (typeof raw !== "string") return null;
  const c = raw.trim().toUpperCase();
  if ((DISPLAY_CURRENCIES as readonly string[]).includes(c)) return c as CurrencyCode;
  return null;
}

/** Canonical store/catalog currency (price_cents are in this currency). */
export function getBaseCurrency(): CurrencyCode {
  return readEnvCurrency("SALVYA_BASE_CURRENCY", "EUR");
}

/** Currency charged through PayPal (server settlement). */
export function getPayPalCheckoutCurrency(): CurrencyCode {
  const forced =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_CURRENCY === "string"
      ? process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_CURRENCY.trim().toUpperCase()
      : "";
  if (forced && CURRENCY_RE.test(forced)) {
    const parsed = parseDisplayCurrency(forced);
    if (parsed && (parsed === "EUR" || parsed === "USD" || parsed === "MAD")) return parsed;
  }
  return readEnvCurrency("PAYPAL_CHECKOUT_CURRENCY", "USD");
}

/** 1 unit of `from` → `to` (major units, e.g. 1 EUR = rate USD). */
export function getFxRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  if (from === "EUR" && to === "USD") return readFxRate("SALVYA_FX_EUR_USD", 1.08);
  if (from === "USD" && to === "EUR") return 1 / getFxRate("EUR", "USD");
  if (from === "MAD" && to === "USD") return readFxRate("SALVYA_FX_MAD_USD", 0.1);
  if (from === "USD" && to === "MAD") return 1 / getFxRate("MAD", "USD");
  if (from === "EUR" && to === "MAD") return readFxRate("SALVYA_FX_EUR_MAD", 10.8);
  if (from === "MAD" && to === "EUR") return 1 / getFxRate("EUR", "MAD");
  if (from === "EUR" && to === "GBP") return readFxRate("SALVYA_FX_EUR_GBP", 0.86);
  if (from === "GBP" && to === "EUR") return 1 / getFxRate("EUR", "GBP");
  if (from === "EUR" && to === "CHF") return readFxRate("SALVYA_FX_EUR_CHF", 0.96);
  if (from === "CHF" && to === "EUR") return 1 / getFxRate("EUR", "CHF");
  if (from === "GBP" && to === "USD") return getFxRate("GBP", "EUR") * getFxRate("EUR", "USD");
  if (from === "USD" && to === "GBP") return 1 / getFxRate("GBP", "USD");
  if (from === "CHF" && to === "USD") return getFxRate("CHF", "EUR") * getFxRate("EUR", "USD");
  if (from === "USD" && to === "CHF") return 1 / getFxRate("CHF", "USD");
  if (from === "GBP" && to === "MAD") return getFxRate("GBP", "EUR") * getFxRate("EUR", "MAD");
  if (from === "MAD" && to === "GBP") return 1 / getFxRate("GBP", "MAD");
  if (from === "CHF" && to === "MAD") return getFxRate("CHF", "EUR") * getFxRate("EUR", "MAD");
  if (from === "MAD" && to === "CHF") return 1 / getFxRate("CHF", "MAD");
  if (from === "GBP" && to === "CHF") return getFxRate("GBP", "EUR") * getFxRate("EUR", "CHF");
  if (from === "CHF" && to === "GBP") return 1 / getFxRate("GBP", "CHF");
  return 1;
}
