import { computeLiveUsers } from "@/lib/admin/analytics-snapshot";
import { adminOrderTotalCents, adminOrderTotalCentsFromDbRow } from "@/lib/admin/order-money";
import { loadStoreSettings } from "@/lib/admin/store-settings";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isOrderLineItem } from "@/lib/orders/validate";
import { rowToCustomerOrder } from "@/lib/orders/validate";

const ORDER_SELECT =
  "id, order_number, placement_key, user_id, shipping_address_id, line_item, shipping, payment, fulfillment_status, payment_status, final_price, order_currency, created_at, updated_at";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export type AdminOverviewSnapshot = {
  generatedAt: string;
  profile: { displayName: string; email: string | null };
  system: {
    maintenanceMode: boolean;
    storeName: string;
    serviceRoleConfigured: boolean;
    resendConfigured: boolean;
  };
  ops: {
    pendingCreatorApplications: number;
    readyToShip: number;
    needsTracking: number;
    pendingOrders: number;
    lowStockProducts: number;
  };
  security: {
    adminCount: number;
    recentAuditCount: number;
  };
  kpis: {
    totalOrders: number;
    activeUsers: number;
    catalogProducts: number;
    revenueTotal: number;
    revenue7d: number;
    revenue30d: number;
    conversionRate: number;
  };
  charts: {
    salesOverTime: { date: string; revenue: number }[];
    ordersPerDay: { date: string; orders: number }[];
    topProducts: { key: string; title: string; qty: number; cents: number }[];
    topArtists: { slug: string; orders: number; cents: number }[];
  };
  activity: {
    liveUsers: number;
    recentOrders: {
      id: string;
      orderNumber: string;
      buyerEmail: string;
      total: number;
      fulfillmentStatus: string;
      paymentStatus: string;
      createdAt: string;
    }[];
    newSignups: { userId: string; role: string; createdAt: string }[];
  };
  alerts: { id: string; severity: "info" | "warning" | "critical"; title: string; href?: string }[];
};

