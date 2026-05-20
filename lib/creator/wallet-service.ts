import type { SupabaseClient } from "@supabase/supabase-js";
import { getCreatorEarningsBalances } from "@/lib/creator/earnings-service";

export type CreatorWalletSnapshot = {
  availableBalanceMinor: number;
  pendingBalanceMinor: number;
  pendingLockMinor: number;
  lifetimeEarningsMinor: number;
  currency: string;
  updatedAt: string | null;
  source: "cache" | "computed";
};

const CACHE_TTL_MS = 60_000;

const memoryCache = new Map<string, { snapshot: CreatorWalletSnapshot; expiresAt: number }>();

function isMissingWallet(message: string): boolean {
  return message.includes("creator_wallet_balance") || message.includes("does not exist");
}

export async function refreshCreatorWalletBalance(
  service: SupabaseClient,
  creatorId: string,
): Promise<void> {
  const { error } = await service.rpc("refresh_creator_wallet_balance", {
    p_creator_id: creatorId,
  });
  if (error && error.code !== "42P01" && !isMissingWallet(error.message)) {
    throw new Error(error.message);
  }
  memoryCache.delete(creatorId);
}

/** Non-blocking wallet refresh for hooks. */
export function scheduleWalletRefresh(service: SupabaseClient, creatorId: string): void {
  void refreshCreatorWalletBalance(service, creatorId).catch(() => undefined);
}

async function computeWalletFromEarnings(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorWalletSnapshot> {
  const balances = await getCreatorEarningsBalances(service, creatorId);

  const { data: lockRows } = await service
    .from("creator_payouts")
    .select("amount_minor")
    .eq("creator_id", creatorId)
    .in("status", ["pending", "approved", "processing"]);

  const pendingLock =
    lockRows?.reduce((s, r) => s + Number(r.amount_minor ?? 0), 0) ?? 0;

  const available = Math.max(balances.availableMinor - pendingLock, 0);
  const lifetime =
    balances.pendingMinor + balances.availableMinor + balances.paidMinor;

  return {
    availableBalanceMinor: available,
    pendingBalanceMinor: balances.pendingMinor,
    pendingLockMinor: pendingLock,
    lifetimeEarningsMinor: lifetime,
    currency: balances.currency,
    updatedAt: new Date().toISOString(),
    source: "computed",
  };
}

export async function getCreatorWalletSnapshot(
  service: SupabaseClient,
  creatorId: string,
): Promise<CreatorWalletSnapshot> {
  const cached = memoryCache.get(creatorId);
  if (cached && cached.expiresAt > Date.now()) return cached.snapshot;

  const { data, error } = await service
    .from("creator_wallet_balance")
    .select(
      "available_balance_minor, pending_balance_minor, pending_lock_minor, lifetime_earnings_minor, currency, updated_at",
    )
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (!error && data) {
    const snapshot: CreatorWalletSnapshot = {
      availableBalanceMinor: Number(data.available_balance_minor ?? 0),
      pendingBalanceMinor: Number(data.pending_balance_minor ?? 0),
      pendingLockMinor: Number(data.pending_lock_minor ?? 0),
      lifetimeEarningsMinor: Number(data.lifetime_earnings_minor ?? 0),
      currency: (data.currency as string) ?? "EUR",
      updatedAt: (data.updated_at as string) ?? null,
      source: "cache",
    };
    memoryCache.set(creatorId, { snapshot, expiresAt: Date.now() + CACHE_TTL_MS });
    return snapshot;
  }

  if (error && error.code !== "42P01" && !isMissingWallet(error.message)) {
    throw new Error(error.message);
  }

  const computed = await computeWalletFromEarnings(service, creatorId);
  memoryCache.set(creatorId, { snapshot: computed, expiresAt: Date.now() + CACHE_TTL_MS });
  return computed;
}
