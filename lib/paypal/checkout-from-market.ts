import type { CurrencyCode } from "@/lib/currency/config";
import { convertMinorUnits } from "@/lib/currency/convert";
import { getPayPalCheckoutCurrency } from "@/lib/currency/config";
import type { PayPalCheckoutAmount } from "@/lib/paypal/checkout-amount";
import type { ResolvedMarketPrice } from "@/lib/market/types";

/**
 * PayPal charge amount from server market quote (never from client labels).
 */
export function computePayPalFromMarketLine(
  lineTotal: ResolvedMarketPrice,
  discountCentsInMarket = 0,
): PayPalCheckoutAmount {
  const dc = Math.max(0, Math.floor(discountCentsInMarket));
  const lineCents = Math.max(0, lineTotal.unitCents - Math.min(dc, lineTotal.unitCents));
  const paypalCurrency = getPayPalCheckoutCurrency();

  if (lineTotal.currency === paypalCurrency) {
    return {
      currency_code: paypalCurrency,
      value: (lineCents / 100).toFixed(2),
    };
  }

  const converted = convertMinorUnits(
    { amountCents: lineCents, currency: lineTotal.currency as CurrencyCode },
    paypalCurrency,
  );
  return {
    currency_code: paypalCurrency,
    value: (converted.amountCents / 100).toFixed(2),
  };
}
