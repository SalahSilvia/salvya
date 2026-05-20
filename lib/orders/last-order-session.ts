import type { OrderFulfillmentStatus } from "@/lib/orders/types";

export type LastOrderSession = {
  orderNumber: string;
  buyerEmail: string;
  displayTitle: string;
  colorLabel: string;
  size: string;
  qty: number;
  fulfillmentStatus: OrderFulfillmentStatus;
  placedAt: string;
};

const KEY = "salvya-last-order-v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveLastOrderSession(order: LastOrderSession): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order));
    window.localStorage.setItem(KEY, JSON.stringify(order));
    window.dispatchEvent(new CustomEvent("salvya-last-order-updated"));
  } catch {
    /* private mode */
  }
}

export function readLastOrderSession(): LastOrderSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(KEY) ?? window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrderSession;
    if (!parsed?.orderNumber || !parsed.buyerEmail?.includes("@")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastOrderSession(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
