import { applyCouponToSubtotal, subtotalCentsFromCheckout } from "@/lib/checkout/coupons";

export type ResolvedCheckoutDiscount = {
  discountCents: number;
  couponCode?: string;
};

/**
 * Server-side promo validation — never trust client discountCents alone.
 */
export function resolveCheckoutDiscount(
  priceLabel: string,
  qty: number,
  couponCode: string | undefined,
  clientDiscountCents: number | undefined,
): ResolvedCheckoutDiscount | { error: string } {
  const subtotalCents = subtotalCentsFromCheckout(priceLabel, qty);
  const code = couponCode?.trim();

  if (!code) {
    if (clientDiscountCents && clientDiscountCents > 0) {
      return { error: "Invalid discount on this order." };
    }
    return { discountCents: 0 };
  }

  const applied = applyCouponToSubtotal(code, subtotalCents, priceLabel);
  if (!applied.ok) {
    return { error: applied.error };
  }

  const client = Math.max(0, Math.floor(clientDiscountCents ?? 0));
  if (client !== applied.discountCents) {
    return { error: "Promo code no longer applies to this cart. Return to payment and re-apply it." };
  }

  return { discountCents: applied.discountCents, couponCode: applied.code };
}
