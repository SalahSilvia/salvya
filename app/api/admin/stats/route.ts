import type { NextRequest } from "next/server";
import { adminOrderTotalCentsFromDbRow } from "@/lib/admin/order-money";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { isOrderLineItem } from "@/lib/orders/validate";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const { service } = ctx;

  const ordersRes = await service
    .from("customer_orders")
    .select("id, created_at, line_item, final_price, order_currency, fulfillment_status, payment_status, shipping")
    .order("created_at", { ascending: false })
    .limit(2500);

  const productsRes = await service.from("salvya_products").select("id", { count: "exact", head: true });

  const [
    { count: orderCount },
    { count: profileCount },
  ] = await Promise.all([
    service.from("customer_orders").select("id", { count: "exact", head: true }),
    service.from("user_profiles").select("user_id", { count: "exact", head: true }),
  ]);

  const productCount = productsRes.error ? 0 : productsRes.count ?? 0;
  const orderRows = ordersRes.data ?? [];
  const now = Date.now();
  const d7 = now - 7 * 86400000;
  const d30 = now - 30 * 86400000;

  let revenueTotalCents = 0;
  let revenue7d = 0;
  let revenue30d = 0;

  const salesByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  const productAgg = new Map<string, { title: string; qty: number; cents: number }>();
  const artistAgg = new Map<string, { orders: number; cents: number }>();

  const paidStatuses = new Set(["paid", "authorized", "cod_pending"]);

  for (const row of orderRows) {
    const created = new Date(row.created_at).getTime();
    const li = row.line_item;
    if (!isOrderLineItem(li)) continue;
    const cents = adminOrderTotalCentsFromDbRow({
      line_item: li,
      final_price: row.final_price,
      order_currency: row.order_currency,
    });

    revenueTotalCents += cents;
    if (created >= d7) revenue7d += cents;
    if (created >= d30) revenue30d += cents;

    const dk = dayKey(row.created_at);
    salesByDay.set(dk, (salesByDay.get(dk) ?? 0) + cents / 100);
    ordersByDay.set(dk, (ordersByDay.get(dk) ?? 0) + 1);

    const pk = `${li.artistSlug}::${li.itemSlug}`;
    const prev = productAgg.get(pk) ?? { title: li.displayTitle, qty: 0, cents: 0 };
    prev.qty += li.qty;
    prev.cents += cents;
    productAgg.set(pk, prev);

    const ar = artistAgg.get(li.artistSlug) ?? { orders: 0, cents: 0 };
    ar.orders += 1;
    ar.cents += cents;
    artistAgg.set(li.artistSlug, ar);
  }

  const sortedDays = [...salesByDay.keys()].sort();
  const salesOverTime = sortedDays.map((d) => ({ date: d, revenue: Math.round((salesByDay.get(d) ?? 0) * 100) / 100 }));
  const ordersPerDay = sortedDays.map((d) => ({ date: d, orders: ordersByDay.get(d) ?? 0 }));

  const topProducts = [...productAgg.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 8);

  const topArtists = [...artistAgg.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 8);

  const paidOrders = orderRows.filter((r) => paidStatuses.has(String(r.payment_status)));
  const conversionRate =
    orderRows.length > 0 ? Math.round((paidOrders.length / orderRows.length) * 1000) / 10 : 0;

  return rbacApiJson({
    ok: true,
    kpis: {
      totalOrders: orderCount ?? orderRows.length,
      activeUsers: profileCount ?? 0,
      catalogProducts: typeof productCount === "number" ? productCount : 0,
      revenueTotal: Math.round(revenueTotalCents) / 100,
      revenue7d: Math.round(revenue7d) / 100,
      revenue30d: Math.round(revenue30d) / 100,
      conversionRate,
    },
    charts: {
      salesOverTime,
      ordersPerDay,
      topProducts,
      topArtists,
    },
  });
}
