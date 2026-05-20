"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorGrowthIntelligence } from "@/lib/creator/phase6-types";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

type Phase6PanelsProps = {
  currency?: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CreatorPhase6Panels({ currency = "EUR" }: Phase6PanelsProps) {
  const reduceMotion = useReducedMotion();
  const [intel, setIntel] = useState<CreatorGrowthIntelligence | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/creator/growth-intelligence", {
          credentials: "include",
          cache: "no-store",
        });
        const body = (await res.json()) as {
          ok?: boolean;
          intelligence?: CreatorGrowthIntelligence;
        };
        if (!cancelled && body.ok && body.intelligence) setIntel(body.intelligence);
      } catch {
        /* optional overlay */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded && !intel) return null;

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  const v = intel?.virality;
  const g = intel?.growth;
  const strategy = intel?.contentStrategy;
  const maxProgress = Math.max(1, ...(g?.weekProgression.map((p) => p.score) ?? [1]));

  return (
    <motion.div className="space-y-4" layout={!reduceMotion}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-fuchsia-200/60">
          AI growth engine
        </p>
        <Link
          href="/creator/leaderboard"
          className="text-[12px] font-semibold text-violet-300/90 hover:text-violet-200"
        >
          Leaderboard →
        </Link>
      </div>

      <motion.div className="grid gap-4 lg:grid-cols-2">
        <motion.section className={`rounded-2xl p-5 ${creatorCardSurface}`} {...fade}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-orange-200/70">
            Viral radar
          </p>
          {v ? (
            <>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">{v.overallScore}/100</p>
              <p className="mt-1 text-[13px] capitalize text-white/50">Stage: {v.stage}</p>
              {v.prediction.expectedPeakTime ? (
                <p className="mt-2 text-[12px] text-white/40">
                  Predicted peak: {new Date(v.prediction.expectedPeakTime).toLocaleString()} ·{" "}
                  {v.prediction.expectedRevenueMultiplier}x revenue potential
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[13px] text-white/45">Building viral signals…</p>
          )}
        </motion.section>

        <motion.section
          className={`rounded-2xl p-5 ${creatorCardSurface}`}
          {...fade}
          transition={{ delay: 0.05 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-200/70">
            Growth insight
          </p>
          {g ? (
            <>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                {g.growthScore}{" "}
                <span className="text-lg font-medium text-white/40">/ 1000</span>
              </p>
              <p className="mt-1 text-[13px] capitalize text-emerald-200/80">{g.rankTier} tier</p>
              <div className="mt-3 flex items-end gap-1 h-12">
                {g.weekProgression.map((p) => (
                  <motion.div
                    key={p.week}
                    title={p.week}
                    className="flex-1 rounded-t bg-violet-500/70"
                    style={{ height: `${Math.max(8, (p.score / maxProgress) * 100)}%` }}
                    layout={!reduceMotion}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-white/35">Weekly progression</p>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-white/45">Score updates every 6 hours.</p>
          )}
        </motion.section>

        <motion.section
          className={`rounded-2xl p-5 ${creatorCardSurface}`}
          {...fade}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-fuchsia-200/60">
            AI content suggestions
          </p>
          {strategy ? (
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-white/55">
              {strategy.insights.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                Next push: <span className="font-semibold text-white/80">{strategy.recommendedProductTitle}</span>
              </li>
              <li>
                Slot: {WEEKDAYS[strategy.bestPostingWeekday]} · {String(strategy.bestPostingHour).padStart(2, "0")}:00 UTC
              </li>
              {strategy.captionHooks.slice(0, 2).map((hook) => (
                <li key={hook} className="text-white/40">
                  {hook}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-white/45">Share more links to unlock suggestions.</p>
          )}
        </motion.section>

        <motion.section
          className={`rounded-2xl p-5 ${creatorCardSurface}`}
          {...fade}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-200/70">
            Boost opportunities
          </p>
          {intel?.boostOpportunities.length ? (
            <ul className="mt-3 space-y-3">
              {intel.boostOpportunities.map((b) => (
                <li key={b.productId} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-[14px] font-semibold text-white/90">{b.productTitle}</p>
                  <p className="mt-1 text-[12px] text-white/45">{b.message}</p>
                  <Link
                    href="/creator/products"
                    className="mt-2 inline-flex text-[12px] font-semibold text-fuchsia-300/90"
                  >
                    Re-promote →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-white/45">No rising products detected in the last 24h.</p>
          )}
        </motion.section>
      </motion.div>

      {intel?.personalizedFeed.length ? (
        <motion.section className={`rounded-2xl p-5 ${creatorCardSurface}`} {...fade} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/35">Your feed</p>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {intel.personalizedFeed.slice(0, 6).map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[14px] font-medium text-white/85">{item.title}</p>
                  <p className="text-[11px] text-white/40">{item.reason}</p>
                </div>
                <Link href={item.href} className="text-[12px] font-semibold text-violet-300/90">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      {g && g.revenueGrowthPct > 0 ? (
        <p className="text-[12px] text-white/35">
          Revenue trend +{g.revenueGrowthPct}% · advisory only — no auto-payouts or order changes.
        </p>
      ) : null}
    </motion.div>
  );
}
