import { parsePriceLabelToNumber } from "@/lib/admin/parse-price";
import {
  getBaseCurrency,
  getFxRate,
  getPayPalCheckoutCurrency,
  type CurrencyCode,
} from "@/lib/currency/config";

export type MoneyMinor = {
  amountCents: number;
  currency: CurrencyCode;
};

export type PayPalMoney = {
  currency_code: string;
  value: string;
};

/** Infer display currency from a checkout price label (fallback when price_cents unavailable). */
export function currencyFromPriceLabel(priceLabel: string): CurrencyCode {
  if (/\bDH\b|\bMAD\b/i.test(priceLabel)) return "MAD";
  if (/€|EUR/i.test(priceLabel)) return "EUR";
  if (/\$\s*USD|\bUSD\b|\$/i.test(priceLabel)) return "USD";
  return getBaseCurrency();
}

/** Subtotal in minor units from catalog cents or price label. */
export function subtotalMinorFromCheckout(
  priceLabel: string,
  qty: number,
  priceCents?: number,
): MoneyMinor {
  const currency = priceCents !== undefined ? getBaseCurrency() : currencyFromPriceLabel(priceLabel);
  if (typeof priceCents === "number" && Number.isFinite(priceCents) && priceCents >= 0) {
    return {
      amountCents: Math.max(0, Math.round(priceCents)) * Math.max(1, Math.min(5, Math.floor(qty))),
      currency,
    };
  }
  const unit = parsePriceLabelToNumber(priceLabel);
  return {
    amountCents: Math.round(unit * 100) * Math.max(1, Math.min(5, Math.floor(qty))),
    currency,
  };
}

export function totalMinorAfterDiscount(subtotal: MoneyMinor, discountCents: number): MoneyMinor {
  const dc = Math.max(0, Math.floor(discountCents));
  return {
    currency: subtotal.currency,
    amountCents: Math.max(0, subtotal.amountCents - Math.min(dc, subtotal.amountCents)),
  };
}

/** Convert minor units between currencies using configured FX (server-only). */
export function convertMinorUnits(amount: MoneyMinor, toCurrency: CurrencyCode): MoneyMinor {
  if (amount.currency === toCurrency) return amount;
  const rate = getFxRate(amount.currency, toCurrency);
  const major = amount.amountCents / 100;
  const convertedMajor = major * rate;
  return {
    currency: toCurrency,
    amountCents: Math.max(0, Math.round(convertedMajor * 100)),
  };
}

export function minorToPayPalAmount(money: MoneyMinor): PayPalMoney {
  const major = money.amountCents / 100;
  return {
    currency_code: money.currency,
    value: major.toFixed(2),
  };
}

/**
 * Server-authoritative PayPal purchase unit for checkout (qty + discount).
 * Uses catalog base currency → PayPal settlement currency conversion.
 */
export function computePayPalAmountFromCheckout(
  priceLabel: string,
  qty: number,
  discountCents = 0,
  opts?: { priceCents?: number },
): PayPalMoney {
  const subtotal = subtotalMinorFromCheckout(priceLabel, qty, opts?.priceCents);
  const total = totalMinorAfterDiscount(subtotal, discountCents);
  const paypalCurrency = getPayPalCheckoutCurrency();
  const inPayPal = convertMinorUnits(total, paypalCurrency);
  return minorToPayPalAmount(inPayPal);
}

export type CurrencyMismatchLog = {
  context: string;
  displayCurrency: string;
  paymentCurrency: string;
  displayValue: string;
  paymentValue: string;
  priceLabel: string;
};

const loggedCurrencyContexts = new Set<string>();

/** Log when UI/display currency differs from PayPal charge currency (expected for EUR/MAD → USD in Sandbox). */
export function logCurrencyMismatch(info: CurrencyMismatchLog): void {
  if (process.env.NODE_ENV === "test") return;
  if (loggedCurrencyContexts.has(info.context)) return;
  loggedCurrencyContexts.add(info.context);
  console.info(
    "[currency] Display vs PayPal currency (expected in Sandbox when cart is EUR/MAD and PayPal charges USD):",
    JSON.stringify({ ...info, at: new Date().toISOString() }),
  );
}
