"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorCampaign, CreatorInsightDaily } from "@/lib/creator/phase4-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

type GrowthPanelsProps = {
  currency?: string;
};

export function CreatorGrowthPanels({ currency = "EUR" }: GrowthPanelsProps) {
  const reduceMotion = useReducedMotion();
  const [insight, setInsight] = useState<CreatorInsightDaily | null>(null);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [insightRes, campaignsRes] = await Promise.all([
          fetch("/api/creator/insights", { credentials: "include", cache: "no-store" }),
          fetch("/api/creator/campaigns", { credentials: "include", cache: "no-store" }),
        ]);
        const insightBody = (await insightRes.json()) as { ok?: boolean; insight?: CreatorInsightDaily };
        const campaignsBody = (await campaignsRes.json()) as { ok?: boolean; campaigns?: CreatorCampaign[] };
        if (cancelled) return;
        if (insightBody.ok && insightBody.insight) setInsight(insightBody.insight);
        if (campaignsBody.ok && campaignsBody.campaigns) setCampaigns(campaignsBody.campaigns);
      } catch {
        /* optional overlay — never block dashboard */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const topCampaign = [...campaigns].sort((a, b) => b.revenueMinor - a.revenueMinor)[0] ?? null;
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenueMinor, 0);
  const totalSpend = campaigns.reduce((s, c) => s + (c.budgetOptional ?? 0), 0);
  const roiPct = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) : null;

  if (!loaded && !insight && !campaigns.length) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <motion.section className={`rounded-2xl p-5 ${creatorCardSurface}`} {...fade} transition={{ duration: 0.35 }}>
        <p className="text-[11px] font-bold uppercase tracking-wide text-violet-200/60">Campaign performance</p>
        {activeCampaigns.length ? (
          <>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{activeCampaigns.length} active</p>
            {roiPct !== null ? (
              <p className="mt-1 text-[13px] text-white/45">ROI {roiPct}% (revenue vs budget)</p>
            ) : (
              <p className="mt-1 text-[13px] text-white/45">
                Revenue {formatCreatorMoney(totalRevenue, currency)}
              </p>
            )}
            {topCampaign ? (
              <p className="mt-2 text-[13px] text-emerald-200/80">
                Top: {topCampaign.name} · {topCampaign.totalOrders} orders
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-[13px] text-white/45">No campaigns yet. Group promo links under one goal.</p>
        )}
      </motion.section>

      <motion.section
        className={`rounded-2xl p-5 ${creatorCardSurface}`}
        {...fade}
        transition={{ delay: 0.05, duration: 0.35 }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-fuchsia-200/60">AI insights</p>
        {insight ? (
          <>
            {insight.weekOverWeekPct !== null && insight.weekOverWeekPct > 0 ? (
              <p className="mt-2 text-lg font-semibold text-emerald-200/90">
                Trending +{insight.weekOverWeekPct}% this week
              </p>
            ) : (
              <p className="mt-2 text-lg font-semibold text-white/90">Performance snapshot</p>
            )}
            <p className="mt-2 text-[13px] leading-relaxed text-white/50">{insight.recommendationText}</p>
            {insight.topProductTitle ? (
              <p className="mt-2 text-[12px] text-white/40">Viral score {insight.viralScore}/100</p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-[13px] text-white/45">Insights refresh every 6 hours.</p>
        )}
      </motion.section>

      <motion.section
        className={`rounded-2xl p-5 ${creatorCardSurface}`}
        {...fade}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-200/60">Earnings forecast</p>
        {insight ? (
          <>
            <p className="mt-2 text-xl font-semibold tabular-nums text-white">
              7d {formatCreatorMoney(insight.forecast7dMinor, currency)}
            </p>
            <p className="mt-1 text-[13px] text-white/45">
              30d {formatCreatorMoney(insight.forecast30dMinor, currency)}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-fuchsia-500/80"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${insight.forecastConfidence}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="mt-1 text-[11px] text-white/35">Confidence {insight.forecastConfidence}%</p>
          </>
        ) : (
          <p className="mt-2 text-[13px] text-white/45">Forecast appears after more attributed activity.</p>
        )}
      </motion.section>
    </div>
  );
}
