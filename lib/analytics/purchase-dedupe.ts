/**
 * Ensures Meta `Purchase` fires at most once per confirmed order number (survives refresh).
 */

const PREFIX = "salvya_meta_purchase_fired_v1:";
const memory = new Set<string>();

export function tryClaimMetaPurchaseFire(orderNumber: string): boolean {
  if (!orderNumber.trim()) return false;
  if (typeof window === "undefined") return false;
  const key = `${PREFIX}${orderNumber.trim()}`;

  try {
    if (window.localStorage.getItem(key)) return false;
  } catch {
    /* read blocked */
  }

  if (memory.has(key)) return false;

  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    /* write blocked — in-memory guard still applies this session */
  }

  memory.add(key);
  return true;
}
