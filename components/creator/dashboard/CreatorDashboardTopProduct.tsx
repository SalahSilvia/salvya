"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { creatorCardSurface, creatorEyebrow } from "@/lib/theme/creator-accent";

type Props = {
  title: string;
  clicks: number;
  trackingCode: string;
};

export function CreatorDashboardTopProduct({ title, clicks, trackingCode }: Props) {
  const reduceMotion = useReducedMotion();
  const initial = title.trim().charAt(0).toUpperCase() || "S";

  return (
    <motion.section
      className={`relative overflow-hidden rounded-2xl ${creatorCardSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600/15 via-[#0c0914] to-[#08050e] p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-fuchsia-500/20 blur-3xl"
        />
        <div className="relative flex items-start gap-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/30 text-2xl font-bold text-white ring-1 ring-white/15">
            {initial}
            <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-bold text-black shadow-lg">
              #1
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={creatorEyebrow}>Top performer</p>
            <p className="mt-1.5 line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-white">
              {title}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[12px] font-semibold text-white/70">
                {clicks.toLocaleString()} clicks
              </span>
              <span className="rounded-lg border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-1 font-mono text-[11px] text-fuchsia-200/90">
                {trackingCode}
              </span>
            </div>
            <Link
              href="/creator/analytics"
              className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-fuchsia-300/95 hover:text-fuchsia-200"
            >
              View in analytics
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
