import type { NextRequest } from "next/server";
import { adminOrderTotalCents } from "@/lib/admin/order-money";
import { computeLiveUsers } from "@/lib/admin/analytics-snapshot";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { rowToCustomerOrder } from "@/lib/orders/validate";

const ORDER_SELECT =
  "id, order_number, placement_key, user_id, shipping_address_id, line_item, shipping, payment, fulfillment_status, payment_status, created_at, updated_at";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const { service } = ctx;

  const [{ data: orderRows, error: oErr }, { data: profiles, error: pErr }, live] = await Promise.all([
    service.from("customer_orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(12),
    service.from("user_profiles").select("user_id, role, created_at").order("created_at", { ascending: false }).limit(12),
    computeLiveUsers(service, 2).catch(() => ({ liveUsers: 0, since: new Date().toISOString() })),
  ]);

  if (oErr) return rbacApiJson({ ok: false, error: oErr.message }, { status: 500 });
  if (pErr) return rbacApiJson({ ok: false, error: pErr.message }, { status: 500 });

  const recentOrders = (orderRows ?? [])
    .map((r) => rowToCustomerOrder(r))
    .filter((o): o is NonNullable<typeof o> => Boolean(o))
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerEmail: o.shipping.buyerEmail,
      total: Math.round(adminOrderTotalCents(o)) / 100,
      fulfillmentStatus: o.fulfillmentStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    }));

  const newSignups = (profiles ?? []).map((p) => ({
    userId: p.user_id,
    role: p.role,
    createdAt: p.created_at,
  }));

  return rbacApiJson({
    ok: true,
    liveUsers: live.liveUsers,
    liveSince: live.since,
    recentOrders,
    newSignups,
  });
}
