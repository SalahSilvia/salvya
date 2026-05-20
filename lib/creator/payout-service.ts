import type { SupabaseClient } from "@supabase/supabase-js";
import { writeCreatorAuditLog } from "@/lib/creator/audit-log-service";
import {
  getCreatorWalletSnapshot,
  refreshCreatorWalletBalance,
  scheduleWalletRefresh,
} from "@/lib/creator/wallet-service";

const MIN_PAYOUT_MINOR = Number(process.env.CREATOR_MIN_PAYOUT_MINOR ?? "5000");

export function getMinPayoutMinor(): number {
  return MIN_PAYOUT_MINOR;
}

export type CreatorPayoutStatus =
  | "pending"
  | "approved"
  | "processing"
  | "paid"
  | "rejected"
  | "failed"
  | "completed";

export type CreatorPayoutRecord = {
  id: string;
  amountMinor: number;
  currency: string;
  status: CreatorPayoutStatus;
  method: string;
  requestedAt: string;
  processedAt: string | null;
  externalReference: string | null;
  reference: string | null;
  timeline: { status: string; at: string }[];
};

function normalizeStatus(status: string): CreatorPayoutStatus {
  if (status === "completed") return "paid";
  return status as CreatorPayoutStatus;
}

function buildTimeline(row: {
  status: string;
  created_at: string;
  requested_at?: string | null;
  processed_at?: string | null;
}): { status: string; at: string }[] {
  const timeline: { status: string; at: string }[] = [];
  const requested = row.requested_at ?? row.created_at;
  timeline.push({ status: "requested", at: requested });
  if (row.status !== "pending") {
    timeline.push({ status: row.status, at: row.processed_at ?? row.created_at });
  }
  return timeline;
}

export async function listCreatorPayoutRecords(
  service: SupabaseClient,
  creatorId: string,
  limit = 30,
): Promise<CreatorPayoutRecord[]> {
  const { data, error } = await service
    .from("creator_payouts")
    .select(
      "id, amount_minor, currency, status, method, reference, external_reference, created_at, requested_at, processed_at",
    )
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("creator_payouts")) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    amountMinor: row.amount_minor as number,
    currency: (row.currency as string) ?? "EUR",
    status: normalizeStatus(row.status as string),
    method: (row.method as string) ?? "paypal",
    requestedAt: (row.requested_at as string) ?? (row.created_at as string),
    processedAt: (row.processed_at as string | null) ?? null,
    externalReference: (row.external_reference as string | null) ?? null,
    reference: (row.reference as string | null) ?? null,
    timeline: buildTimeline(row as Parameters<typeof buildTimeline>[0]),
  }));
}

export async function getCreatorPayoutTotals(
  service: SupabaseClient,
  creatorId: string,
): Promise<{ totalPaidMinor: number; totalPendingMinor: number; currency: string }> {
  const payouts = await listCreatorPayoutRecords(service, creatorId, 200);
  let totalPaidMinor = 0;
  let totalPendingMinor = 0;
  let currency = "EUR";

  for (const p of payouts) {
    currency = p.currency;
    if (p.status === "paid" || p.status === "completed") totalPaidMinor += p.amountMinor;
    if (["pending", "approved", "processing"].includes(p.status)) {
      totalPendingMinor += p.amountMinor;
    }
  }

  return { totalPaidMinor, totalPendingMinor, currency };
}

export async function createCreatorPayoutWithdrawal(
  service: SupabaseClient,
  creatorId: string,
  opts: { amountMinor?: number; method?: "paypal" | "bank" | "manual" },
): Promise<{ ok: true; payout: CreatorPayoutRecord } | { ok: false; error: string }> {
  const minPayout = getMinPayoutMinor();
  const wallet = await getCreatorWalletSnapshot(service, creatorId);
  const amountMinor = opts.amountMinor ?? wallet.availableBalanceMinor;
  const method = opts.method ?? "paypal";

  if (amountMinor < minPayout) {
    return {
      ok: false,
      error: `Minimum payout is ${(minPayout / 100).toFixed(2)} ${wallet.currency}`,
    };
  }

  if (amountMinor > wallet.availableBalanceMinor) {
    return { ok: false, error: "Amount exceeds available balance" };
  }

  const { data: existing } = await service
    .from("creator_payouts")
    .select("id")
    .eq("creator_id", creatorId)
    .in("status", ["pending", "approved", "processing"])
    .limit(1);

  if (existing?.length) {
    return { ok: false, error: "You already have a pending payout request" };
  }

  const freezeRes = await service.rpc("freeze_creator_payout_amount", {
    p_creator_id: creatorId,
    p_amount_minor: amountMinor,
  });

  const freeze = freezeRes.data as { ok?: boolean; error?: string } | null;
  if (freezeRes.error || !freeze?.ok) {
    if (freeze?.error === "insufficient_balance") {
      return { ok: false, error: "Insufficient available balance" };
    }
    if (freezeRes.error?.code === "42P01") {
      await refreshCreatorWalletBalance(service, creatorId);
    } else {
      return { ok: false, error: freeze?.error ?? freezeRes.error?.message ?? "Could not reserve funds" };
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await service
    .from("creator_payouts")
    .insert({
      creator_id: creatorId,
      amount_minor: amountMinor,
      currency: wallet.currency,
      status: "pending",
      method,
      requested_at: now,
      reference: `REQ-${now.slice(0, 10)}`,
    })
    .select(
      "id, amount_minor, currency, status, method, reference, external_reference, created_at, requested_at, processed_at",
    )
    .single();

  if (error) {
    await service.rpc("release_creator_payout_lock", {
      p_creator_id: creatorId,
      p_amount_minor: amountMinor,
    });
    return { ok: false, error: error.message };
  }

  scheduleWalletRefresh(service, creatorId);

  const payout: CreatorPayoutRecord = {
    id: data.id as string,
    amountMinor: data.amount_minor as number,
    currency: data.currency as string,
    status: "pending",
    method: data.method as string,
    requestedAt: (data.requested_at as string) ?? now,
    processedAt: null,
    externalReference: null,
    reference: (data.reference as string | null) ?? null,
    timeline: buildTimeline(data as Parameters<typeof buildTimeline>[0]),
  };

  await writeCreatorAuditLog(service, {
    creatorId,
    actionType: "payout_request_created",
    entityType: "payout",
    entityId: payout.id,
    metadata: { amountMinor, method, currency: wallet.currency },
  });

  return { ok: true, payout };
}
