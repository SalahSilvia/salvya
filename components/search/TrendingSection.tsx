"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TrendingEditorialCard } from "@/lib/member/search-discovery";
import { ease } from "./SearchHeader";

export function TrendingSection({
  cards,
  reduceMotion,
}: {
  cards: TrendingEditorialCard[];
  reduceMotion: boolean;
}) {
  return (
    <section className="mb-10" aria-labelledby="search-trending-title">
      <h2 id="search-trending-title" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
        Trending
      </h2>
      <p className="mt-1 text-[13px] text-white/42">What the community is exploring right now.</p>
      <div className="mt-4 flex flex-col gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.45, ease, delay: i * 0.05 }}
          >
            <Link
              href={card.href}
              prefetch={false}
              className="group relative block overflow-hidden rounded-3xl border border-white/[0.1] shadow-[0_20px_56px_-32px_rgba(0,0,0,0.85)] outline-none transition-[transform,box-shadow] hover:border-[#2D6BFF]/28 hover:shadow-[0_24px_64px_-28px_rgba(45,107,255,0.18)]"
            >
              <div className="relative min-h-[128px]">
                {card.coverSrc ? (
                  <>
                    <img
                      src={card.coverSrc}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-45 blur-xl transition-transform duration-700 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay"
                      style={{ backgroundImage: `url(${card.coverSrc})` }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2D6BFF]/22 via-[#12121c] to-[#050508]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/88 to-transparent" />
                <div className="relative z-[1] flex min-h-[128px] flex-col justify-end px-5 py-5">
                  <p className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-white/95">{card.title}</p>
                  <p className="mt-1 text-[13px] text-white/45">{card.sub}</p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1 text-[12px] font-semibold text-[#9eb6ff] transition-colors group-hover:text-[#c8d6ff]">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
