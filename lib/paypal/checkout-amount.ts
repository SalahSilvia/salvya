import {
  computePayPalAmountFromCheckout,
  logCurrencyMismatch,
  type PayPalMoney,
} from "@/lib/currency/convert";
import { currencyFromPriceLabel } from "@/lib/currency/convert";
import { getPayPalCheckoutCurrency } from "@/lib/currency/config";

export type PayPalCheckoutAmount = PayPalMoney;

/**
 * Server-authoritative PayPal purchase unit (qty + optional discount).
 * Prefer `priceCents` from Supabase when available.
 */
export function computePayPalCheckoutTotal(
  priceLabel: string,
  qty: number,
  discountCents = 0,
  opts?: { priceCents?: number },
): PayPalCheckoutAmount {
  const amount = computePayPalAmountFromCheckout(priceLabel, qty, discountCents, opts);
  const displayCurrency = currencyFromPriceLabel(priceLabel);
  const paymentCurrency = getPayPalCheckoutCurrency();
  if (displayCurrency !== paymentCurrency) {
    logCurrencyMismatch({
      context: "computePayPalCheckoutTotal",
      displayCurrency,
      paymentCurrency,
      displayValue: priceLabel,
      paymentValue: `${amount.value} ${amount.currency_code}`,
      priceLabel,
    });
  }
  return amount;
}
