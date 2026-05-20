import { mergeCartLines } from "@/lib/cart/merge";
import { sanitizeCartLines } from "@/lib/cart/validate";
import type { CartLine } from "@/lib/cart/types";

export const LEGACY_PREVIEW_BAG_KEY = "salvya-preview-bag-v1";
const GUEST_CART_KEY = "salvya-cart-guest-v2";
export const USER_CART_PREFIX = "salvya-cart-v2:";
const LEGACY_MIGRATED_FLAG = "salvya-cart-legacy-migrated-v1";

function userCartKey(userId: string) {
  return `${USER_CART_PREFIX}${userId}`;
}

function readKey(key: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return sanitizeCartLines(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function writeKey(key: string, lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(lines));
  } catch {
    /* quota / private mode */
  }
}

export function readLegacyPreviewBag(): CartLine[] {
  return readKey(LEGACY_PREVIEW_BAG_KEY);
}

export function clearLegacyPreviewBag(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_PREVIEW_BAG_KEY);
  } catch {
    /* ignore */
  }
}

export function readGuestCartLocal(): CartLine[] {
  return readKey(GUEST_CART_KEY);
}

export function writeGuestCartLocal(lines: CartLine[]): void {
  writeKey(GUEST_CART_KEY, lines);
}

export function readUserCartLocal(userId: string): CartLine[] {
  return readKey(userCartKey(userId));
}

export function writeUserCartLocal(userId: string, lines: CartLine[]): void {
  writeKey(userCartKey(userId), lines);
}

/** One-time lift from global preview bag into guest cart. */
export function migrateLegacyBagToGuestIfNeeded(): CartLine[] {
  const guest = readGuestCartLocal();
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage.getItem(LEGACY_MIGRATED_FLAG) === "1") {
        return guest;
      }
    } catch {
      /* private mode */
    }
  }

  const legacy = readLegacyPreviewBag();
  if (legacy.length === 0) {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LEGACY_MIGRATED_FLAG, "1");
      } catch {
        /* ignore */
      }
    }
    return guest;
  }

  const merged = mergeCartLines(guest, legacy);
  writeGuestCartLocal(merged);
  clearLegacyPreviewBag();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LEGACY_MIGRATED_FLAG, "1");
    } catch {
      /* ignore */
    }
  }
  return merged;
}
