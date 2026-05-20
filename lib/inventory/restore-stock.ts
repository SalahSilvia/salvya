import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderLineItem } from "@/lib/orders/types";

function firstRow<T>(data: unknown): T | null {
  if (!data) return null;
  return (Array.isArray(data) ? data[0] : data) as T | null;
}

/** Returns variant/qty pairs to restore for an order line item (bag or single). */
export function stockTargetsFromOrderLineItem(lineItem: OrderLineItem): { variantId: string; qty: number }[] {
  if (lineItem.bagLines?.length) {
    return lineItem.bagLines.map((line) => ({
      variantId: line.variantId,
      qty: Math.max(1, line.qty),
    }));
  }
  return [{ variantId: lineItem.variantId, qty: Math.max(1, lineItem.qty) }];
}

export async function restoreVariantStockQty(
  service: SupabaseClient,
  variantId: string,
  qty: number,
): Promise<{ ok: boolean; message: string }> {
  const { data, error } = await service.rpc("restore_variant_stock_qty", {
    p_variant_id: variantId,
    p_qty: qty,
  });
  if (error) return { ok: false, message: error.message };
  const row = firstRow<{ ok: boolean; message: string }>(data);
  return { ok: Boolean(row?.ok), message: row?.message ?? "restore_failed" };
}

/** Restore inventory for all variants in an order (refund / cancel). */
export async function restoreOrderLineItemStock(
  service: SupabaseClient,
  lineItem: OrderLineItem,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const targets = stockTargetsFromOrderLineItem(lineItem);
  for (const target of targets) {
    const result = await restoreVariantStockQty(service, target.variantId, target.qty);
    if (!result.ok) {
      return { ok: false, error: result.message };
    }
  }
  return { ok: true };
}
