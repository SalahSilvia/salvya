"use client";

import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import { likedItemInputFromSearchHit } from "@/lib/member/likes-from-card";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import Link from "next/link";
import { motion } from "framer-motion";

export function SearchProductCard({
  hit,
  index,
  reduceMotion,
  onNavigate,
}: {
  hit: SearchProductHit;
  index: number;
  reduceMotion: boolean;
  onNavigate?: () => void;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: index * 0.03 }}
      className="group/fav relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#08080f]/90 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.85)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_64px_-32px_rgba(45,107,255,0.18)]"
    >
      <Link href={hit.href} prefetch={false} className="block outline-none" onClick={() => onNavigate?.()}>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0c0c14]">
          <img
            src={hit.imageSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/fav:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent" />
          <ProductHeartButton input={likedItemInputFromSearchHit(hit)} />
        </div>
        <div className="space-y-1 px-4 pb-5 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{hit.artistLabel}</p>
          <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-white/95">{hit.title}</h3>
          <p className="text-[14px] font-medium text-[#c8d6ff]/95">{hit.priceLabel}</p>
        </div>
      </Link>
    </motion.article>
  );
}
