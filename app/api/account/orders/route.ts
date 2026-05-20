import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { buildCustomerOrderActions } from "@/lib/orders/customer-order-actions";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import { orderToRefundPolicy } from "@/lib/orders/order-refund-policy";
import { assessRefundEligibility } from "@/lib/orders/refund-policy";
import { buildRefundTimeline } from "@/lib/orders/refund-timeline";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: "Not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await service
    .from("customer_orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: error.message }, { status: 500 });
  }

  const items = (data ?? [])
    .map((row) => {
      const order = rowToCustomerOrder(row);
      if (!order) return null;
      const eligibility = assessRefundEligibility(orderToRefundPolicy(order));
      const timeline = buildRefundTimeline(order);
      return {
        order,
        eligibility,
        actions: buildCustomerOrderActions(order, eligibility),
        timelineSummary: timeline.currentLabel,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return rbacApiJsonWithAuthCookies(auth.response, { ok: true, items });
}
