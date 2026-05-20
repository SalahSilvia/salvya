"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import { AdminOrderDetailDrawer, type OrderHistoryEntry } from "@/components/admin/orders/AdminOrderDetailDrawer";
import { AdminFulfillmentBadge } from "@/components/admin/orders/AdminOrderStatusBadge";
import {
  ORDER_DATE_RANGE_OPTIONS,
  type OrderDateRange,
} from "@/lib/admin/order-filters";
import { downloadCsv } from "@/lib/admin/export-orders-csv";
import { ordersToPackingCsv } from "@/lib/admin/export-packing-csv";
import { carrierLabel } from "@/lib/admin/shipping-carriers";
import {
  parseShippingQueue,
  SHIPPING_QUEUE_TABS,
  type ShippingQueueTab,
} from "@/lib/admin/shipping-workflow";
import type { CustomerOrder, OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

type ShippingStats = {
  queueCounts: Record<ShippingQueueTab, number>;
  readyToShip: number;
  inTransit: number;
  needsTracking: number;
};

function formatAddress(o: CustomerOrder) {
  return [o.shipping.buyerAddress, o.shipping.buyerCity, o.shipping.buyerCountry].filter(Boolean).join(", ");
}

export function AdminShippingPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState<ShippingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [queue, setQueue] = useState<ShippingQueueTab>("ready");
  const [dateRange, setDateRange] = useState<OrderDateRange>("30d");
  const [hasMore, setHasMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const anchorRef = useRef<string | null>(null);
  const [detail, setDetail] = useState<CustomerOrder | null>(null);
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filterKey = useMemo(() => `${q}|${queue}|${dateRange}`, [q, queue, dateRange]);

  useEffect(() => {
    const fromUrl = parseShippingQueue(searchParams.get("queue"));
    if (fromUrl) setQueue(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(qInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({ range: dateRange });
      const res = await fetch(`/api/admin/shipping/stats?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; error?: string } & Partial<ShippingStats>;
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Stats failed");
      setStats({
        queueCounts: body.queueCounts ?? ({} as ShippingStats["queueCounts"]),
        readyToShip: body.readyToShip ?? 0,
        inTransit: body.inTransit ?? 0,
        needsTracking: body.needsTracking ?? 0,
      });
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [dateRange]);

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
        params.set("limit", "40");
        params.set("shipping", queue);
        params.set("sort", "desc");
        params.set("range", dateRange);
        if (q) params.set("q", q);
        if (append && anchorRef.current) params.set("cursor", anchorRef.current);

        const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as {
          ok?: boolean;
          orders?: CustomerOrder[];
          nextCursor?: string | null;
          error?: string;
        };
        if (!res.ok || !body.ok || !body.orders) throw new Error(body.error ?? "Failed to load");

        setOrders((prev) => (append ? [...prev, ...body.orders!] : body.orders!));
        anchorRef.current = body.nextCursor ?? null;
        setHasMore(Boolean(body.nextCursor));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    },
    [q, queue, dateRange],
  );

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    anchorRef.current = null;
    void fetchOrders(false);
  }, [filterKey, fetchOrders]);

  const openDetail = useCallback(async (o: CustomerOrder) => {
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
        void fetchOrders(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusyId(null);
      }
    },
    [fetchStats, fetchOrders],
  );

  const exportPackingList = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "500");
      params.set("shipping", queue);
      params.set("sort", "desc");
      params.set("range", dateRange);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; orders?: CustomerOrder[]; error?: string };
      if (!res.ok || !body.ok || !body.orders) throw new Error(body.error ?? "Export failed");
      downloadCsv(`salvya-packing-${queue}-${new Date().toISOString().slice(0, 10)}.csv`, ordersToPackingCsv(body.orders));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [q, queue, dateRange]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shipping"
        description="Fulfillment queue — pack orders, add tracking, and move packages through delivery. Customers track status on the storefront track-order page."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className={adminBtnSecondary}>
              All orders
            </Link>
            <Link href="/track-order" target="_blank" className={adminBtnSecondary}>
              Track page
            </Link>
            <button type="button" onClick={() => void fetchOrders(false)} className={adminBtnSecondary}>
              Refresh
            </button>
          </div>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Ready to ship"
          value={statsLoading ? "…" : String(stats?.readyToShip ?? 0)}
          hint="Paid · confirmed"
          accent="amber"
        />
        <AdminKpiCard
          label="In transit"
          value={statsLoading ? "…" : String(stats?.inTransit ?? 0)}
          accent="blue"
        />
        <AdminKpiCard
          label="Missing tracking"
          value={statsLoading ? "…" : String(stats?.needsTracking ?? 0)}
          hint="Shipped without ID"
          accent="violet"
        />
        <AdminKpiCard
          label="In view"
          value={String(orders.length)}
          hint="Current filter"
          accent="emerald"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SHIPPING_QUEUE_TABS.map((t) => {
            const count = stats?.queueCounts?.[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setQueue(t.id)}
                title={t.hint}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  queue === t.id
                    ? "bg-[#2D6BFF] text-white shadow-sm"
                    : "border border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf] hover:text-[#202223]"
                }`}
              >
                {t.label}
                {typeof count === "number" ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      queue === t.id ? "bg-white/20 text-white" : "bg-[#f6f6f7] text-[#6d7175]"
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
          <button
            type="button"
            disabled={exporting}
            onClick={() => void exportPackingList()}
            className={`min-h-[42px] ${adminBtnPrimary} disabled:opacity-45`}
          >
            {exporting ? "Exporting…" : "Export packing list"}
          </button>
          <button
            type="button"
            disabled={!orders.length}
            onClick={() =>
              downloadCsv(`salvya-packing-loaded-${Date.now()}.csv`, ordersToPackingCsv(orders))
            }
            className={`min-h-[42px] ${adminBtnSecondary} disabled:opacity-45`}
          >
            Export loaded
          </button>
        </div>
      </div>

      <div className={adminTableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-[13px]">
            <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Ship to</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Carrier / tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quick actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e5e7]">
              {orders.map((o) => {
                const busy = busyId === o.id;
                return (
                  <tr key={o.id} className="transition-colors hover:bg-[#f6f6f7]">
                    <td className="cursor-pointer px-4 py-3" onClick={() => void openDetail(o)}>
                      <p className="font-mono text-[12px] font-semibold text-[#2D6BFF]">{o.orderNumber}</p>
                      <p className={`mt-0.5 text-[11px] ${adminMuted}`}>{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="max-w-[200px] cursor-pointer px-4 py-3" onClick={() => void openDetail(o)}>
                      <p className="truncate font-medium text-[#202223]">{o.shipping.buyerName}</p>
                      <p className={`truncate text-[11px] ${adminMuted}`}>{formatAddress(o)}</p>
                    </td>
                    <td className="max-w-[180px] cursor-pointer px-4 py-3" onClick={() => void openDetail(o)}>
                      <p className="truncate text-[#202223]">{o.lineItem.displayTitle}</p>
                      <p className={`truncate text-[11px] ${adminMuted}`}>
                        {o.lineItem.qty}× {o.lineItem.size} · {o.lineItem.colorLabel}
                      </p>
                    </td>
                    <td className="max-w-[200px] cursor-pointer px-4 py-3" onClick={() => void openDetail(o)}>
                      <p className="text-[12px] text-[#202223]">{carrierLabel(o.shipping.carrier)}</p>
                      {o.shipping.trackingNumber ? (
                        <p className="mt-0.5 font-mono text-[10px] text-[#6d7175]">{o.shipping.trackingNumber}</p>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-amber-700">No tracking</p>
                      )}
                    </td>
                    <td className="cursor-pointer px-4 py-3" onClick={() => void openDetail(o)}>
                      <AdminFulfillmentBadge status={o.fulfillmentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {o.fulfillmentStatus === "confirmed" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void patchOrder(o.id, { fulfillmentStatus: "preparing", note: "Packing started" })}
                            className={adminBtnSecondary}
                          >
                            Start packing
                          </button>
                        ) : null}
                        {o.fulfillmentStatus === "preparing" || o.fulfillmentStatus === "confirmed" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void openDetail(o)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-800 disabled:opacity-45"
                          >
                            Ship…
                          </button>
                        ) : null}
                        {o.fulfillmentStatus === "shipped" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void patchOrder(o.id, { fulfillmentStatus: "delivered", note: "Delivered" })}
                            className={adminBtnSecondary}
                          >
                            Delivered
                          </button>
                        ) : null}
                        <button type="button" disabled={busy} onClick={() => void openDetail(o)} className={adminBtnSecondary}>
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!orders.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-[#6d7175]">
                    No orders in this shipping queue.
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

      {loading && !orders.length ? (
        <div className="h-32 animate-pulse rounded-xl bg-[#e3e5e7]/60" />
      ) : null}

      {detail ? (
        <AdminOrderDetailDrawer
          order={detail}
          history={history}
          loading={detailLoading}
          busy={busyId === detail.id}
          onClose={() => setDetail(null)}
          onPatch={(patch) => patchOrder(detail.id, patch)}
        />
      ) : null}
    </div>
  );
}
