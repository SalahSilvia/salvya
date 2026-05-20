"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CreatorLiveBadge, CreatorMeshBackground } from "@/components/creator/dashboard/CreatorDashboardVisuals";
import {
  creatorCtaGhost,
  creatorEyebrow,
  creatorHeroSurface,
} from "@/lib/theme/creator-accent";

export type LinkSort = "newest" | "clicks" | "orders";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: LinkSort;
  onSortChange: (sort: LinkSort) => void;
  linkCount: number;
  totalClicks: number;
  totalOrders: number;
  conversionRate: number;
  visibleCount: number;
};

const SORTS: { id: LinkSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "clicks", label: "Most clicks" },
  { id: "orders", label: "Most orders" },
];

export function CreatorLinksHero({
  query,
  onQueryChange,
  sort,
  onSortChange,
  linkCount,
  totalClicks,
  totalOrders,
  conversionRate,
  visibleCount,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className={`rounded-[1.65rem] ${creatorHeroSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="relative overflow-hidden rounded-[1.6rem] bg-[#08050e]/95 p-6 sm:p-8">
        <CreatorMeshBackground />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 size-56 rounded-full bg-violet-500/20 blur-[90px]"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className={creatorEyebrow}>Attribution</p>
              <CreatorLiveBadge />
            </div>
            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/65 bg-clip-text text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight text-transparent">
              My promo links
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/48">
              Copy share URLs, track clicks and orders, and see which drops perform best with your audience.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/creator/products"
              className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
            >
              Catalog
            </Link>
            <Link
              href="/creator/dashboard"
              className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-6 sm:grid-cols-4 sm:gap-3">
          <StatPill label="Active links" value={linkCount} accent="fuchsia" />
          <StatPill label="Total clicks" value={totalClicks} />
          <StatPill label="Orders" value={totalOrders} accent="violet" />
          <StatPill
            label="Conversion"
            valueLabel={`${conversionRate.toFixed(conversionRate > 0 && conversionRate < 10 ? 1 : 0)}%`}
          />
        </div>

        {linkCount > 0 ? (
          <div className="relative mt-6 space-y-4">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30"
                fill="none"
                aria-hidden
              >
                <path
                  d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search product or tracking code…"
                className="w-full rounded-2xl border border-white/[0.1] bg-black/35 py-3.5 pl-12 pr-4 text-[15px] text-white outline-none backdrop-blur-md placeholder:text-white/30 focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-500/25"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Sort</span>
              {SORTS.map((s) => {
                const active = sort === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSortChange(s.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-violet-500/35 to-fuchsia-500/35 text-white ring-1 ring-fuchsia-400/30"
                        : "border border-white/10 bg-white/[0.04] text-white/50 hover:border-white/18 hover:text-white/75"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[12px] tabular-nums text-white/35">
                Showing {visibleCount} of {linkCount}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}

function StatPill({
  label,
  value,
  valueLabel,
  accent,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  accent?: "violet" | "fuchsia";
}) {
  const ring =
    accent === "fuchsia"
      ? "border-fuchsia-500/25 bg-fuchsia-500/10"
      : accent === "violet"
        ? "border-violet-500/25 bg-violet-500/10"
        : "border-white/10 bg-white/[0.04]";

  const display = valueLabel ?? String(value ?? 0);

  return (
    <div className={`rounded-xl border px-3 py-2.5 backdrop-blur-sm ${ring}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{display}</p>
    </div>
  );
}
