import { parsePriceLabelToNumber } from "@/lib/admin/parse-price";

export type CouponResult =
  | { ok: true; code: string; discountCents: number; label: string }
  | { ok: false; error: string };

/** Built-in codes; admin Settings can extend later via store_settings.coupons */
const BUILTIN: Record<
  string,
  { type: "percent"; value: number; label: string } | { type: "fixed_eur"; value: number; label: string }
> = {
  SALVYA10: { type: "percent", value: 10, label: "10% off" },
  WELCOME5: { type: "fixed_eur", value: 5, label: "€5 off" },
  FAN15: { type: "percent", value: 15, label: "15% off (fans)" },
};

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function applyCouponToSubtotal(
  code: string,
  subtotalCents: number,
  priceLabel: string,
): CouponResult {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: false, error: "Enter a promo code" };

  const rule = BUILTIN[normalized];
  if (!rule) return { ok: false, error: "This code is not valid" };

  let discountCents = 0;
  if (rule.type === "percent") {
    discountCents = Math.round((subtotalCents * rule.value) / 100);
  } else {
    const isEur = /€|EUR/i.test(priceLabel);
    if (!isEur) {
      return { ok: false, error: "This code only applies to EUR-priced items" };
    }
    discountCents = Math.round(rule.value * 100);
  }

  discountCents = Math.min(discountCents, subtotalCents);
  if (discountCents <= 0) return { ok: false, error: "Cart is too small for this code" };

  return { ok: true, code: normalized, discountCents, label: rule.label };
}

export function formatDiscountLine(discountCents: number, priceLabel: string): string {
  const isEur = /€|EUR/i.test(priceLabel);
  const isMad = /\bDH\b|\bMAD\b/i.test(priceLabel);
  const amount = discountCents / 100;
  if (isEur) return `-€${amount.toFixed(2)}`;
  if (isMad) return `-${amount.toFixed(0)} DH`;
  return `-${amount.toFixed(2)}`;
}

export function subtotalCentsFromCheckout(priceLabel: string, qty: number): number {
  const unit = parsePriceLabelToNumber(priceLabel);
  return Math.round(unit * 100) * Math.max(1, qty);
}

export function totalCentsAfterDiscount(subtotalCents: number, discountCents: number): number {
  return Math.max(0, subtotalCents - Math.max(0, discountCents));
}
