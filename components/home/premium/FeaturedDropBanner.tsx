"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FEATURED_DROP } from "@/lib/home/premium-trending";
import { ease } from "./motion";

export function FeaturedDropBanner() {
  return (
    <section className="relative px-4 py-10 sm:px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease }}
        className="relative mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-white/[0.1] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/api/artist-cover/babygang)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/88 to-[#080810]/75" aria-hidden />
        <div className="grain-overlay absolute inset-0 opacity-[0.07]" aria-hidden />
        <div className="relative z-[1] flex min-h-[220px] flex-col justify-end px-6 pb-7 pt-16 sm:min-h-[260px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#7ea3ff]/95">{FEATURED_DROP.label}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[1.75rem]">{FEATURED_DROP.title}</h2>
          <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-white/55">{FEATURED_DROP.sub}</p>
          <Link
            href={FEATURED_DROP.href}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.1] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-[transform,background-color] hover:bg-white/[0.14] active:scale-[0.98]"
          >
            {FEATURED_DROP.cta}
            <span aria-hidden className="text-base">
              →
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
