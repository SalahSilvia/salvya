"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorDashboardStats } from "@/lib/creator/monetization-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import {
  CreatorLiveBadge,
  CreatorMeshBackground,
  CreatorMetricRing,
  CreatorSparkline,
  activityToSparkline,
} from "@/components/creator/dashboard/CreatorDashboardVisuals";
import {
  creatorCtaButton,
  creatorCtaGhost,
  creatorEyebrow,
  creatorHeroSurface,
} from "@/lib/theme/creator-accent";

type Props = {
  displayName: string;
  creatorCode: string | null;
  stats: CreatorDashboardStats | null;
  earningsLabel: string;
  lastUpdated: Date | null;
};

function TodayPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "violet" | "fuchsia" | "emerald";
}) {
  const border =
    accent === "violet"
      ? "border-l-violet-400/80"
      : accent === "fuchsia"
        ? "border-l-fuchsia-400/80"
        : "border-l-emerald-400/80";

  return (
    <div
      className={`rounded-xl border border-white/[0.08] border-l-[3px] ${border} bg-black/30 px-3.5 py-3 backdrop-blur-md`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

export function CreatorDashboardHero({
  displayName,
  creatorCode,
  stats,
  earningsLabel,
  lastUpdated,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    if (!creatorCode) return;
    try {
      await navigator.clipboard.writeText(creatorCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [creatorCode]);

  const today = stats?.today;
  const conversion = stats?.conversionRate ?? 0;
  const sparkValues = useMemo(() => {
    const fromActivity = activityToSparkline(stats?.recentActivity ?? []);
    const hasData = fromActivity.some((n) => n > 0);
    if (hasData) return fromActivity;
    const t = today?.clicks ?? 0;
    return [Math.max(0, t - 3), Math.max(0, t - 2), Math.max(0, t - 1), t, t, t, t];
  }, [stats?.recentActivity, today?.clicks]);

  return (
    <motion.section
      className={`rounded-[1.65rem] p-[1px] ${creatorHeroSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden rounded-[1.6rem] bg-[#08050e]/95 p-6 sm:p-8">
        <CreatorMeshBackground />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_100%_-10%,rgba(236,72,153,0.22),transparent_50%),radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(139,92,246,0.18),transparent_45%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/25 blur-[80px]"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className={creatorEyebrow}>Creator Workspace</p>
              <CreatorLiveBadge />
            </div>
            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-[clamp(1.85rem,4.5vw,2.6rem)] font-semibold leading-[1.1] tracking-tight text-transparent">
              Welcome back, {displayName.split(" ")[0] ?? displayName}
            </h1>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/48">
              Your attribution command center — links, orders, and payouts in one place.
            </p>
            {lastUpdated ? (
              <p className="mt-3 text-[11px] text-white/30">
                Synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 lg:items-end">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/32">Creator ID</p>
            <div className="flex items-center gap-2 rounded-2xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 p-1.5 pl-4 backdrop-blur-md">
              <code className="font-mono text-base font-semibold tracking-[0.12em] text-fuchsia-100 sm:text-lg">
                {creatorCode ?? "—"}
              </code>
              {creatorCode ? (
                <button
                  type="button"
                  onClick={() => void copyCode()}
                  className="rounded-xl bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white/85 transition hover:bg-white/15"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-8 border-t border-white/[0.07] pt-8 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/70">
                Total balance
              </p>
              <p className="mt-1 bg-gradient-to-r from-white via-emerald-100 to-violet-200 bg-clip-text text-[clamp(2.25rem,6vw,3.25rem)] font-semibold tabular-nums tracking-tight text-transparent">
                {earningsLabel}
              </p>
              <p className="mt-2 text-[13px] text-white/42">
                {stats?.earnings
                  ? `${formatCreatorMoney(stats.earnings.pendingMinor, stats.earnings.currency)} awaiting payout`
                  : "Commissions unlock when attributed orders are paid"}
              </p>
              <div className="mt-4 hidden sm:block">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/28">
                  7-day activity
                </p>
                <CreatorSparkline values={sparkValues} height={52} className="max-w-[200px]" />
              </div>
            </div>
            <CreatorMetricRing percent={conversion} label="Conv." size={96} />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[280px]">
            <TodayPill label="Today clicks" value={today?.clicks ?? 0} accent="violet" />
            <TodayPill label="Today orders" value={today?.orders ?? 0} accent="fuchsia" />
            <TodayPill label="Rate" value={`${conversion}%`} accent="emerald" />
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-2">
          <Link
            href="/creator/products"
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-semibold text-white ${creatorCtaButton}`}
          >
            <span aria-hidden>✦</span> Promote product
          </Link>
          <Link
            href="/creator/links"
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
          >
            Links
          </Link>
          <Link
            href="/creator/analytics"
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
          >
            Analytics
          </Link>
          <Link
            href="/creator/wallet"
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
          >
            Wallet
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
