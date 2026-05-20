"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminUnreadOrdersContext } from "@/components/admin/AdminUnreadOrdersProvider";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { AdminPageHeader, AdminKpiCard, AdminSectionHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import { AdminOrderDetailDrawer, type OrderHistoryEntry } from "@/components/admin/orders/AdminOrderDetailDrawer";
import { AdminFulfillmentBadge, AdminPaymentBadge } from "@/components/admin/orders/AdminOrderStatusBadge";
import {
  ORDER_DATE_RANGE_OPTIONS,
  ORDER_PAYMENT_METHOD_OPTIONS,
  type OrderDateRange,
  type OrderPaymentMethodFilter,
} from "@/lib/admin/order-filters";
import { downloadCsv, ordersToCsv } from "@/lib/admin/export-orders-csv";
import {
  adminOrderTotalCents,
  formatAdminEuroFromCents,
  formatAdminOrderTotal,
  formatOrderTotalPaid,
  orderTotalMinor,
} from "@/lib/admin/order-money";
import type { OrderWorkflowTab } from "@/lib/admin/order-workflow";
import type { CustomerOrder, OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

const WORKFLOW_TABS: { id: OrderWorkflowTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending pay" },
  { id: "paid", label: "Paid" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

type QueueStats = {
  tabCounts: Record<OrderWorkflowTab, number>;
  todayOrderCount: number;
  todayRevenueCents: number;
  readyToShip: number;
};

function payMethodLabel(o: CustomerOrder) {
  return o.payment.method === "cod" ? "COD" : "PayPal";
}

export function AdminOrdersPage() {
  const { markSeen } = useAdminUnreadOrdersContext();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [workflow, setWorkflow] = useState<OrderWorkflowTab>("all");
  const [dateRange, setDateRange] = useState<OrderDateRange>("30d");
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethodFilter>("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const anchorRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerOrder | null>(null);
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filterKey = useMemo(
    () => `${q}|${workflow}|${sortDesc ? "desc" : "asc"}|${dateRange}|${paymentMethod}`,
    [q, workflow, sortDesc, dateRange, paymentMethod],
  );

  useEffect(() => {
    void markSeen();
  }, [markSeen]);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(qInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("range", dateRange);
      params.set("method", paymentMethod);
      const res = await fetch(`/api/admin/orders/stats?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; error?: string } & Partial<QueueStats>;
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Stats failed");
      setStats({
        tabCounts: body.tabCounts ?? ({} as QueueStats["tabCounts"]),
        todayOrderCount: body.todayOrderCount ?? 0,
        todayRevenueCents: body.todayRevenueCents ?? 0,
        readyToShip: body.readyToShip ?? 0,
      });
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [dateRange, paymentMethod]);

  const fetchOrders = useCallback(
    async (append: boolean) => {
      if (!append) {
        anchorRef.current = null;
        setHasMore(false);
        setLoading(true);
      }
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", "30");
        if (q) params.set("q", q);
        if (workflow !== "all") params.set("workflow", workflow);
        params.set("sort", sortDesc ? "desc" : "asc");
        params.set("range", dateRange);
        params.set("method", paymentMethod);
        if (append && anchorRef.current) params.set("cursor", anchorRef.current);

        const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as {
          ok?: boolean;
          orders?: CustomerOrder[];
          nextCursor?: string | null;
          error?: string;
        };
        if (!res.ok || !body.ok || !body.orders) throw new Error(body.error ?? "Failed to load orders");

        setOrders((prev) => (append ? [...prev, ...body.orders!] : body.orders!));
        anchorRef.current = body.nextCursor ?? null;
        setHasMore(Boolean(body.nextCursor));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    },
    [q, workflow, sortDesc, dateRange, paymentMethod],
  );

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    anchorRef.current = null;
    void fetchOrders(false);
  }, [filterKey, fetchOrders]);

  const loadedRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + adminOrderTotalCents(o), 0),
    [orders],
  );

  const openDetail = useCallback(async (o: CustomerOrder) => {
    setSelectedId(o.id);
    setDetail(o);
    setHistory([]);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${o.id}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as {
        ok?: boolean;
        order?: CustomerOrder;
        history?: OrderHistoryEntry[];
        error?: string;
      };
      if (res.ok && body.ok && body.order) {
        setDetail(body.order);
        setHistory(Array.isArray(body.history) ? body.history : []);
      }
    } catch {
      /* keep list row */
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const patchOrder = useCallback(
    async (
      id: string,
      patch: {
        fulfillmentStatus?: OrderFulfillmentStatus;
        paymentStatus?: OrderPaymentStatus;
        note?: string;
        trackingNumber?: string;
        carrier?: string;
        trackingUrl?: string;
      },
    ) => {
      setBusyId(id);
      setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const body = (await res.json()) as {
          ok?: boolean;
          order?: CustomerOrder;
          history?: OrderHistoryEntry[];
          error?: string;
        };
        if (!res.ok || !body.ok || !body.order) throw new Error(body.error ?? "Update failed");
        setOrders((prev) => prev.map((x) => (x.id === id ? body.order! : x)));
        setDetail((d) => (d?.id === id ? body.order! : d));
        if (Array.isArray(body.history)) setHistory(body.history);
        void fetchStats();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusyId(null);
      }
    },
    [fetchStats],
  );

  const refundOrder = useCallback(
    async (id: string, reason: string) => {
      setBusyId(id);
      setError(null);
      try {
        const res = await fetch("/api/admin/orders/refund", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, reason, idempotencyKey: `refund-${id}` }),
        });
        const body = (await res.json()) as {
          ok?: boolean;
          order?: CustomerOrder;
          error?: string;
        };
        if (!res.ok || !body.ok || !body.order) throw new Error(body.error ?? "Refund failed");
        setOrders((prev) => prev.map((x) => (x.id === id ? body.order! : x)));
        setDetail((d) => (d?.id === id ? body.order! : d));
        void fetchStats();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Refund failed");
      } finally {
        setBusyId(null);
      }
    },
    [fetchStats],
  );

  const exportAllMatching = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "500");
      if (q) params.set("q", q);
      if (workflow !== "all") params.set("workflow", workflow);
      params.set("sort", sortDesc ? "desc" : "asc");
      params.set("range", dateRange);
      params.set("method", paymentMethod);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; orders?: CustomerOrder[]; error?: string };
      if (!res.ok || !body.ok || !body.orders) throw new Error(body.error ?? "Export failed");
      downloadCsv(`salvya-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(body.orders));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [q, workflow, sortDesc, dateRange, paymentMethod]);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setSelectedId(null);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Fulfillment queue — filter, update status, add tracking, and export for shipping partners."
        actions={
          <>
            <button
              type="button"
              disabled={exporting}
              onClick={() => void exportAllMatching()}
              className={`${adminBtnSecondary} disabled:opacity-45`}
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button type="button" onClick={() => void fetchOrders(false)} className={adminBtnSecondary}>
              Refresh
            </button>
          </>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <section className="space-y-3">
        <AdminSectionHeader title="Queue snapshot" description="Counts respect date range and payment filters" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Orders today"
          value={statsLoading ? "…" : String(stats?.todayOrderCount ?? 0)}
          hint="Since midnight UTC"
          accent="blue"
        />
        <AdminKpiCard
          label="Revenue today"
          value={statsLoading ? "…" : formatAdminEuroFromCents(stats?.todayRevenueCents ?? 0)}
          accent="emerald"
        />
        <button type="button" onClick={() => setWorkflow("paid")} className="block rounded-xl text-left transition-opacity hover:opacity-90">
          <AdminKpiCard
            label="Ready to ship"
            value={statsLoading ? "…" : String(stats?.readyToShip ?? 0)}
            hint="Paid · confirmed — tap to filter"
            accent="amber"
          />
        </button>
        <AdminKpiCard
          label="Loaded total"
          value={formatAdminEuroFromCents(loadedRevenue)}
          hint={`${orders.length} orders in view`}
          accent="violet"
        />
        </div>
      </section>

      <section className={`${adminPanelClass} p-4 sm:p-5`}>
        <AdminSectionHeader title="Workflow" description="Filter by fulfillment stage" />
        <div className="mt-4 flex flex-wrap gap-2">
          {WORKFLOW_TABS.map((t) => {
            const count = stats?.tabCounts?.[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setWorkflow(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  workflow === t.id
                    ? "bg-[#2D6BFF] text-white shadow-sm"
                    : "border border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf] hover:text-[#202223]"
                }`}
              >
                {t.label}
                {typeof count === "number" ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      workflow === t.id ? "bg-white/20 text-white" : "bg-[#f6f6f7] text-[#6d7175]"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Search</span>
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Order # or email"
              className={`min-h-[42px] ${adminInputClass}`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Date range</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as OrderDateRange)}
              className={`min-h-[42px] min-w-[9rem] ${adminInputClass}`}
            >
              {ORDER_DATE_RANGE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Payment</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as OrderPaymentMethodFilter)}
              className={`min-h-[42px] min-w-[9rem] ${adminInputClass}`}
            >
              {ORDER_PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setSortDesc((v) => !v)} className={`min-h-[42px] ${adminBtnSecondary}`}>
            Sort · {sortDesc ? "Newest" : "Oldest"}
          </button>
          <button
            type="button"
            disabled={!orders.length}
            onClick={() => downloadCsv(`salvya-orders-loaded-${Date.now()}.csv`, ordersToCsv(orders))}
            className={`min-h-[42px] ${adminBtnSecondary} disabled:opacity-45`}
          >
            Export loaded
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <AdminSectionHeader
          title="Order list"
          description={loading && !orders.length ? "Loading…" : `${orders.length} orders in this view`}
        /><div className={`${adminTableWrap} ${loading && orders.length ? "opacity-70" : ""}`}>
        <div className="divide-y divide-[#e3e5e7] lg:hidden">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => void openDetail(o)}
              className={`flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-[#f6f6f7] ${
                selectedId === o.id ? "bg-[#eef4ff]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-[12px] font-semibold text-[#2D6BFF]">{o.orderNumber}</p>
                <span className="font-semibold tabular-nums text-emerald-700">{formatAdminOrderTotal(o)}</span>
              </div>
              <p className="truncate text-[14px] font-medium text-[#202223]">{o.shipping.buyerName}</p>
              <p className={`truncate text-[12px] ${adminMuted}`}>{o.lineItem.displayTitle}</p><div className="flex flex-wrap items-center gap-2">
                <AdminFulfillmentBadge status={o.fulfillmentStatus} />
                <AdminPaymentBadge status={o.paymentStatus} />
              </div>
            </button>
          ))}
          {!orders.length && !loading ? (
            <p className={`px-4 py-10 text-center text-[13px] ${adminMuted}`}>No orders match these filters.</p>
          ) : null}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-10" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e5e7]">
              {loading && !orders.length
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded bg-[#e3e5e7]/70" />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className={`cursor-pointer transition-colors hover:bg-[#f6f6f7] ${
                    selectedId === o.id ? "bg-[#eef4ff] ring-1 ring-inset ring-[#2D6BFF]/25" : ""
                  }`}
                  onClick={() => void openDetail(o)}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] font-semibold text-[#2D6BFF]">{o.orderNumber}</p>
                    {o.shipping.trackingNumber ? (
                      <p className={`mt-0.5 font-mono text-[10px] ${adminMuted}`}>{o.shipping.trackingNumber}</p>
                    ) : null}
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    <p className="truncate font-medium text-[#202223]">{o.shipping.buyerName}</p>
                    <p className={`truncate text-[12px] ${adminMuted}`}>{o.shipping.buyerEmail}</p>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-[#202223]">{o.lineItem.displayTitle}</p>
                    <p className={`truncate text-[11px] ${adminMuted}`}>{o.lineItem.artistSlug}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-emerald-700">
                    <p>{formatAdminOrderTotal(o)}</p>
                    {orderTotalMinor(o).currency !== "EUR" ? (
                      <p className={`mt-0.5 text-[10px] font-normal ${adminMuted}`}>{formatOrderTotalPaid(o)} paid</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-[#202223]">{payMethodLabel(o)}</p>
                    <AdminPaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminFulfillmentBadge status={o.fulfillmentStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#6d7175]">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#8c9196]">
                    <AdminNavIconGlyph name="pen" className="h-4 w-4" />
                  </td>
                </tr>
              ))}
              {!orders.length && !loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-[#6d7175]">
                    No orders match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e5e7] px-4 py-3">
          <span className={`text-[12px] ${adminMuted}`}>{orders.length} loaded</span>
          {hasMore ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void fetchOrders(true)}
              className={`${adminBtnPrimary} disabled:opacity-45`}
            >
              Load more
            </button>
          ) : null}
        </div>
      </div>
      </section>

      {detail ? (
        <AdminOrderDetailDrawer
          order={detail}
          history={history}
          loading={detailLoading}
          busy={busyId === detail.id}
          onClose={closeDetail}
          onPatch={(patch) => patchOrder(detail.id, patch)}
          onRefund={(reason) => refundOrder(detail.id, reason)}
        />
      ) : null}
    </div>
  );
}
