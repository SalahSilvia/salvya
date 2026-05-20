import type { SupabaseClient } from "@supabase/supabase-js";
import type { MismatchAlert } from "@/lib/payments/reconciliation";

export type PaymentReconciliationUiPayload = {
  summary: {
    dbSalesTotalEur: number;
    paypalEstimateEur: number;
    deltaEur: number;
    paidOrderCount: number;
    refundedTotalEur: number;
    refundedCount: number;
    abandonedCount: number;
  };
  mismatchedOrders: { id: string; order_number: string; payment_status: string }[];
  failedCaptureLogs: { id: string; event_type: string; created_at: string; metadata?: unknown }[];
  missingWebhookAlerts: { id: string; order_number: string; payment_status: string; created_at: string }[];
};

function startOfUtcDay(d = new Date()): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

/** Maps reconciliation run output + DB rows into the admin payments UI contract. */
export async function buildPaymentReconciliationUiPayload(
  service: SupabaseClient,
  result: {
    summary: {
      dbSalesTotalEur: number;
      paypalEstimateEur: number;
      paidOrderCount: number;
      refundedTotalEur: number;
      mismatchCount: number;
    };
    mismatches: MismatchAlert[];
  },
): Promise<PaymentReconciliationUiPayload> {
  const dayStart = startOfUtcDay();

  const [mismatchedRows, refundedToday, abandonedToday, failedLogs, stalePaypal] = await Promise.all([
    service
      .from("customer_orders")
      .select("id, order_number, payment_status, payment, paypal_capture_id")
      .eq("payment_status", "paid")
      .is("paypal_capture_id", null)
      .limit(50),
    service
      .from("customer_orders")
      .select("id")
      .eq("refund_status", "refunded")
      .gte("refunded_at", dayStart),
    service
      .from("customer_orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "payment_abandoned")
      .gte("payment_abandoned_at", dayStart),
    service
      .from("payment_audit_logs")
      .select("id, event_type, created_at, metadata")
      .gte("created_at", dayStart)
      .in("event_type", ["paypal_capture_failed", "paypal_refund_failed"])
      .order("created_at", { ascending: false })
      .limit(50),
    service
      .from("customer_orders")
      .select("id, order_number, payment_status, created_at, paypal_order_id")
      .not("paypal_order_id", "is", null)
      .in("payment_status", ["pending", "authorized"])
      .lt("created_at", new Date(Date.now() - 45 * 60 * 1000).toISOString())
      .limit(50),
  ]);

  const paypalPaidNoCapture = (mismatchedRows.data ?? []).filter((row) => {
    const p = row.payment as { method?: string } | null;
    return p?.method === "paypal";
  });

  const mismatchedOrders = paypalPaidNoCapture.map((row) => ({
    id: row.id,
    order_number: row.order_number,
    payment_status: row.payment_status,
  }));

  const missingWebhookAlerts = (stalePaypal.data ?? []).map((row) => ({
    id: row.id,
    order_number: row.order_number,
    payment_status: row.payment_status,
    created_at: row.created_at,
  }));

  return {
    summary: {
      dbSalesTotalEur: result.summary.dbSalesTotalEur,
      paypalEstimateEur: result.summary.paypalEstimateEur,
      deltaEur: result.summary.dbSalesTotalEur - result.summary.paypalEstimateEur,
      paidOrderCount: result.summary.paidOrderCount,
      refundedTotalEur: result.summary.refundedTotalEur,
      refundedCount: refundedToday.data?.length ?? 0,
      abandonedCount: abandonedToday.count ?? 0,
    },
    mismatchedOrders,
    failedCaptureLogs: failedLogs.data ?? [],
    missingWebhookAlerts,
  };
}
