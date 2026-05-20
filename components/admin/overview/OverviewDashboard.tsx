"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import {
  adminChartGrid,
  adminChartTick,
  adminErrorBox,
  adminBtnSecondary,
  adminLinkClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { AdminChartFrame } from "@/components/admin/AdminChartFrame";
import {
  AdminKpiCard,
  AdminLivePill,
  AdminPanel,
  AdminSectionHeader,
  adminTooltipClass,
} from "@/components/admin/admin-ui";
import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { useAdminUnreadOrdersContext } from "@/components/admin/AdminUnreadOrdersProvider";
import type { AdminOverviewSnapshot } from "@/lib/admin/overview-snapshot";

type AuditRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
};

const ALERT_STYLES = {
  info: "border-[#2D6BFF]/25 bg-[#eef4ff] text-[#1a5ae8]",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  critical: "border-rose-200 bg-rose-50 text-rose-900",
} as const;

function fmtEuro(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function fmtShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function GodAdminLink() {
  const { isGodAdmin } = useAdminPreferences();
  if (!isGodAdmin) return null;
  return (
    <Link
      href="/admin/god"
      className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-[13px] font-semibold text-violet-900 hover:bg-violet-100"
    >
      ✦ God Admin
    </Link>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewDashboard() {
  const { unread } = useAdminUnreadOrdersContext();
  const [overview, setOverview] = useState<AdminOverviewSnapshot | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setError(null);
    else setRefreshing(true);
    try {
      const [ovRes, auditRes] = await Promise.all([
        fetch("/api/admin/overview", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/audit?limit=8", { credentials: "include", cache: "no-store" }),
      ]);
      const ovBody = (await ovRes.json()) as { ok?: boolean; overview?: AdminOverviewSnapshot; error?: string };
      if (!ovRes.ok || !ovBody.ok || !ovBody.overview) {
        throw new Error(ovBody.error ?? "Could not load dashboard");
      }
      setOverview(ovBody.overview);
      if (auditRes.ok) {
        const aBody = (await auditRes.json()) as { ok?: boolean; log?: AuditRow[] };
        if (aBody.ok && aBody.log) setAudit(aBody.log);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(true), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  if (error) {
    return (
      <div className="space-y-3">
        <div className={adminErrorBox}>{error}</div>
        <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
          Retry
        </button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-xl bg-[#e3e5e7]/60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[#e3e5e7]/60" />
          ))}
        </div>
      </div>
    );
  }

  const chartOrders = overview.charts.ordersPerDay.slice(-14);
  const chartSales = overview.charts.salesOverTime.slice(-14);
  const { ops, system, security } = overview;

  return (
    <div className="space-y-6">
      {unread > 0 ? (
        <Link
          href="/admin/orders"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-900 transition-colors hover:bg-rose-100/80"
        >
          <span>
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-rose-600" aria-hidden />
            {unread} new {unread === 1 ? "order" : "orders"} waiting in the queue
          </span>
          <span className="font-semibold text-rose-700">Open orders →</span>
        </Link>
      ) : null}
      <section className={`relative overflow-hidden ${adminPanelClass} p-6 sm:p-8`}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#2D6BFF]/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2D6BFF]">Command center</p>
            <h2 className="mt-1 text-[1.5rem] font-semibold tracking-tight text-[#202223] sm:text-[1.75rem]">
              {greeting()}, {overview.profile.displayName}
            </h2>
            <p className={`mt-2 max-w-xl text-[14px] leading-relaxed ${adminMuted}`}>
              {system.storeName} · Secure admin session · Data refreshed {fmtShortDate(overview.generatedAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/admin/orders" className={`inline-flex items-center gap-1.5 ${adminBtnSecondary}`}>
                <AdminNavIconGlyph name="cart" className="h-3.5 w-3.5" />
                Orders
              </Link>
              <Link href="/admin/products/new" className={`inline-flex items-center gap-1.5 ${adminBtnSecondary}`}>
                <AdminNavIconGlyph name="plus" className="h-3.5 w-3.5" />
                New product
              </Link>
              <Link href="/admin/analytics" className={`inline-flex items-center gap-1.5 ${adminBtnSecondary}`}>
                <AdminNavIconGlyph name="chart" className="h-3.5 w-3.5" />
                Analytics
              </Link>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  system.serviceRoleConfigured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {system.serviceRoleConfigured ? "Service role OK" : "Service role missing"}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  system.resendConfigured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                {system.resendConfigured ? "Email delivery on" : "Email log-only mode"}
              </span>
              {system.maintenanceMode ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                  Maintenance active
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <AdminLivePill count={overview.activity.liveUsers} />
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className={adminBtnSecondary}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {overview.alerts.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-[13px] font-semibold text-[#202223]">Action required</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {overview.alerts.map((a) => (
              <li key={a.id}>
                {a.href ? (
                  <Link
                    href={a.href}
                    className={`block rounded-xl border px-4 py-3 text-[13px] font-medium transition-opacity hover:opacity-90 ${ALERT_STYLES[a.severity]}`}
                  >
                    {a.title} →
                  </Link>
                ) : (
                  <div className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${ALERT_STYLES[a.severity]}`}>
                    {a.title}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <AdminSectionHeader title="Operations" description="Queues, fulfillment, and admin tools" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link href="/admin/orders" className="block rounded-xl transition-opacity hover:opacity-90">
            <AdminKpiCard label="Ready to ship" value={String(ops.readyToShip)} accent="blue" hint="Paid · confirmed" />
          </Link>
          <Link href="/admin/creator-applications" className="block rounded-xl transition-opacity hover:opacity-90">
            <AdminKpiCard label="Creator applications" value={String(ops.pendingCreatorApplications)} accent="violet" hint="Pending review" />
          </Link>
          <Link href="/admin/shipping" className="block rounded-xl transition-opacity hover:opacity-90">
            <AdminKpiCard label="Missing tracking" value={String(ops.needsTracking)} accent="amber" hint="Shipped orders" />
          </Link>
          <Link href="/admin/products" className="block rounded-xl transition-opacity hover:opacity-90">
            <AdminKpiCard label="Low stock SKUs" value={String(ops.lowStockProducts)} accent="rose" hint="Published · ≤5 units" />
          </Link>
          <Link href="/admin/settings?section=account" className="block rounded-xl transition-opacity hover:opacity-90">
            <AdminKpiCard label="Admin operators" value={String(security.adminCount)} accent="emerald" hint={`${security.recentAuditCount} actions / 24h`} />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/shipping" className={`inline-flex items-center gap-2 ${adminBtnSecondary}`}>
            <AdminNavIconGlyph name="truck" className="h-4 w-4" />
            Shipping
          </Link>
          <Link href="/admin/creator-applications" className={`inline-flex items-center gap-2 ${adminBtnSecondary}`}>
            <AdminNavIconGlyph name="star" className="h-4 w-4" />
            Creator applications
          </Link>
          <Link href="/admin/emails" className={`inline-flex items-center gap-2 ${adminBtnSecondary}`}>
            <AdminNavIconGlyph name="mail" className="h-4 w-4" />
            Email center
          </Link>
          <Link href="/admin/settings?section=account" className={`inline-flex items-center gap-2 ${adminBtnSecondary}`}>
            <AdminNavIconGlyph name="gear" className="h-4 w-4" />
            Account & security
          </Link>
          <GodAdminLink />
        </div>
      </section>

      <section className="space-y-3">
        <AdminSectionHeader title="Business snapshot" description="Revenue and catalog health" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Revenue (all time)"
          value={fmtEuro(overview.kpis.revenueTotal)}
          accent="emerald"
          trend={{ label: `${fmtEuro(overview.kpis.revenue30d)} last 30 days`, positive: true }}
          icon={<AdminNavIconGlyph name="chart" className="h-5 w-5" />}
        />
        <AdminKpiCard
          label="Total orders"
          value={String(overview.kpis.totalOrders)}
          accent="blue"
          trend={{ label: `${fmtEuro(overview.kpis.revenue7d)} last 7 days`, positive: true }}
          icon={<AdminNavIconGlyph name="cart" className="h-5 w-5 text-[#9eb4ff]" />}
        />
        <AdminKpiCard
          label="Customers"
          value={String(overview.kpis.activeUsers)}
          accent="violet"
          hint="Profiles with Salvya roles"
          icon={<AdminNavIconGlyph name="users" className="h-5 w-5" />}
        />
        <AdminKpiCard
          label="Catalog SKUs"
          value={String(overview.kpis.catalogProducts)}
          accent="amber"
          hint={`${overview.kpis.conversionRate}% paid conversion`}
          icon={<AdminNavIconGlyph name="shirt" className="h-5 w-5" />}
        />
        </div>
      </section>

      <section className="space-y-3">
        <AdminSectionHeader title="Activity" description="Latest orders and admin actions" />
        <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Recent orders" subtitle="Latest checkout placements" className="lg:col-span-2">
          <ul className="divide-y divide-[#e3e5e7]">
            {overview.activity.recentOrders.length ? (
              overview.activity.recentOrders.slice(0, 8).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px]">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#202223]">{o.orderNumber}</p>
                    <p className="mt-0.5 truncate text-[12px] text-[#6d7175]">{o.buyerEmail}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 text-right">
                    <span className="rounded-full border border-[#e3e5e7] bg-[#f6f6f7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6d7175]">
                      {o.fulfillmentStatus}
                    </span>
                    <span className="font-semibold tabular-nums text-emerald-700">{fmtEuro(o.total)}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-8 text-center text-[13px] text-[#6d7175]">No orders yet.</li>
            )}
          </ul>
          <Link href="/admin/orders" className="mt-4 inline-flex text-[13px] font-semibold text-[#2D6BFF] hover:text-[#1a5ae8]">
            View all orders →
          </Link>
        </AdminPanel>

        <AdminPanel title="Security log" subtitle="Recent admin actions">
          <ul className="divide-y divide-[#e3e5e7]">
            {audit.length ? (
              audit.map((row) => (
                <li key={row.id} className="py-2.5 text-[12px]">
                  <p className="font-medium text-[#202223]">{row.action}</p>
                  <p className={`mt-0.5 ${adminMuted}`}>
                    {row.targetType ?? "—"}
                    {row.targetId ? ` · ${row.targetId.slice(0, 8)}…` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8c9196]">{fmtShortDate(row.createdAt)}</p>
                </li>
              ))
            ) : (
              <li className={`py-6 text-center text-[13px] ${adminMuted}`}>
                Audit log empty — actions appear after settings or creator updates.
              </li>
            )}
          </ul>
        </AdminPanel>
        </div>
      </section>

      <section className="space-y-3">
        <AdminSectionHeader title="Trends" description="Trailing 14 days" />
        <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Sales over time" subtitle="Trailing 14 days · EUR estimates">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <LineChart data={chartSales} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={adminChartGrid} strokeDasharray="3 6" />
                <XAxis dataKey="date" tick={{ fill: adminChartTick, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: adminChartTick, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className={adminTooltipClass}>
                        <p className={`text-[11px] ${adminMuted}`}>{label}</p>
                        <p className="mt-1 font-semibold text-[#202223]">€{payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
                <Line type="monotone" dataKey="revenue" stroke="#2D6BFF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminPanel>

        <AdminPanel title="Orders per day" subtitle="Trailing 14 days">
          <AdminChartFrame>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <BarChart data={chartOrders} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={adminChartGrid} strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: adminChartTick, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: adminChartTick, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(45,107,255,0.12)" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className={adminTooltipClass}>
                        <p className={`text-[11px] ${adminMuted}`}>{label}</p>
                        <p className="mt-1 font-semibold text-[#202223]">{payload[0].value} orders</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="orders" fill="#108043" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AdminChartFrame>
        </AdminPanel>
        </div>
      </section>

      <section className="space-y-3">
        <AdminSectionHeader title="Catalog & growth" />
        <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Top products" subtitle="By revenue in sample">
          <ul className="divide-y divide-[#e3e5e7]">
            {overview.charts.topProducts.map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-3 py-3 text-[13px]">
                <span className="min-w-0 truncate text-[#202223]">{p.title}</span>
                <span className="shrink-0 font-medium tabular-nums text-emerald-700">{fmtEuro(p.cents / 100)}</span>
              </li>
            ))}
            {!overview.charts.topProducts.length ? (
              <li className={`py-6 text-center text-[13px] ${adminMuted}`}>No orders yet.</li>
            ) : null}
          </ul>
        </AdminPanel>
        <AdminPanel title="New signups" subtitle="Latest accounts">
          <ul className="divide-y divide-[#e3e5e7]">
            {overview.activity.newSignups.length ? (
              overview.activity.newSignups.slice(0, 6).map((s) => (
                <li key={s.userId} className="flex items-center justify-between gap-2 py-3 text-[13px]">
                  <span className="capitalize text-[#202223]">{s.role}</span>
                  <span className={`text-[11px] ${adminMuted}`}>{fmtShortDate(s.createdAt)}</span>
                </li>
              ))
            ) : (
              <li className={`py-6 text-center text-[13px] ${adminMuted}`}>No signups yet.</li>
            )}
          </ul>
          <Link href="/admin/customers" className={`mt-4 inline-flex text-[13px] ${adminLinkClass}`}>
            Customer directory →
          </Link>
        </AdminPanel>
        </div>
      </section>
    </div>
  );
}
