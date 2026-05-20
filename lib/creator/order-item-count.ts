import type { OrderLineItem } from "@/lib/orders/types";

/** Total qualifying units in an order (bag lines or single line qty). */
export function countOrderLineItems(lineItem: OrderLineItem | null | undefined): number {
  if (!lineItem) return 1;
  if (lineItem.bagLines?.length) {
    return lineItem.bagLines.reduce((sum, line) => sum + Math.max(1, Math.floor(line.qty ?? 1)), 0);
  }
  return Math.max(1, Math.floor(lineItem.qty ?? 1));
}
