import type { NextRequest } from "next/server";
import { adminOrderTotalCentsFromDbRow } from "@/lib/admin/order-money";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { normalizeSalvyaRole, type SalvyaClientRole, salvyaRoleToClient } from "@/lib/auth/roles";
import { isOrderLineItem } from "@/lib/orders/validate";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const roleFilter = (url.searchParams.get("role") ?? "").trim().toLowerCase();
  const perPage = Math.min(50, Math.max(5, parseInt(url.searchParams.get("perPage") ?? "20", 10) || 20));

  const {
    data: { users },
    error,
  } = await ctx.service.auth.admin.listUsers({ page, perPage });

  if (error) {
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  let list = users ?? [];
  if (q) {
    list = list.filter((u) => (u.email ?? "").toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }

  const ids = list.map((u) => u.id);
  const profilesRes =
    ids.length > 0
      ? await ctx.service.from("user_profiles").select("user_id, role, created_at").in("user_id", ids)
      : { data: [] as { user_id: string; role: string; created_at: string }[] };

  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));

  const ordersRes =
    ids.length > 0
      ? await ctx.service
          .from("customer_orders")
          .select("user_id, line_item, final_price, order_currency, payment_status")
          .in("user_id", ids)
      : {
          data: [] as {
            user_id: string | null;
            line_item: unknown;
            final_price: number | null;
            order_currency: string | null;
            payment_status: string;
          }[],
        };

  const spendByUser = new Map<string, { cents: number; orders: number }>();
  for (const row of ordersRes.data ?? []) {
    if (!row.user_id) continue;
    const bucket = spendByUser.get(row.user_id) ?? { cents: 0, orders: 0 };
    bucket.orders += 1;
    if (isOrderLineItem(row.line_item)) {
      bucket.cents += adminOrderTotalCentsFromDbRow({
        line_item: row.line_item,
        final_price: row.final_price,
        order_currency: row.order_currency,
      });
    }
    spendByUser.set(row.user_id, bucket);
  }

  let customers = list.map((u) => {
    const prof = profileMap.get(u.id);
    const roleRaw = normalizeSalvyaRole(prof?.role) ?? "customer";
    const rolePublic: SalvyaClientRole = salvyaRoleToClient(roleRaw);
    const agg = spendByUser.get(u.id) ?? { cents: 0, orders: 0 };
    return {
      id: u.id,
      email: u.email ?? "",
      rolePublic,
      createdAt: prof?.created_at ?? u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      ordersCount: agg.orders,
      totalSpent: Math.round(agg.cents) / 100,
    };
  });

  if (roleFilter) {
    customers = customers.filter((c) => c.rolePublic === roleFilter);
  }

  return rbacApiJson({
    ok: true,
    customers,
    page,
    perPage,
    totalReturned: customers.length,
  });
}
