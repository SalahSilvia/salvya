import { mergeCartLines } from "@/lib/cart/merge";
import { USER_CART_PREFIX } from "@/lib/cart/local-cart";
import type { CartLine } from "@/lib/cart/types";
import { hasUnsyncedLocalChanges, readSyncMeta } from "@/lib/sync/sync-meta";

const CART_RESOURCE = "cart";

function activeSignedInCartUserId(): string | null {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(USER_CART_PREFIX)) {
      return key.slice(USER_CART_PREFIX.length);
    }
  }
  return null;
}

/**
 * When the user edited the bag locally (add/remove/clear) but the server still has an older
 * snapshot, prefer local — otherwise union-merge resurrects deleted lines on reload.
 */
export function mergeRemoteCartWithLocal(remote: CartLine[], local: CartLine[]): CartLine[] {
  const userId = activeSignedInCartUserId();
  if (!userId) return mergeCartLines(remote, local);

  if (hasUnsyncedLocalChanges(CART_RESOURCE, userId)) {
    return local;
  }

  const meta = readSyncMeta(CART_RESOURCE, userId);
  if (!meta.remoteUpdatedAt) {
    return local.length > 0 ? local : remote;
  }

  return mergeCartLines(remote, local);
}
