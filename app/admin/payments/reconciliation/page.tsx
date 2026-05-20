"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { adminErrorBox, adminMuted, adminTableWrap } from "@/components/admin/admin-theme";

type ReconciliationPayload = {
  summary: {
    dbSalesTotalEur: number;
    paypalEstimateEur: number;
    deltaEur: number;
    paidOrderCount: number;
    refundedTotalEur: number;
    refundedCount: number;
    abandonedCount: number;
  };
  mismatchedOrders: { id: string; order_number: string; payment_status: string }[];
  failedCaptureLogs: { id: string; event_type: string; created_at: string; metadata?: unknown }[];
  missingWebhookAlerts: { id: string; order_number: string; payment_status: string; created_at: string }[];
};

export default function PaymentReconciliationPage() {
  const [data, setData] = useState<ReconciliationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments/reconciliation", {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as ReconciliationPayload & { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Load failed");
      setData({
        summary: body.summary,
        mismatchedOrders: body.mismatchedOrders ?? [],
        failedCaptureLogs: body.failedCaptureLogs ?? [],
        missingWebhookAlerts: body.missingWebhookAlerts ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment reconciliation"
        description="Daily DB totals vs PayPal-paid orders, mismatches, and failed capture audit events."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-[#e3e5e7] px-3 py-2 text-[13px] font-semibold"
          >
            Refresh
          </button>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}
      {loading && !data ? <p className={adminMuted}>Loading…</p> : null}

      {s ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="DB sales today (EUR)" value={s.dbSalesTotalEur.toFixed(2)} />
          <StatCard label="PayPal estimate (EUR)" value={s.paypalEstimateEur.toFixed(2)} />
          <StatCard label="Delta" value={s.deltaEur.toFixed(2)} warn={Math.abs(s.deltaEur) > 0.01} />
          <StatCard label="Refunded today" value={`${s.refundedTotalEur.toFixed(2)} (${s.refundedCount})`} />
        </div>
      ) : null}

      {data ? (
        <>
          <ListSection
            title="Paid without PayPal capture id"
            empty="No mismatches"
            rows={data.mismatchedOrders.map((o) => `${o.order_number} — ${o.payment_status}`)}
          />
          <ListSection
            title="Stale PayPal / missing webhook"
            empty="No alerts"
            rows={data.missingWebhookAlerts.map(
              (o) => `${o.order_number} — ${o.payment_status} since ${new Date(o.created_at).toLocaleString()}`,
            )}
          />
          <section className={adminTableWrap}>
            <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold text-[#202223]">
              Failed capture / refund logs (today)
            </h2>
            <ul className="max-h-80 divide-y divide-[#e3e5e7] overflow-y-auto px-4 py-2">
              {data.failedCaptureLogs.length ? (
                data.failedCaptureLogs.map((e) => (
                  <li key={e.id} className="py-2 text-[12px]">
                    <span className="font-semibold text-[#202223]">{e.event_type}</span>
                    <span className={`ml-2 ${adminMuted}`}>{new Date(e.created_at).toLocaleString()}</span>
                  </li>
                ))
              ) : (
                <li className={`py-3 ${adminMuted}`}>None today</li>
              )}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${warn ? "border-amber-200 bg-amber-50" : "border-[#e3e5e7] bg-white"}`}>
      <p className="text-[12px] font-medium text-[#6d7175]">{label}</p>
      <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#202223]">{value}</p>
    </div>
  );
}

function ListSection({ title, empty, rows }: { title: string; empty: string; rows: string[] }) {
  return (
    <section className={adminTableWrap}>
      <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold text-[#202223]">{title}</h2>
      <ul className="divide-y divide-[#e3e5e7] px-4 py-2">
        {rows.length ? (
          rows.map((r) => (
            <li key={r} className="py-2 font-mono text-[12px] text-[#42474c]">
              {r}
            </li>
          ))
        ) : (
          <li className={`py-3 text-[13px] ${adminMuted}`}>{empty}</li>
        )}
      </ul>
    </section>
  );
}
