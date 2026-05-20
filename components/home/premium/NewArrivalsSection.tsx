"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { likedItemInputFromPremiumCard } from "@/lib/member/likes-from-card";
import { ease } from "./motion";
import { ProductCardBadge } from "./ProductCardBadge";

type Props = { cards: PremiumTrendingCard[] };

export function NewArrivalsSection({ cards }: Props) {
  const arrivals = cards.filter((c) => c.badge === "new").slice(0, 8);
  if (!arrivals.length) return null;

  return (
    <section className="border-t border-white/[0.05] bg-[#050508] py-10" aria-labelledby="new-arrivals-title">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease }}
        className="mx-auto max-w-md px-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Just landed</p>
        <h2 id="new-arrivals-title" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
          New arrivals
        </h2>
        <p className="mt-1 text-[13px] text-white/42">Recently added hoodies and tees.</p>
      </motion.div>

      <motion.div
        className="mt-6 grid grid-cols-2 gap-3 px-5 sm:grid-cols-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease, delay: 0.05 }}
      >
        {arrivals.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease, delay: i * 0.04 }}
            className="group/fav"
          >
            <Link href={card.href} className="group block">
              <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_20px_48px_-32px_rgba(0,0,0,0.85)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-28px_rgba(45,107,255,0.22)]">
                <motion.div className="relative aspect-[4/5] bg-[#0b0b12]">
                  <img
                    src={card.imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    decoding="async"
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                    aria-hidden
                  />
                  <ProductCardBadge badge={card.badge} />
                  <ProductHeartButton input={likedItemInputFromPremiumCard(card)} />
                </motion.div>
                <div className="space-y-0.5 px-3 py-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">{card.artistLabel}</p>
                  <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug text-white/92">{card.title}</h3>
                  <p className="text-[12px] font-semibold tabular-nums text-[#b8c9ff]">{card.priceLabel}</p>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
