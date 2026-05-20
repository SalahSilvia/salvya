"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { adminErrorBox, adminMuted, adminTableWrap } from "@/components/admin/admin-theme";
import type { FraudEvent } from "@/lib/security/fraud-log";

type FraudSummary = {
  topIps: { key: string; count: number }[];
  topEmails: { key: string; count: number }[];
  recent: FraudEvent[];
};

export default function AdminSecurityPage() {
  const [data, setData] = useState<FraudSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/security/fraud?limit=80", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as FraudSummary & { ok?: boolean; error?: string };
      if (!res.ok || body.ok === false) throw new Error(body.error ?? "Could not load fraud log");
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security"
        description="Recent blocked or suspicious checkout activity (in-memory; resets on deploy)."
        actions={
          <button type="button" onClick={() => void load()} className="rounded-lg border border-[#e3e5e7] px-3 py-2 text-[13px] font-semibold">
            Refresh
          </button>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}
      {loading && !data ? <p className={adminMuted}>Loading…</p> : null}

      {data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={adminTableWrap}>
              <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold text-[#202223]">Top IPs</h2>
              <ul className="divide-y divide-[#e3e5e7] px-4 py-2">
                {data.topIps.length ? (
                  data.topIps.map((row) => (
                    <li key={row.key} className="flex justify-between py-2 text-[13px]">
                      <span className="font-mono text-[12px]">{row.key}</span>
                      <span className="tabular-nums text-[#6d7175]">{row.count}</span>
                    </li>
                  ))
                ) : (
                  <li className={`py-3 text-[13px] ${adminMuted}`}>No events yet</li>
                )}
              </ul>
            </section>
            <section className={adminTableWrap}>
              <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold text-[#202223]">Top emails</h2>
              <ul className="divide-y divide-[#e3e5e7] px-4 py-2">
                {data.topEmails.length ? (
                  data.topEmails.map((row) => (
                    <li key={row.key} className="flex justify-between gap-2 py-2 text-[13px]">
                      <span className="truncate">{row.key}</span>
                      <span className="shrink-0 tabular-nums text-[#6d7175]">{row.count}</span>
                    </li>
                  ))
                ) : (
                  <li className={`py-3 text-[13px] ${adminMuted}`}>No events yet</li>
                )}
              </ul>
            </section>
          </div>

          <section className={adminTableWrap}>
            <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold text-[#202223]">Recent events</h2>
            <ul className="max-h-[28rem] divide-y divide-[#e3e5e7] overflow-y-auto px-4 py-2">
              {data.recent.map((e) => (
                <li key={e.id} className="py-2.5 text-[12px]">
                  <p className="font-semibold text-[#202223]">
                    {e.type}
                    <span className={`ml-2 font-normal ${adminMuted}`}>{new Date(e.at).toLocaleString()}</span>
                  </p>
                  {e.ip ? <p className={adminMuted}>IP {e.ip}</p> : null}
                  {e.email ? <p className={adminMuted}>{e.email}</p> : null}
                  {e.meta ? (
                    <pre className="mt-1 overflow-x-auto rounded bg-[#f6f6f7] p-2 text-[11px] text-[#6d7175]">
                      {JSON.stringify(e.meta)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
