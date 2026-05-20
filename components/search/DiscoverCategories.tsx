"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DiscoverCategoryTile } from "@/lib/member/search-discovery";
import { ease } from "./SearchHeader";

export function DiscoverCategories({ tiles, reduceMotion }: { tiles: DiscoverCategoryTile[]; reduceMotion: boolean }) {
  return (
    <section className="mb-6" aria-labelledby="search-discover-title">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.45, ease }}
      >
        <h2 id="search-discover-title" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
          Discover
        </h2>
        <p className="mt-1 text-[13px] text-white/42">Category shortcuts — tap to browse.</p>
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease, delay: i * 0.03 }}
          >
            <Link
              href={cat.href}
              prefetch={false}
              className={`group relative flex min-h-[108px] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color] hover:border-white/[0.16] active:scale-[0.99] ${cat.gradient}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-black/25 transition-opacity group-hover:opacity-80" />
              <span className="relative z-[1] text-[14px] font-semibold leading-tight tracking-[-0.02em] text-white/92">{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
