import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceSupabase } from "@/lib/supabase/service";

/** True when this checkout session holds an active reservation covering `qty` for the variant. */
export async function hasActiveCheckoutStockReservation(
  variantId: string,
  qty: number,
  checkoutSessionId: string,
  service: SupabaseClient | null = createServiceSupabase(),
): Promise<boolean> {
  const sessionId = checkoutSessionId.trim();
  const need = Math.max(1, Math.floor(qty));
  if (!sessionId || !variantId.trim() || !service) return false;

  const { data, error } = await service
    .from("stock_reservations")
    .select("quantity")
    .eq("checkout_session_id", sessionId)
    .eq("product_variant_id", variantId.trim())
    .eq("status", "reserved")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return false;
  const held = typeof data.quantity === "number" ? data.quantity : 0;
  return held >= need;
}
