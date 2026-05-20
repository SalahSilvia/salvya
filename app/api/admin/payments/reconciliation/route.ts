import type { NextRequest } from "next/server";
import { buildPaymentReconciliationUiPayload } from "@/lib/admin/payment-reconciliation-ui";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { runPaymentReconciliation } from "@/lib/payments/reconciliation";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const persist = request.nextUrl.searchParams.get("persist") !== "false";
  const result = await runPaymentReconciliation(admin.service, { persist });
  const ui = await buildPaymentReconciliationUiPayload(admin.service, result);

  const { data: openAlerts } = await admin.service
    .from("payment_mismatch_alerts")
    .select("id, order_id, alert_type, severity, details, created_at")
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: latestReport } = await admin.service
    .from("daily_sales_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(7);

  const { data: suspiciousOrders } = await admin.service
    .from("customer_orders")
    .select("id, order_number, fraud_score, payment_status, refund_status, created_at")
    .gt("fraud_score", 10)
    .order("fraud_score", { ascending: false })
    .limit(25);

  return rbacApiJson({
    ok: true,
    ...ui,
    dayStart: result.dayStart,
    mismatches: result.mismatches,
    openAlerts: openAlerts ?? [],
    recentReports: latestReport ?? [],
    suspiciousOrders: suspiciousOrders ?? [],
  });
}
