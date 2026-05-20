import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createCreatorPayoutWithdrawal,
  getMinPayoutMinor,
  listCreatorPayoutRecords,
  type CreatorPayoutRecord,
} from "@/lib/creator/payout-service";
import type { CreatorPayoutRequestRow } from "@/lib/creator/phase4-types";

export { getMinPayoutMinor };

export function nextScheduledPayoutDate(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  const hour = new Date().getUTCHours();
  const slots = [0, 6, 12, 18];
  const nextSlot = slots.find((h) => h > hour) ?? slots[0]!;
  if (nextSlot <= hour) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(nextSlot, 0, 0, 0);
  return d.toISOString();
}

export async function getClearancePendingMinor(
  service: SupabaseClient,
  creatorId: string,
): Promise<number> {
  const { data: pending, error } = await service
    .from("creator_earnings")
    .select("amount_minor, order_id")
    .eq("creator_id", creatorId)
    .eq("status", "pending")
    .eq("fraud_status", "valid")
    .eq("self_referral", false);

  if (error) {
    if (error.code === "42P01") return 0;
    throw new Error(error.message);
  }
  if (!pending?.length) return 0;

  const orderIds = pending.map((r) => r.order_id as string).filter(Boolean);
  if (!orderIds.length) return pending.reduce((s, r) => s + Number(r.amount_minor ?? 0), 0);

  const { data: orders } = await service
    .from("customer_orders")
    .select("id, payment_status")
    .in("id", orderIds);

  const paidOrders = new Set(
    (orders ?? []).filter((o) => o.payment_status === "paid").map((o) => o.id as string),
  );

  return pending
    .filter((r) => paidOrders.has(r.order_id as string))
    .reduce((s, r) => s + Number(r.amount_minor ?? 0), 0);
}

function payoutToRequestRow(p: CreatorPayoutRecord): CreatorPayoutRequestRow {
  return {
    id: p.id,
    amountMinor: p.amountMinor,
    currency: p.currency,
    status: p.status,
    method: p.method,
    createdAt: p.requestedAt,
  };
}

export async function listCreatorPayoutRequests(
  service: SupabaseClient,
  creatorId: string,
  limit = 10,
): Promise<CreatorPayoutRequestRow[]> {
  const rows = await listCreatorPayoutRecords(service, creatorId, limit);
  return rows
    .filter((r) => ["pending", "approved", "processing"].includes(r.status))
    .map(payoutToRequestRow);
}

export async function createCreatorPayoutRequest(
  service: SupabaseClient,
  creatorId: string,
  opts: { amountMinor?: number; method?: "paypal" | "bank" | "manual" },
): Promise<{ ok: true; request: CreatorPayoutRequestRow } | { ok: false; error: string }> {
  const result = await createCreatorPayoutWithdrawal(service, creatorId, opts);
  if (!result.ok) return result;
  return { ok: true, request: payoutToRequestRow(result.payout) };
}
