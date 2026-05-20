import type { SupabaseClient } from "@supabase/supabase-js";

const MIN_PAYOUT_MINOR = Number(process.env.CREATOR_MIN_PAYOUT_MINOR ?? "1000");
const AUTO_PAYOUT = process.env.CREATOR_AUTO_PAYOUT_ENABLED !== "false";

export type PayoutSchedulerResult = {
  creatorsProcessed: number;
  payoutsCreated: number;
  totalMinor: number;
  skippedBelowMinimum: number;
};

type PayableRow = {
  id: string;
  creator_id: string;
  amount_minor: number;
  currency: string;
};

export async function runCreatorPayoutScheduler(
  service: SupabaseClient,
): Promise<PayoutSchedulerResult> {
  const result: PayoutSchedulerResult = {
    creatorsProcessed: 0,
    payoutsCreated: 0,
    totalMinor: 0,
    skippedBelowMinimum: 0,
  };

  if (!AUTO_PAYOUT) return result;

  const { data: rows, error } = await service
    .from("creator_earnings")
    .select("id, creator_id, amount_minor, currency")
    .eq("status", "available")
    .eq("fraud_status", "valid")
    .eq("locked", false)
    .is("payout_id", null)
    .gt("amount_minor", 0);

  if (error) {
    if (error.code === "42P01") return result;
    throw new Error(error.message);
  }

  const byCreator = new Map<string, PayableRow[]>();
  for (const row of (rows ?? []) as PayableRow[]) {
    const list = byCreator.get(row.creator_id) ?? [];
    list.push(row);
    byCreator.set(row.creator_id, list);
  }

  for (const [creatorId, earnings] of byCreator) {
    result.creatorsProcessed += 1;
    const currency = earnings[0]?.currency ?? "EUR";
    const totalMinor = earnings.reduce((s, e) => s + e.amount_minor, 0);

    if (totalMinor < MIN_PAYOUT_MINOR) {
      result.skippedBelowMinimum += 1;
      continue;
    }

    const { data: payout, error: payoutErr } = await service
      .from("creator_payouts")
      .insert({
        creator_id: creatorId,
        amount_minor: totalMinor,
        currency,
        status: "processing",
        method: "manual",
        reference: `AUTO-${new Date().toISOString().slice(0, 10)}`,
      })
      .select("id")
      .single();

    if (payoutErr || !payout) continue;

    const payoutId = payout.id as string;
    const earningIds = earnings.map((e) => e.id);

    const { error: markErr } = await service
      .from("creator_earnings")
      .update({
        status: "paid",
        payout_id: payoutId,
        paid_at: new Date().toISOString(),
      })
      .in("id", earningIds);

    if (markErr) continue;

    await service
      .from("creator_payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutId);

    result.payoutsCreated += 1;
    result.totalMinor += totalMinor;
  }

  return result;
}
