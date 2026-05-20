"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CreatorLiveBadge, CreatorMeshBackground } from "@/components/creator/dashboard/CreatorDashboardVisuals";
import {
  creatorCtaGhost,
  creatorEyebrow,
  creatorHeroSurface,
} from "@/lib/theme/creator-accent";

type Filter = "all" | "promoted" | "available";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  totalCount: number;
  promotedCount: number;
  visibleCount: number;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All catalog" },
  { id: "promoted", label: "Promoted" },
  { id: "available", label: "Not promoted" },
];

export function CreatorProductsHero({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  totalCount,
  promotedCount,
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
          className="pointer-events-none absolute -right-20 top-0 size-56 rounded-full bg-fuchsia-500/20 blur-[90px]"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className={creatorEyebrow}>Catalog</p>
              <CreatorLiveBadge />
            </div>
            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/65 bg-clip-text text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight text-transparent">
              Promote products
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/48">
              Pick official Salvya drops, generate trackable promo links, and share with your audience.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href="/creator/links"
              className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
            >
              My links
            </Link>
            <Link
              href="/creator/dashboard"
              className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-6 sm:gap-3">
          <StatPill label="In catalog" value={totalCount} />
          <StatPill label="Promoted" value={promotedCount} accent="fuchsia" />
          <StatPill label="Showing" value={visibleCount} accent="violet" />
        </div>

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
              placeholder="Search title, category, artist…"
              className="w-full rounded-2xl border border-white/[0.1] bg-black/35 py-3.5 pl-12 pr-4 text-[15px] text-white outline-none backdrop-blur-md placeholder:text-white/30 focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-500/25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-violet-500/35 to-fuchsia-500/35 text-white ring-1 ring-fuchsia-400/30"
                      : "border border-white/10 bg-white/[0.04] text-white/50 hover:border-white/18 hover:text-white/75"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "violet" | "fuchsia";
}) {
  const ring =
    accent === "fuchsia"
      ? "border-fuchsia-500/25 bg-fuchsia-500/10"
      : accent === "violet"
        ? "border-violet-500/25 bg-violet-500/10"
        : "border-white/10 bg-white/[0.04]";

  return (
    <div className={`rounded-xl border px-3 py-2.5 backdrop-blur-sm ${ring}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}
