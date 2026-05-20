import type { SupabaseClient } from "@supabase/supabase-js";

export type ReserveStockResult =
  | { ok: true; reservationId: string; remainingStock: number; message: string }
  | { ok: false; remainingStock: number; message: string };

export type CommitStockResult =
  | { ok: true; remainingStock: number; message: string }
  | { ok: false; remainingStock: number; message: string };

function firstRow<T>(data: unknown): T | null {
  if (!data) return null;
  return (Array.isArray(data) ? data[0] : data) as T | null;
}

/** Hold variant stock during checkout (15m TTL). Idempotent per session + variant. */
export async function reserveVariantStock(
  service: SupabaseClient,
  variantId: string,
  qty: number,
  checkoutSessionId: string,
  ttlMinutes = 15,
): Promise<ReserveStockResult> {
  const { data, error } = await service.rpc("reserve_variant_stock", {
    p_variant_id: variantId,
    p_qty: qty,
    p_checkout_session_id: checkoutSessionId,
    p_ttl_minutes: ttlMinutes,
  });

  if (error) {
    return { ok: false, remainingStock: 0, message: error.message };
  }

  const row = firstRow<{ ok: boolean; reservation_id: string; remaining_stock: number; message: string }>(data);
  if (!row?.ok) {
    return {
      ok: false,
      remainingStock: row?.remaining_stock ?? 0,
      message: row?.message ?? "insufficient_stock",
    };
  }

  return {
    ok: true,
    reservationId: row.reservation_id,
    remainingStock: row.remaining_stock,
    message: row.message,
  };
}

/** Confirm reservation or atomically reserve+confirm at order placement. */
export async function commitVariantStockForCheckout(
  service: SupabaseClient,
  variantId: string,
  qty: number,
  checkoutSessionId: string,
): Promise<CommitStockResult> {
  const { data, error } = await service.rpc("commit_variant_stock_for_checkout", {
    p_variant_id: variantId,
    p_qty: qty,
    p_checkout_session_id: checkoutSessionId,
  });

  if (error) {
    return { ok: false, remainingStock: 0, message: error.message };
  }

  const row = firstRow<{ ok: boolean; remaining_stock: number; message: string }>(data);
  if (!row?.ok) {
    return {
      ok: false,
      remainingStock: row?.remaining_stock ?? 0,
      message: row?.message ?? "out_of_stock",
    };
  }

  return { ok: true, remainingStock: row.remaining_stock, message: row.message };
}

export async function releaseExpiredStockReservations(service: SupabaseClient): Promise<number> {
  const { data, error } = await service.rpc("release_expired_stock_reservations");
  if (error) return 0;
  return typeof data === "number" ? data : 0;
}

export async function promoteScheduledProducts(service: SupabaseClient): Promise<number> {
  const { data, error } = await service.rpc("promote_scheduled_products");
  if (error) return 0;
  return typeof data === "number" ? data : 0;
}
