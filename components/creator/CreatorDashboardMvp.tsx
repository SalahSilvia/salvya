"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CreatorStudioKpi } from "@/components/creator/CreatorStudioKpi";
import { CreatorGrowthPanels } from "@/components/creator/CreatorGrowthPanels";
import { CreatorPhase6Panels } from "@/components/creator/CreatorPhase6Panels";
import { CreatorDashboardHero } from "@/components/creator/dashboard/CreatorDashboardHero";
import { CreatorDashboardActivity } from "@/components/creator/dashboard/CreatorDashboardActivity";
import { CreatorDashboardTopProduct } from "@/components/creator/dashboard/CreatorDashboardTopProduct";
import { CreatorFunnelStrip } from "@/components/creator/dashboard/CreatorDashboardVisuals";
import {
  IconClicks,
  IconConversion,
  IconEarnings,
  IconLinks,
} from "@/components/creator/dashboard/CreatorDashboardIcons";
import { SalvyaCreatorDashboardSkeleton } from "@/components/skeleton";
import type { CreatorDashboardStats } from "@/lib/creator/monetization-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { creatorEyebrow, creatorIntelligenceWrap, creatorSectionTitle } from "@/lib/theme/creator-accent";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";

type ProfilePayload = { creator_code?: string };

const POLL_MS = 30_000;

function DashboardSkeleton() {
  return <SalvyaCreatorDashboardSkeleton />;
}

export function CreatorDashboardMvp() {
  const reduceMotion = useReducedMotion();
  const { session, loading } = useSalvyaSession();
  const [creatorCode, setCreatorCode] = useState<string | null>(null);
  const [stats, setStats] = useState<CreatorDashboardStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const [appRes, statsRes] = await Promise.all([
        fetch("/api/creator/application", { credentials: "include", cache: "no-store" }),
        fetch("/api/creator/stats", { credentials: "include", cache: "no-store" }),
      ]);
      const appBody = (await appRes.json()) as { profile?: ProfilePayload | null };
      const statsBody = (await statsRes.json()) as { ok?: boolean; stats?: CreatorDashboardStats };
      setCreatorCode(appBody.profile?.creator_code ?? null);
      if (statsBody.ok && statsBody.stats) setStats(statsBody.stats);
      setLastUpdated(new Date());
    } catch {
      setCreatorCode(null);
      setStats(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading || profileLoading) {
    return <DashboardSkeleton />;
  }

  const displayName = session?.displayName ?? "Creator";
  const earnings = stats?.earnings;
  const earningsLabel = earnings
    ? formatCreatorMoney(earnings.availableMinor + earnings.pendingMinor, earnings.currency)
    : formatCreatorMoney(0);
  const totalClicks = stats?.totalClicks ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const todayClicks = stats?.today.clicks ?? 0;
  const clickProgress = totalClicks > 0 ? Math.round((todayClicks / totalClicks) * 100) : 0;
  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div className="space-y-10 pb-6" {...fade} transition={{ duration: 0.45 }}>
      <CreatorDashboardHero
        displayName={displayName}
        creatorCode={creatorCode}
        stats={stats}
        earningsLabel={earningsLabel}
        lastUpdated={lastUpdated}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <p className={creatorEyebrow}>Performance</p>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CreatorStudioKpi
              label="Total clicks"
              value={totalClicks}
              hint={`${todayClicks} today`}
              accent="violet"
              icon={<IconClicks />}
              trend={todayClicks > 0 ? { label: `+${todayClicks} today`, positive: true } : undefined}
              progress={clickProgress}
            />
            <CreatorStudioKpi
              label="Conversion rate"
              value={`${stats?.conversionRate ?? 0}%`}
              hint={`${totalOrders} attributed orders`}
              accent="fuchsia"
              icon={<IconConversion />}
              progress={stats?.conversionRate ?? 0}
            />
            <CreatorStudioKpi
              label="Total earnings"
              value={earningsLabel}
              hint={
                earnings
                  ? `${formatCreatorMoney(earnings.availableMinor, earnings.currency)} available`
                  : "Commission on paid orders"
              }
              accent="emerald"
              icon={<IconEarnings />}
              progress={
                earnings && earnings.availableMinor + earnings.pendingMinor > 0
                  ? Math.round(
                      (earnings.availableMinor / (earnings.availableMinor + earnings.pendingMinor)) * 100,
                    )
                  : undefined
              }
            />
            <CreatorStudioKpi
              label="Active links"
              value={stats?.activeLinks ?? 0}
              hint={`${stats?.promotedCount ?? 0} products promoted`}
              accent="amber"
              icon={<IconLinks />}
              progress={
                (stats?.promotedCount ?? 0) > 0
                  ? Math.min(100, Math.round(((stats?.activeLinks ?? 0) / (stats?.promotedCount ?? 1)) * 100))
                  : undefined
              }
            />
          </div>
        </section>

        <CreatorFunnelStrip
          clicks={totalClicks}
          orders={totalOrders}
          conversionRate={stats?.conversionRate ?? 0}
        />
      </div>

      <section className={creatorIntelligenceWrap}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={creatorEyebrow}>Intelligence</p>
            <h2 className={`mt-1 ${creatorSectionTitle}`}>
              Growth & AI forecasts
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/40">
            Refreshes automatically
          </span>
        </div>
        <div className="space-y-4">
          <CreatorGrowthPanels currency={earnings?.currency} />
          <CreatorPhase6Panels currency={earnings?.currency} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {stats?.topProduct ? (
          <CreatorDashboardTopProduct
            title={stats.topProduct.title}
            clicks={stats.topProduct.clicks}
            trackingCode={stats.topProduct.trackingCode}
          />
        ) : (
          <section className="flex flex-col justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <p className={creatorEyebrow}>Top performer</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/50">
              Drive traffic to a promo link — your best product will rank here.
            </p>
          </section>
        )}
        <CreatorDashboardActivity items={stats?.recentActivity ?? []} />
      </div>
    </motion.div>
  );
}
