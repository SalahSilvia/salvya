import { computePayPalAmountFromCheckout, minorToPayPalAmount, subtotalMinorFromCheckout } from "@/lib/currency/convert";
import { getPayPalCheckoutCurrency } from "@/lib/currency/config";

/** @deprecated Use server `computePayPalCheckoutTotal` / `/api/paypal/orders` — kept for legacy imports. */
export function parsePaypalPurchaseUnit(priceLabel: string): { currency_code: string; value: string } {
  const sub = subtotalMinorFromCheckout(priceLabel, 1);
  return minorToPayPalAmount(sub);
}

/** @deprecated Use `getPayPalCheckoutCurrency` from `@/lib/currency/config`. */
export function readOptionalPaypalCheckoutCurrency(): string | null {
  return getPayPalCheckoutCurrency();
}

/** @deprecated Removed hardcoded rate — configure `SALVYA_FX_MAD_USD` instead. */
export const APPROX_MAD_PER_USD = 10;

/**
 * @deprecated Server-only conversion — do not use on client for payment amounts.
 * Returns PayPal settlement amount via `computePayPalAmountFromCheckout`.
 */
export function paypalCheckoutFromPriceLabel(priceLabel: string): { currency_code: string; value: string } {
  return computePayPalAmountFromCheckout(priceLabel, 1, 0);
}
