import type { NextRequest } from "next/server";
import { loadCreatorApplicationByUserId } from "@/lib/creator/application-service";
import { buildCreatorCommissionProfile } from "@/lib/creator/follower-commission";
import { listCreatorPayouts } from "@/lib/creator/earnings-service";
import {
  getClearancePendingMinor,
  getMinPayoutMinor,
  listCreatorPayoutRequests,
  nextScheduledPayoutDate,
} from "@/lib/creator/payout-request-service";
import { getCreatorWalletSnapshot } from "@/lib/creator/wallet-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const [walletSnap, payouts, clearancePendingMinor, payoutRequests, application] = await Promise.all([
      getCreatorWalletSnapshot(service, auth.user.id),
      listCreatorPayouts(service, auth.user.id),
      getClearancePendingMinor(service, auth.user.id),
      listCreatorPayoutRequests(service, auth.user.id),
      loadCreatorApplicationByUserId(service, auth.user.id),
    ]);

    const commissionProfile = buildCreatorCommissionProfile(application?.followers_count ?? 0);

    const balances = {
      totalMinor:
        walletSnap.availableBalanceMinor +
        walletSnap.pendingBalanceMinor +
        walletSnap.pendingLockMinor,
      pendingMinor: walletSnap.pendingBalanceMinor,
      availableMinor: walletSnap.availableBalanceMinor,
      paidMinor: 0,
      voidMinor: 0,
      currency: walletSnap.currency,
      clearancePendingMinor,
      pendingLockMinor: walletSnap.pendingLockMinor,
      lifetimeEarningsMinor: walletSnap.lifetimeEarningsMinor,
    };

    return rbacApiJson({
      ok: true,
      wallet: {
        balances,
        walletSource: walletSnap.source,
        walletUpdatedAt: walletSnap.updatedAt,
        payouts,
        payoutRequests,
        minPayoutMinor: getMinPayoutMinor(),
        scheduledPayoutDate: nextScheduledPayoutDate(),
        commissionProfile,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load wallet";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
