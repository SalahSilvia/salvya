"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/admin-ui";
import { adminErrorBox, adminMuted, adminTableWrap } from "@/components/admin/admin-theme";
import type { AdminCreatorPromoInsights } from "@/lib/creator/product-link-types";

export function AdminCreatorPromoInsights() {
  const [insights, setInsights] = useState<AdminCreatorPromoInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/creator-promo-insights", { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; insights?: AdminCreatorPromoInsights; error?: string };
        if (!res.ok || !body.ok || !body.insights) throw new Error(body.error ?? "Failed to load");
        setInsights(body.insights);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalLinks = insights?.topProducts.reduce((s, p) => s + p.linkCount, 0) ?? 0;
  const totalClicks = insights?.topProducts.reduce((s, p) => s + p.clicks, 0) ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Creator promo insights"
        description="Lightweight view of promoted products and creators with the most trackable links (Phase 2)."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminKpiCard label="Promo links" value={loading ? "…" : String(totalLinks)} />
        <AdminKpiCard label="Total clicks" value={loading ? "…" : String(totalClicks)} />
        <AdminKpiCard label="Active creators" value={loading ? "…" : String(insights?.topCreators.length ?? 0)} />
      </div>

      {error ? <div className={`${adminErrorBox} mt-4`}>{error}</div> : null}

      {loading ? (
        <p className={`${adminMuted} mt-8`}>Loading insights…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className={adminTableWrap}>
            <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
              Top promoted products
            </h2>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-2 font-semibold">Product</th>
                  <th className="px-4 py-2 font-semibold">Links</th>
                  <th className="px-4 py-2 font-semibold">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {(insights?.topProducts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className={`px-4 py-8 text-center ${adminMuted}`}>
                      No promo links yet.
                    </td>
                  </tr>
                ) : (
                  insights!.topProducts.map((p) => (
                    <tr key={p.productId} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-900">{p.title}</td>
                      <td className="px-4 py-2 tabular-nums">{p.linkCount}</td>
                      <td className="px-4 py-2 tabular-nums">{p.clicks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={adminTableWrap}>
            <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
              Creators with most links
            </h2>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-2 font-semibold">Creator code</th>
                  <th className="px-4 py-2 font-semibold">Links</th>
                  <th className="px-4 py-2 font-semibold">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {(insights?.topCreators ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className={`px-4 py-8 text-center ${adminMuted}`}>
                      No creators with links yet.
                    </td>
                  </tr>
                ) : (
                  insights!.topCreators.map((c) => (
                    <tr key={c.creatorId} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-mono font-medium text-slate-900">{c.creatorCode}</td>
                      <td className="px-4 py-2 tabular-nums">{c.linkCount}</td>
                      <td className="px-4 py-2 tabular-nums">{c.clicks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
