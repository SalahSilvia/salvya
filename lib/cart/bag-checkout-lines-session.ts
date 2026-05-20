import type { CartLine } from "@/lib/cart/types";

const LINES_KEY = "salvya-bag-checkout-lines-v1";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveBagCheckoutLines(lines: CartLine[]): void {
  if (!canUseSessionStorage() || !lines.length) return;
  try {
    window.sessionStorage.setItem(LINES_KEY, JSON.stringify(lines));
  } catch {
    /* quota / private mode */
  }
}

export function readBagCheckoutLines(): CartLine[] {
  if (!canUseSessionStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(LINES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function clearBagCheckoutLines(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(LINES_KEY);
  } catch {
    /* ignore */
  }
}
