"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { adminErrorBox, adminInputClass, adminMuted, adminTableWrap } from "@/components/admin/admin-theme";

type FxRow = {
  id: string;
  base_currency: string;
  quote_currency: string;
  rate: number;
  effective_at: string;
};

export default function AdminFxPage() {
  const [rates, setRates] = useState<FxRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState("EUR");
  const [quote, setQuote] = useState("USD");
  const [rate, setRate] = useState("1.08");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/fx/rates", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; rates?: FxRow[]; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Load failed");
      setRates(body.rates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/fx/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ baseCurrency: base, quoteCurrency: quote, rate: Number.parseFloat(rate) }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="FX rates"
        description="Admin-managed exchange rates. Env vars are fallback only when DB is empty."
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

      <section className={adminTableWrap}>
        <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold">Update rate</h2>
        <div className="flex flex-wrap gap-3 p-4">
          <select value={base} onChange={(e) => setBase(e.target.value)} className={adminInputClass}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="MAD">MAD</option>
          </select>
          <select value={quote} onChange={(e) => setQuote(e.target.value)} className={adminInputClass}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="MAD">MAD</option>
          </select>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={adminInputClass}
            placeholder="Rate"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-lg bg-[#2D6BFF] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </section>

      <section className={adminTableWrap}>
        <h2 className="border-b border-[#e3e5e7] px-4 py-3 text-[13px] font-semibold">Latest rates</h2>
        <ul className="divide-y divide-[#e3e5e7] px-4 py-2">
          {rates.length ? (
            rates.map((r) => (
              <li key={r.id} className="py-2 font-mono text-[12px] text-[#42474c]">
                1 {r.base_currency} = {r.rate} {r.quote_currency}
                <span className={`ml-2 ${adminMuted}`}>{new Date(r.effective_at).toLocaleString()}</span>
              </li>
            ))
          ) : (
            <li className={`py-3 ${adminMuted}`}>No rates in database</li>
          )}
        </ul>
      </section>
    </div>
  );
}
