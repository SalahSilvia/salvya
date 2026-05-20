"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeaturedDropCard } from "@/lib/home/premium-trending";
import { ease } from "./motion";

type Props = {
  drops: FeaturedDropCard[];
  /** Anchor for hero / deep links */
  sectionId?: string;
};

export function FeaturedDropsCarousel({ drops, sectionId = "limited-drops" }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [drops]);

  if (!drops.length) return null;

  const drop = drops[index] ?? drops[0];

  return (
    <section id={sectionId} className="scroll-mt-[calc(env(safe-area-inset-top)+4rem)] relative px-4 py-10 sm:px-5" aria-labelledby="featured-drop-title">
      <AnimatePresence mode="wait">
        <motion.div
          key={drop.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease }}
          className="relative mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-white/[0.1] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${drop.coverSrc})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/88 to-[#080810]/75"
            aria-hidden
          />
          <div className="grain-overlay absolute inset-0 opacity-[0.07]" aria-hidden />
          <div className="relative z-[1] flex min-h-[220px] flex-col justify-end px-6 pb-7 pt-16 sm:min-h-[260px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#ff9ecd]/95">New limited drops</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7ea3ff]/80">{drop.label}</p>
            <h2
              id="featured-drop-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[1.75rem]"
            >
              {drop.title}
            </h2>
            <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-white/55">{drop.sub}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={drop.href}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.1] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-[transform,background-color] hover:bg-white/[0.14] active:scale-[0.98]"
              >
                {drop.cta}
                <span aria-hidden className="text-base">
                  →
                </span>
              </Link>
              {drops.length > 1 ? (
                <div className="flex gap-1.5" role="tablist" aria-label="Featured artist shops">
                  {drops.map((d, i) => (
                    <button
                      key={d.href}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? "w-6 bg-white/85" : "w-1.5 bg-white/25 hover:bg-white/45"
                      }`}
                      aria-label={`Show ${d.title}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
