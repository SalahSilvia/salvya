import type { SupabaseClient } from "@supabase/supabase-js";

export type LinkGuestOrdersResult = {
  linkedCount: number;
  orderIds: string[];
};

/**
 * Attach guest orders (user_id null) with matching buyer email to the signed-in user.
 * Idempotent — only updates rows still unassigned.
 */
export async function linkGuestOrdersToUser(
  service: SupabaseClient,
  userId: string,
  email: string,
): Promise<LinkGuestOrdersResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { linkedCount: 0, orderIds: [] };
  }

  const { data: candidates, error: selectErr } = await service
    .from("customer_orders")
    .select("id")
    .is("user_id", null)
    .eq("shipping->>buyerEmail", normalized);

  if (selectErr || !candidates?.length) {
    return { linkedCount: 0, orderIds: [] };
  }

  const ids = candidates.map((r) => r.id as string);
  const { data: updated, error: updateErr } = await service
    .from("customer_orders")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .in("id", ids)
    .is("user_id", null)
    .select("id");

  if (updateErr) {
    return { linkedCount: 0, orderIds: [] };
  }

  const orderIds = (updated ?? []).map((r) => r.id as string);
  return { linkedCount: orderIds.length, orderIds };
}
