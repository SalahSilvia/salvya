"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorAnalyticsPayload } from "@/lib/creator/monetization-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { CreatorStudioKpi } from "@/components/creator/CreatorStudioKpi";
import { SalvyaInlineLoader } from "@/components/loading";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

export function CreatorAnalyticsExperience() {
  const reduceMotion = useReducedMotion();
  const [analytics, setAnalytics] = useState<CreatorAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignId, setCampaignId] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const qs = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
      const res = await fetch(`/api/creator/analytics${qs}`, {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as { ok?: boolean; analytics?: CreatorAnalyticsPayload };
      if (body.ok && body.analytics) setAnalytics(body.analytics);
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
  const maxHeatClicks = Math.max(1, ...(analytics?.hourHeatmap?.map((h) => h.clicks) ?? [1]));

  return (
    <motion.div className="space-y-8" {...fade} transition={{ duration: 0.4 }}>
      <header>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-[14px] text-white/45">
          Aggregated from creator events and earnings — per link CTR, campaigns, and hourly heatmap.
        </p>
      </header>

      {analytics?.campaigns?.length ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[13px] text-white/50" htmlFor="campaign-filter">
            Campaign
          </label>
          <select
            id="campaign-filter"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[13px] text-white"
          >
            <option value="">All traffic</option>
            {analytics.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
      >
        <CreatorStudioKpi
          label="Avg. conversion"
          value={loading ? "…" : `${analytics?.conversionRate ?? 0}%`}
          accent="fuchsia"
        />
        <CreatorStudioKpi label="Total clicks" value={loading ? "…" : (analytics?.totalClicks ?? 0)} accent="violet" />
        <CreatorStudioKpi
          label="Attributed orders"
          value={loading ? "…" : (analytics?.totalOrders ?? 0)}
          accent="emerald"
        />
      </motion.div>

      {analytics?.hourHeatmap?.length ? (
        <motion.section
          className={`rounded-2xl p-5 ${creatorCardSurface}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <h2 className="text-sm font-semibold">Clicks by hour (UTC)</h2>
          <div className="mt-4 grid grid-cols-12 gap-1 sm:grid-cols-24">
            {analytics.hourHeatmap.map((h) => (
              <motion.div
                key={h.hour}
                title={`${h.hour}:00 — ${h.clicks} clicks, ${h.orders} orders`}
                className="flex flex-col items-center gap-1"
                layout={!reduceMotion}
              >
                <motion.div
                  className="w-full min-h-[4px] rounded-sm bg-violet-500/80"
                  style={{ height: `${Math.max(4, (h.clicks / maxHeatClicks) * 48)}px` }}
                />
                <span className="text-[9px] text-white/30">{h.hour}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ) : null}

      {analytics?.campaigns && analytics.campaigns.length > 1 ? (
        <motion.section
          className={`overflow-hidden rounded-2xl ${creatorCardSurface}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09, duration: 0.35 }}
        >
          <motion.div className="border-b border-white/[0.08] px-4 py-3" layout={!reduceMotion}>
            <h2 className="text-sm font-semibold">Campaign comparison</h2>
          </motion.div>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-white/40">
                <th className="px-4 py-2 font-semibold">Campaign</th>
                <th className="px-4 py-2 font-semibold">Clicks</th>
                <th className="px-4 py-2 font-semibold">Orders</th>
                <th className="px-4 py-2 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.campaigns.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.06]">
                  <td className="px-4 py-2.5 font-medium text-white/90">{c.name}</td>
                  <td className="px-4 py-2.5 tabular-nums">{c.totalClicks}</td>
                  <td className="px-4 py-2.5 tabular-nums">{c.totalOrders}</td>
                  <td className="px-4 py-2.5 tabular-nums text-emerald-200/80">
                    {formatCreatorMoney(c.revenueMinor, analytics.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>
      ) : null}

      <motion.section
        className={`overflow-hidden rounded-2xl ${creatorCardSurface}`}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <motion.div className="border-b border-white/[0.08] px-4 py-3" layout={!reduceMotion}>
          <h2 className="text-sm font-semibold">Product ranking by revenue</h2>
          {!loading && analytics ? (
            <p className="mt-1 text-[12px] text-white/40">
              Total revenue: {formatCreatorMoney(analytics.totalRevenueMinor, analytics.currency)}
            </p>
          ) : null}
        </motion.div>
        {loading ? (
          <SalvyaInlineLoader message="Loading analytics" variant="creator" />
        ) : !analytics?.links.length ? (
          <p className="px-4 py-10 text-center text-[13px] text-white/45">
            No data yet.{" "}
            <Link href="/creator/products" className="font-semibold text-fuchsia-300/90">
              Promote a product
            </Link>
          </p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-white/40">
                <th className="px-4 py-2 font-semibold">Product</th>
                <th className="px-4 py-2 font-semibold">Code</th>
                <th className="px-4 py-2 font-semibold">Clicks</th>
                <th className="px-4 py-2 font-semibold">Orders</th>
                <th className="px-4 py-2 font-semibold">CTR</th>
                <th className="px-4 py-2 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.links.map((link) => (
                <tr key={link.linkId} className="border-t border-white/[0.06]">
                  <td className="px-4 py-2.5 font-medium text-white/90">{link.productTitle}</td>
                  <td className="px-4 py-2.5 font-mono text-white/55">{link.trackingCode}</td>
                  <td className="px-4 py-2.5 tabular-nums">{link.clicks}</td>
                  <td className="px-4 py-2.5 tabular-nums">{link.orders}</td>
                  <td className="px-4 py-2.5 tabular-nums">{link.conversionRate}%</td>
                  <td className="px-4 py-2.5 tabular-nums text-emerald-200/80">
                    {formatCreatorMoney(link.revenueMinor, analytics.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.section>
    </motion.div>
  );
}
