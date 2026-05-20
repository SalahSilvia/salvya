import { clearRemoteCart, fetchRemoteCart, pushRemoteCart } from "@/lib/cart/api-client";
import { dispatchCartChanged } from "@/lib/cart/events";
import {
  migrateLegacyBagToGuestIfNeeded,
  readGuestCartLocal,
  readUserCartLocal,
  writeGuestCartLocal,
  writeUserCartLocal,
} from "@/lib/cart/local-cart";
import { mergeCartLines } from "@/lib/cart/merge";
import { mergeRemoteCartWithLocal } from "@/lib/cart/merge-remote";
import type { CartLine } from "@/lib/cart/types";
import type { AccountSyncedResourceConfig } from "@/lib/sync/types";

const EMPTY_CART: CartLine[] = [];

function readLocal(userId: string | null): CartLine[] {
  if (userId) return readUserCartLocal(userId);
  return migrateLegacyBagToGuestIfNeeded();
}

function writeLocal(userId: string | null, lines: CartLine[]): void {
  if (userId) writeUserCartLocal(userId, lines);
  else writeGuestCartLocal(lines);
}

function isNonEmptyCart(lines: CartLine[]): boolean {
  return lines.length > 0;
}

/** Stable cart-specific config for {@link useAccountSyncedResource}. */
export const bagSyncConfig: AccountSyncedResourceConfig<CartLine[]> = {
  resourceId: "cart",
  storageKeyPrefixes: ["salvya-cart-", "salvya-preview-bag-v1"],
  debounceMs: 600,
  empty: EMPTY_CART,
  merge: mergeCartLines,
  mergeRemoteWithLocal: mergeRemoteCartWithLocal,
  readLocal,
  writeLocal,
  takeGuestForLoginMerge: readGuestCartLocal,
  clearGuestStorage: () => writeGuestCartLocal([]),
  fetchRemote: async () => {
    const remote = await fetchRemoteCart();
    return remote ? { data: remote.lines, updatedAt: remote.updatedAt } : null;
  },
  pushRemote: async (lines) => {
    const remote = await pushRemoteCart(lines);
    return remote ? { data: remote.lines, updatedAt: remote.updatedAt } : null;
  },
  clearRemote: clearRemoteCart,
  onApplied: dispatchCartChanged,
  pushAfterHydrateIf: isNonEmptyCart,
  pushAfterLoginMergeIf: (lines, hadRemote) => hadRemote || isNonEmptyCart(lines),
};
