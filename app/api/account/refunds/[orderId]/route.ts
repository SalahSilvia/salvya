import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import { orderToRefundPolicy } from "@/lib/orders/order-refund-policy";
import { assessRefundEligibility } from "@/lib/orders/refund-policy";
import { buildRefundTimeline } from "@/lib/orders/refund-timeline";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { createServiceSupabase } from "@/lib/supabase/service";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const { orderId } = await params;
  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: "Not configured" },
      { status: 503 },
    );
  }

  const { data: row, error } = await service
    .from("customer_orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: error.message }, { status: 500 });
  }
  if (!row) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Not found" }, { status: 404 });
  }

  const order = rowToCustomerOrder(row);
  if (!order) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Invalid order" }, { status: 500 });
  }

  const eligibility = assessRefundEligibility(orderToRefundPolicy(order));
  const timeline = buildRefundTimeline(order);

  const { data: audit } = await service
    .from("payment_audit_logs")
    .select("event_type, status_before, status_after, metadata, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(30);

  return rbacApiJsonWithAuthCookies(auth.response, {
    ok: true,
    order,
    eligibility,
    timeline,
    audit: audit ?? [],
  });
}
