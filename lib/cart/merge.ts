import { CART_MAX_QTY_PER_LINE } from "@/lib/cart/types";
import { normalizeCartLine } from "@/lib/cart/validate";
import type { CartLine } from "@/lib/cart/types";

/** Merge carts by lineId — highest qty wins (capped), gift note from newest updatedAt. */
export function mergeCartLines(...sources: CartLine[][]): CartLine[] {
  const map = new Map<string, CartLine>();

  for (const source of sources) {
    for (const raw of source) {
      const line = normalizeCartLine(raw);
      const existing = map.get(line.lineId);
      if (!existing) {
        map.set(line.lineId, line);
        continue;
      }
      const qty = Math.min(CART_MAX_QTY_PER_LINE, Math.max(existing.qty, line.qty));
      const newer = existing.updatedAt >= line.updatedAt ? existing : line;
      map.set(line.lineId, {
        ...newer,
        qty,
        giftNote: newer.giftNote || existing.giftNote || line.giftNote,
        addedAt: existing.addedAt < line.addedAt ? existing.addedAt : line.addedAt,
        updatedAt: newer.updatedAt,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
