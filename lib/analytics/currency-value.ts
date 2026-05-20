import { parsePaypalPurchaseUnit } from "@/lib/paypal-amount";

/** Display / shop currency + numeric value for analytics (matches price labels). */
export function analyticsValueFromPriceLabel(priceLabel: string, qty: number): { value: number; currency: string } {
  const { currency_code, value } = parsePaypalPurchaseUnit(priceLabel);
  const unit = Number.parseFloat(value);
  const safeUnit = Number.isFinite(unit) ? unit : 0;
  const q = Math.max(1, qty);
  return {
    currency: currency_code,
    value: Math.round(safeUnit * q * 100) / 100,
  };
}
