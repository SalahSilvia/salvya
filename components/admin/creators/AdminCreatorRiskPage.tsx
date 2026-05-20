"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { CreatorRiskInsights } from "@/lib/creator/admin-risk-service";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";

export function AdminCreatorRiskPage() {
  const [insights, setInsights] = useState<CreatorRiskInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/creator-risk", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; insights?: CreatorRiskInsights; error?: string };
      if (body.ok && body.insights) {
        setInsights(body.insights);
        setError(null);
      } else {
        setError(body.error ?? "Failed to load");
      }
    } catch {
      setError("Failed to load creator risk data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <motion.div className="space-y-8 p-6 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Creator risk</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-white/50">
          Fraud flags, CTR anomalies, and blocked earnings from the creator trust layer.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">{error}</p>
      ) : null}

      <motion.div className="grid gap-4 sm:grid-cols-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">Blocked earnings</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-200">
            {loading ? "…" : formatCreatorMoney(insights?.blockedEarningsMinor ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">Suspicious creators</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {loading ? "…" : (insights?.suspiciousCreators.length ?? 0)}
          </p>
        </div>
        <motion.div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">CTR anomalies</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-fuchsia-200">
            {loading ? "…" : (insights?.ctrAnomalies.length ?? 0)}
          </p>
        </motion.div>
      </motion.div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Recent fraud flags</h2>
        </div>
        {loading ? (
          <p className="px-4 py-8 text-center text-[13px] text-white/45">Loading…</p>
        ) : !insights?.recentFlags.length ? (
          <p className="px-4 py-8 text-center text-[13px] text-white/45">No flags recorded yet.</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-white/40">
                <th className="px-4 py-2 font-semibold">When</th>
                <th className="px-4 py-2 font-semibold">Creator</th>
                <th className="px-4 py-2 font-semibold">Reason</th>
                <th className="px-4 py-2 font-semibold">Severity</th>
                <th className="px-4 py-2 font-semibold">Blocked</th>
              </tr>
            </thead>
            <tbody>
              {insights.recentFlags.map((f) => (
                <tr key={f.id} className="border-t border-white/[0.06]">
                  <td className="px-4 py-2.5 text-white/55">{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="max-w-[120px] truncate px-4 py-2.5 font-mono text-[11px] text-white/70">
                    {f.creatorId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2.5 text-white/80">{f.reason}</td>
                  <td className="px-4 py-2.5 capitalize">{f.severity}</td>
                  <td className="px-4 py-2.5">{f.autoBlocked ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {insights?.ctrAnomalies.length ? (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">CTR anomalies (clicks, no orders)</h2>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {insights.ctrAnomalies.map((a) => (
              <li key={a.creatorId} className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="font-mono text-white/60">{a.creatorId.slice(0, 12)}…</span>
                <span className="tabular-nums text-white/80">
                  {a.clicks} clicks · {a.orders} orders
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </motion.div>
  );
}
