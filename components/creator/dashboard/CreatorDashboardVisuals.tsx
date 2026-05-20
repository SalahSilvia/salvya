"use client";

import { useId } from "react";
import type { CreatorRecentActivityItem } from "@/lib/creator/monetization-types";

export function activityToSparkline(items: CreatorRecentActivityItem[], days = 7): number[] {
  const buckets = Array(days).fill(0);
  const now = Date.now();
  for (const item of items) {
    const age = Math.floor((now - new Date(item.createdAt).getTime()) / 86_400_000);
    if (age >= 0 && age < days) buckets[days - 1 - age] += 1;
  }
  return buckets;
}

function normalizeSeries(values: number[]): number[] {
  const max = Math.max(1, ...values);
  return values.map((v) => v / max);
}

export function CreatorSparkline({
  values,
  className = "",
  height = 48,
}: {
  values: number[];
  className?: string;
  height?: number;
}) {
  const gradId = useId();
  const w = 120;
  const h = height;
  const norm = normalizeSeries(values.length ? values : [0, 0, 0, 0, 0, 0, 0]);
  const step = w / Math.max(1, norm.length - 1);
  const points = norm
    .map((y, i) => `${i * step},${h - 4 - y * (h - 10)}`)
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`w-full max-w-[160px] ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(167,139,250,0.35)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId}-fill)`} />
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CreatorMetricRing({
  percent,
  label,
  size = 88,
}: {
  percent: number;
  label: string;
  size?: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const ringId = useId();

  return (
    <div
      className="relative flex shrink-0 flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-white">{clamped}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
      </div>
    </div>
  );
}

export function CreatorFunnelStrip({
  clicks,
  orders,
  conversionRate,
}: {
  clicks: number;
  orders: number;
  conversionRate: number;
}) {
  const max = Math.max(clicks, orders, 1);
  const clickW = Math.max(12, (clicks / max) * 100);
  const orderW = Math.max(8, (orders / max) * 100);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/55">Attribution funnel</p>
      <div className="mt-5 space-y-4">
        <FunnelRow label="Clicks" value={clicks} widthPct={clickW} color="from-violet-500 to-violet-400" />
        <FunnelRow label="Orders" value={orders} widthPct={orderW} color="from-fuchsia-500 to-pink-400" />
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-violet-500/10 px-4 py-3">
          <span className="text-[12px] font-semibold text-emerald-200/90">Conversion rate</span>
          <span className="text-xl font-bold tabular-nums text-white">{conversionRate}%</span>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  widthPct,
  color,
}: {
  label: string;
  value: number;
  widthPct: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="font-medium text-white/50">{label}</span>
        <span className="font-semibold tabular-nums text-white">{value.toLocaleString()}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-[0_0_24px_-6px_rgba(139,92,246,0.55)] transition-all duration-700`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

export function CreatorMeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.4]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 85% 75% at 50% 0%, black, transparent)",
      }}
    />
  );
}

export function CreatorLiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/90 backdrop-blur-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </span>
      Live sync
    </span>
  );
}
