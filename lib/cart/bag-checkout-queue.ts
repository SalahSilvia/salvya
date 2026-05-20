import { saveBagCheckoutLines } from "@/lib/cart/bag-checkout-lines-session";
import type { CartLine } from "@/lib/cart/types";

/** Start unified bag checkout (all variants in one order summary and payment). */
export function startBagCheckout(lines: CartLine[]): string | null {
  if (!lines.length) return null;
  saveBagCheckoutLines(lines);
  return "/preview-bag/checkout";
}
