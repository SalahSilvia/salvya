import type { SupabaseClient } from "@supabase/supabase-js";

export type StockDecrementResult =
  | { ok: true; remainingStock: number }
  | { ok: false; remainingStock: number; message: string };

/**
 * Atomically decrement product stock via `decrement_product_stock` RPC.
 */
export async function decrementProductStock(
  service: SupabaseClient,
  productId: string,
  qty: number,
): Promise<StockDecrementResult> {
  const { data, error } = await service.rpc("decrement_product_stock", {
    p_product_id: productId,
    p_qty: qty,
  });

  if (error) {
    return { ok: false, remainingStock: 0, message: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const ok = Boolean(row && (row as { ok?: boolean }).ok);
  const remaining = typeof (row as { remaining_stock?: number })?.remaining_stock === "number"
    ? (row as { remaining_stock: number }).remaining_stock
    : 0;

  if (!ok) {
    return {
      ok: false,
      remainingStock: remaining,
      message: remaining <= 0 ? "This item is out of stock" : "Not enough stock for this quantity",
    };
  }

  return { ok: true, remainingStock: remaining };
}
