"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { likedItemInputFromPremiumCard } from "@/lib/member/likes-from-card";
import { ease } from "./motion";
import { ProductCardBadge } from "./ProductCardBadge";

type Props = { cards: PremiumTrendingCard[] };

export function TrendingNowSection({ cards }: Props) {
  if (!cards.length) return null;
  return (
    <section
      id="home-trending"
      className="scroll-mt-[calc(env(safe-area-inset-top)+4rem)] border-t border-white/[0.05] bg-[#07070c] py-10"
      aria-labelledby="trending-now-title"
    >
      <div className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">Salvya market</p>
          <h2 id="trending-now-title" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
            Trending across Salvya
          </h2>
          <p className="mt-1 text-[13px] text-white/42">Global popularity — not filtered to your taste.</p>
        </motion.div>
      </div>
      <div className="mt-6 flex gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease, delay: i * 0.04 }}
            className="group/fav w-[min(78vw,280px)] shrink-0"
          >
            <Link href={card.href} className="group block">
              <article className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-[#06060c] shadow-[0_24px_56px_-32px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/[0.04] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_32px_64px_-28px_rgba(45,107,255,0.25)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#0c0c14]">
                  <img
                    src={card.imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.06] group-hover:brightness-[1.05]"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
                  <ProductCardBadge badge={card.badge} />
                  <ProductHeartButton input={likedItemInputFromPremiumCard(card)} />
                </div>
                <div className="space-y-1 px-4 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">{card.artistLabel}</p>
                  <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.02em] text-white/95">{card.title}</h3>
                  <p className="text-[13px] font-semibold tabular-nums text-[#b8c9ff]">{card.priceLabel}</p>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
