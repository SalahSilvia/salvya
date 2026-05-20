import type { SupabaseClient } from "@supabase/supabase-js";

export type MismatchAlert = {
  orderId: string | null;
  alertType:
    | "paypal_paid_db_unpaid"
    | "db_paid_paypal_missing_capture"
    | "stale_paypal_pending"
    | "amount_mismatch"
    | "duplicate_capture";
  severity: "info" | "warning" | "critical";
  details: Record<string, unknown>;
};

function startOfUtcDay(d = new Date()): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

function reportDateOnly(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function runPaymentReconciliation(
  service: SupabaseClient,
  opts?: { persist?: boolean },
): Promise<{
  dayStart: string;
  summary: {
    dbSalesTotalEur: number;
    paypalEstimateEur: number;
    paidOrderCount: number;
    refundedTotalEur: number;
    mismatchCount: number;
  };
  mismatches: MismatchAlert[];
}> {
  const dayStart = startOfUtcDay();
  const staleCutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString();

  const [paidToday, refundedToday, mismatched, stalePaypal] = await Promise.all([
    service
      .from("customer_orders")
      .select("id, order_number, final_price, payment, paypal_capture_id")
      .eq("payment_status", "paid")
      .gte("created_at", dayStart),
    service
      .from("customer_orders")
      .select("id, refund_amount")
      .eq("refund_status", "refunded")
      .gte("refunded_at", dayStart),
    service
      .from("customer_orders")
      .select("id, order_number, payment_status, payment, paypal_capture_id")
      .eq("payment_status", "paid")
      .is("paypal_capture_id", null)
      .limit(50),
    service
      .from("customer_orders")
      .select("id, order_number, payment_status, created_at, paypal_order_id")
      .not("paypal_order_id", "is", null)
      .in("payment_status", ["pending", "authorized"])
      .lt("created_at", staleCutoff)
      .limit(50),
  ]);

  const mismatches: MismatchAlert[] = [];

  for (const row of mismatched.data ?? []) {
    const p = row.payment as { method?: string } | null;
    if (p?.method === "paypal") {
      mismatches.push({
        orderId: row.id,
        alertType: "db_paid_paypal_missing_capture",
        severity: "critical",
        details: { orderNumber: row.order_number },
      });
    }
  }

  for (const row of stalePaypal.data ?? []) {
    mismatches.push({
      orderId: row.id,
      alertType: "stale_paypal_pending",
      severity: "warning",
      details: { orderNumber: row.order_number, paymentStatus: row.payment_status },
    });
  }

  const dbSalesTotal = (paidToday.data ?? []).reduce((s, r) => {
    const n = typeof r.final_price === "number" ? r.final_price : 0;
    return s + n;
  }, 0);

  const paypalEstimate = (paidToday.data ?? [])
    .filter((r) => (r.payment as { method?: string })?.method === "paypal")
    .reduce((s, r) => s + (typeof r.final_price === "number" ? r.final_price : 0), 0);

  const refundedTotal = (refundedToday.data ?? []).reduce((s, r) => {
    const n = typeof r.refund_amount === "number" ? r.refund_amount : 0;
    return s + n;
  }, 0);

  const summary = {
    dbSalesTotalEur: dbSalesTotal,
    paypalEstimateEur: paypalEstimate,
    paidOrderCount: paidToday.data?.length ?? 0,
    refundedTotalEur: refundedTotal,
    mismatchCount: mismatches.length,
  };

  if (opts?.persist !== false) {
    const reportDate = reportDateOnly();
    await service.from("daily_sales_reports").upsert(
      {
        report_date: reportDate,
        db_paid_total_eur: summary.dbSalesTotalEur,
        db_refunded_total_eur: summary.refundedTotalEur,
        paypal_estimate_eur: summary.paypalEstimateEur,
        paid_order_count: summary.paidOrderCount,
        mismatch_count: summary.mismatchCount,
        metadata: { dayStart, generatedAt: new Date().toISOString() },
      },
      { onConflict: "report_date" },
    );

    for (const m of mismatches) {
      if (!m.orderId) continue;
      const { data: existing } = await service
        .from("payment_mismatch_alerts")
        .select("id")
        .eq("order_id", m.orderId)
        .eq("alert_type", m.alertType)
        .is("resolved_at", null)
        .maybeSingle();
      if (!existing) {
        await service.from("payment_mismatch_alerts").insert({
          order_id: m.orderId,
          alert_type: m.alertType,
          severity: m.severity,
          details: m.details,
        });
      }
    }
  }

  return { dayStart, summary, mismatches };
}
