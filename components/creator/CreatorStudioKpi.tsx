"use client";

import type { ReactNode } from "react";

const ACCENTS = {
  violet: {
    glow: "from-violet-500/40 to-transparent",
    icon: "from-violet-500/30 to-violet-700/15 text-violet-200 ring-violet-400/20",
    bar: "from-violet-500 to-violet-400",
  },
  fuchsia: {
    glow: "from-fuchsia-500/40 to-transparent",
    icon: "from-fuchsia-500/30 to-fuchsia-700/15 text-fuchsia-200 ring-fuchsia-400/20",
    bar: "from-fuchsia-500 to-pink-400",
  },
  emerald: {
    glow: "from-emerald-500/35 to-transparent",
    icon: "from-emerald-500/30 to-emerald-700/15 text-emerald-200 ring-emerald-400/20",
    bar: "from-emerald-500 to-teal-400",
  },
  amber: {
    glow: "from-amber-500/35 to-transparent",
    icon: "from-amber-500/30 to-amber-700/15 text-amber-200 ring-amber-400/20",
    bar: "from-amber-500 to-orange-400",
  },
} as const;

type Accent = keyof typeof ACCENTS;

export function CreatorStudioKpi({
  label,
  value,
  hint,
  accent = "violet",
  icon,
  trend,
  progress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
  icon?: ReactNode;
  trend?: { label: string; positive?: boolean };
  /** 0–100 fill for bottom meter */
  progress?: number;
}) {
  const palette = ACCENTS[accent];
  const fill = progress != null ? Math.min(100, Math.max(0, progress)) : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0710]/90 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_28px_60px_-28px_rgba(139,92,246,0.35)]">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-80 ${palette.glow}`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/36">{label}</p>
          <p className="mt-2.5 text-[1.7rem] font-semibold leading-none tabular-nums tracking-tight text-white">
            {value}
          </p>
          {hint ? <p className="mt-2 text-[12px] leading-snug text-white/40">{hint}</p> : null}
        </div>
        {icon ? (
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${palette.icon}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {trend ? (
        <p
          className={`relative mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            trend.positive === false
              ? "bg-white/5 text-white/45"
              : "bg-emerald-500/12 text-emerald-200/95 ring-1 ring-emerald-500/20"
          }`}
        >
          {trend.label}
        </p>
      ) : null}

      {fill != null ? (
        <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${palette.bar} transition-all duration-700`}
            style={{ width: `${fill}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
