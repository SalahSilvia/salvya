"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CreatorLiveBadge, CreatorMeshBackground } from "@/components/creator/dashboard/CreatorDashboardVisuals";
import { MoreIcon } from "@/components/creator/more/CreatorMoreIcons";
import { creatorCtaButton, creatorCtaGhost, creatorEyebrow, creatorHeroSurface } from "@/lib/theme/creator-accent";

export function CreatorMoreHero() {
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
          className="pointer-events-none absolute -left-16 top-0 size-48 rounded-full bg-violet-500/25 blur-[80px]"
        />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <p className={creatorEyebrow}>Menu</p>
            <CreatorLiveBadge />
          </div>
          <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/65 bg-clip-text text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight text-transparent">
            More
          </h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/48">
            Analytics, account settings, exports, and everything else in your workspace.
          </p>

          <div className="mt-5 flex max-w-md flex-col gap-2.5">
            <Link
              href="/shop"
              className={`group relative inline-flex min-h-[3.25rem] w-full items-center gap-3 overflow-hidden rounded-xl border border-violet-300/25 px-4 py-3 text-white shadow-[0_16px_48px_-16px_rgba(139,92,246,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,box-shadow] hover:shadow-[0_20px_56px_-14px_rgba(167,139,250,0.85)] active:scale-[0.99] sm:w-auto sm:min-w-[17.5rem] ${creatorCtaButton}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 via-transparent to-violet-400/10 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                <MoreIcon id="shop" className="h-[1.125rem] w-[1.125rem]" />
              </span>
              <span className="relative min-w-0 flex-1 text-left">
                <span className="block text-[14px] font-semibold leading-tight">Browse shop</span>
                <span className="mt-0.5 block text-[11px] font-medium text-white/65">Shop Salvya as a customer</span>
              </span>
              <span aria-hidden className="relative shrink-0 text-[15px] text-white/55 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/creator/notifications"
                className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-4 text-[13px] font-semibold sm:flex-none ${creatorCtaGhost}`}
              >
                Notifications
              </Link>
              <Link
                href="/creator/dashboard"
                className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-4 text-[13px] font-semibold sm:flex-none ${creatorCtaGhost}`}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <p className="relative mt-6 text-[12px] text-white/30">
          Tip: press <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-white/50">⌘K</kbd>{" "}
          anywhere in the workspace to jump quickly.
        </p>
      </div>
    </motion.header>
  );
}
