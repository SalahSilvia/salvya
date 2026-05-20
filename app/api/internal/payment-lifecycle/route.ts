import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/creator/cron-auth";
import { processStaleAbandonedCheckouts } from "@/lib/orders/abandoned-checkout";
import { runPaymentReconciliation } from "@/lib/payments/reconciliation";
import { loadFxRatesIntoCache } from "@/lib/currency/fx-store";
import { recomputeProductMetrics } from "@/lib/discovery/recompute-metrics";
import {
  promoteScheduledProducts,
  releaseExpiredStockReservations,
} from "@/lib/inventory/stock-reservation";
import { runCreatorPayoutScheduler } from "@/lib/creator/payout-scheduler";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  return runPaymentLifecycle(request);
}

/** Vercel Cron invokes scheduled jobs with HTTP GET. */
export async function GET(request: NextRequest) {
  return runPaymentLifecycle(request);
}

async function runPaymentLifecycle(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const [abandoned, reconciliation, _fx, expiredReservations, scheduledPromoted, metrics, creatorPayouts] =
    await Promise.all([
      processStaleAbandonedCheckouts(service),
      runPaymentReconciliation(service, { persist: true }),
      loadFxRatesIntoCache(service),
      releaseExpiredStockReservations(service),
      promoteScheduledProducts(service),
      recomputeProductMetrics(service).catch(() => ({ updated: 0 })),
      runCreatorPayoutScheduler(service).catch(() => ({
        creatorsProcessed: 0,
        payoutsCreated: 0,
        totalMinor: 0,
        skippedBelowMinimum: 0,
      })),
    ]);

  return NextResponse.json({
    ok: true,
    abandoned,
    reconciliation: {
      mismatchCount: reconciliation.summary.mismatchCount,
      paidOrderCount: reconciliation.summary.paidOrderCount,
    },
    inventory: {
      expiredReservations,
      scheduledPromoted,
    },
    discovery: { metricsUpdated: metrics.updated },
    creatorPayouts,
  });
}