export async function buildAdminOverviewSnapshot(
  service: SupabaseClient,
  admin: { id: string; email?: string | null },
): Promise<AdminOverviewSnapshot> {
  const settings = await loadStoreSettings(service);
  const metaRes = await service.auth.admin.getUserById(admin.id);
  const meta = (metaRes.data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.display_name === "string" && meta.display_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    admin.email?.split("@")[0] ||
    "Admin";

  const [
    ordersRes,
    productsRes,
    orderCountRes,
    profileCountRes,
    adminCountRes,
    influencerPendingRes,
    recentOrdersRes,
    profilesRes,
    live,
    auditRes,
    lowStockRes,
  ] = await Promise.all([
    service
      .from("customer_orders")
      .select("id, created_at, line_item, final_price, order_currency, payment_status")
      .order("created_at", { ascending: false })
      .limit(2500),
    service.from("salvya_products").select("id", { count: "exact", head: true }),
    service.from("customer_orders").select("id", { count: "exact", head: true }),
    service.from("user_profiles").select("user_id", { count: "exact", head: true }),
    service.from("user_profiles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
    service.from("creator_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    service.from("customer_orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(12),
    service.from("user_profiles").select("user_id, role, created_at").order("created_at", { ascending: false }).limit(12),
    computeLiveUsers(service, 2).catch(() => ({ liveUsers: 0, since: new Date().toISOString() })),
    service.from("admin_audit_log").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    service
      .from("salvya_products")
      .select("id", { count: "exact", head: true })
      .eq("status", "live")
      .gt("stock", 0)
      .lte("stock", 5),
  ]);

  const readyRes = await service
    .from("customer_orders")
    .select("id", { count: "exact", head: true })
    .eq("fulfillment_status", "confirmed")
    .in("payment_status", ["paid", "authorized", "cod_pending"]);

  const needsTrackingRes = await service
    .from("customer_orders")
    .select("id", { count: "exact", head: true })
    .eq("fulfillment_status", "shipped")
    .or("shipping->>trackingNumber.is.null,shipping->>trackingNumber.eq.");

  const preparingRes = await service
    .from("customer_orders")
    .select("id", { count: "exact", head: true })
    .eq("fulfillment_status", "preparing");

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
  const paidOrders = orderRows.filter((r) => paidStatuses.has(String(r.payment_status)));
  const conversionRate =
    orderRows.length > 0 ? Math.round((paidOrders.length / orderRows.length) * 1000) / 10 : 0;

  const pendingCreatorApplications = influencerPendingRes.error ? 0 : influencerPendingRes.count ?? 0;
  const readyToShip = readyRes.error ? 0 : readyRes.count ?? 0;
  const needsTracking = needsTrackingRes.error ? 0 : needsTrackingRes.count ?? 0;
  const pendingOrders = (readyToShip ?? 0) + (preparingRes.error ? 0 : preparingRes.count ?? 0);

  const alerts: AdminOverviewSnapshot["alerts"] = [];

  if (settings.platform.maintenanceMode) {
    alerts.push({
      id: "maintenance",
      severity: "warning",
      title: "Maintenance mode is ON — customers see the banner",
      href: "/admin/settings?section=platform",
    });
  }
  if (pendingCreatorApplications > 0) {
    alerts.push({
      id: "creator-applications",
      severity: "info",
      title: `${pendingCreatorApplications} creator application${pendingCreatorApplications === 1 ? "" : "s"} awaiting review`,
      href: "/admin/creator-applications",
    });
  }
  if (readyToShip > 0) {
    alerts.push({
      id: "ship-ready",
      severity: pendingOrders > 5 ? "warning" : "info",
      title: `${readyToShip} order${readyToShip === 1 ? "" : "s"} ready to ship`,
      href: "/admin/shipping?queue=ready",
    });
  }
  if (needsTracking > 0) {
    alerts.push({
      id: "tracking",
      severity: "warning",
      title: `${needsTracking} shipped order${needsTracking === 1 ? "" : "s"} missing tracking`,
      href: "/admin/shipping?queue=needs_tracking",
    });
  }
  const lowStock = lowStockRes.error ? 0 : lowStockRes.count ?? 0;
  if (lowStock > 0) {
    alerts.push({
      id: "stock",
      severity: "warning",
      title: `${lowStock} published SKU${lowStock === 1 ? "" : "s"} at low stock (≤3)`,
      href: "/admin/products",
    });
  }
  if (!process.env.RESEND_API_KEY?.trim()) {
    alerts.push({
      id: "resend",
      severity: "info",
      title: "Customer emails log only — set RESEND_API_KEY to deliver inboxes",
      href: "/admin/emails",
    });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    alerts.push({
      id: "service-role",
      severity: "critical",
      title: "Supabase service role missing — admin APIs may fail",
      href: "/admin/settings?section=account",
    });
  }

  const recentOrders = (recentOrdersRes.data ?? [])
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

  return {
    generatedAt: new Date().toISOString(),
    profile: { displayName, email: admin.email ?? null },
    system: {
      maintenanceMode: settings.platform.maintenanceMode,
      storeName: settings.platform.storeName,
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    },
    ops: {
      pendingCreatorApplications,
      readyToShip,
      needsTracking,
      pendingOrders,
      lowStockProducts: lowStock,
    },
    security: {
      adminCount: adminCountRes.error ? 1 : adminCountRes.count ?? 1,
      recentAuditCount: auditRes.error ? 0 : auditRes.count ?? 0,
    },
    kpis: {
      totalOrders: orderCountRes.count ?? orderRows.length,
      activeUsers: profileCountRes.count ?? 0,
      catalogProducts: productsRes.error ? 0 : productsRes.count ?? 0,
      revenueTotal: Math.round(revenueTotalCents) / 100,
      revenue7d: Math.round(revenue7d) / 100,
      revenue30d: Math.round(revenue30d) / 100,
      conversionRate,
    },
    charts: {
      salesOverTime: sortedDays.map((d) => ({ date: d, revenue: Math.round((salesByDay.get(d) ?? 0) * 100) / 100 })),
      ordersPerDay: sortedDays.map((d) => ({ date: d, orders: ordersByDay.get(d) ?? 0 })),
      topProducts: [...productAgg.entries()]
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => b.cents - a.cents)
        .slice(0, 8),
      topArtists: [...artistAgg.entries()]
        .map(([slug, v]) => ({ slug, ...v }))
        .sort((a, b) => b.cents - a.cents)
        .slice(0, 8),
    },
    activity: {
      liveUsers: live.liveUsers,
      recentOrders,
      newSignups: (profilesRes.data ?? []).map((p) => ({
        userId: p.user_id,
        role: p.role,
        createdAt: p.created_at,
      })),
    },
    alerts,
  };
}
