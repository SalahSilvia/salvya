/**
 * Back-compat exports for the Salvya customer bag.
 * Prefer `useBag()` from `@/components/cart/BagProvider` in React components.
 */

import { CART_CHANGED_EVENT, dispatchCartChanged, subscribeCart } from "@/lib/cart/events";
import { checkoutUrlForLine, makeCartLineId, productPageHrefForLine } from "@/lib/cart/line-id";
import {
  migrateLegacyBagToGuestIfNeeded,
  readGuestCartLocal,
  writeGuestCartLocal,
} from "@/lib/cart/local-cart";
import { addLineToCart, cartTotalQty, removeLineFromCart } from "@/lib/cart/operations";
import { CART_MAX_QTY_PER_LINE, type CartLine } from "@/lib/cart/types";

export const PREVIEW_BAG_STORAGE_KEY = "salvya-preview-bag-v1";
export const PREVIEW_BAG_CHANGED = CART_CHANGED_EVENT;
export const PREVIEW_BAG_MAX_QTY_PER_LINE = CART_MAX_QTY_PER_LINE;

export type PreviewBagLineV1 = CartLine;

export { makeCartLineId as makePreviewBagLineId };
export { productPageHrefForLine, checkoutUrlForLine };

export function loadPreviewBag(): CartLine[] {
  return migrateLegacyBagToGuestIfNeeded();
}

export function savePreviewBag(lines: CartLine[]): void {
  writeGuestCartLocal(lines);
  dispatchCartChanged();
}

export function previewBagTotalQty(lines: CartLine[] = loadPreviewBag()): number {
  return cartTotalQty(lines);
}

export { dispatchCartChanged as dispatchPreviewBagChanged };

export function subscribePreviewBag(onChange: () => void): () => void {
  return subscribeCart(onChange);
}

export type AddPreviewBagLineInput = Omit<CartLine, "v" | "lineId" | "qty" | "addedAt" | "updatedAt"> & {
  qty: number;
};

export function addPreviewBagLine(input: AddPreviewBagLineInput): CartLine[] {
  const next = addLineToCart(loadPreviewBag(), input);
  savePreviewBag(next);
  return next;
}

export function removePreviewBagLine(lineId: string): CartLine[] {
  const next = removeLineFromCart(loadPreviewBag(), lineId);
  savePreviewBag(next);
  return next;
}

export function clearPreviewBag(): CartLine[] {
  savePreviewBag([]);
  return [];
}
