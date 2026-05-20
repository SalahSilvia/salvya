"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { likedItemInputFromPremiumCard } from "@/lib/member/likes-from-card";
import { ease } from "./motion";
import { ProductCardBadge } from "./ProductCardBadge";

type Props = { cards: PremiumTrendingCard[] };

const SHOP_HREF = "/artist/elgrandetoto";

/** Featured storefront rail — ElGrandeToto merch from the live catalog. */
export function ElGrandeTotoHomeSection({ cards }: Props) {
  const slice = cards.slice(0, 10);
  if (!slice.length) return null;

  return (
    <section
      id="elgrandetoto-home"
      className="scroll-mt-[calc(env(safe-area-inset-top)+4rem)] border-t border-white/[0.06] bg-gradient-to-b from-[#0a0d14] to-[#06060a] py-10"
      aria-labelledby="egt-home-title"
    >
      <div className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-wrap items-end justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/75">Featured artist</p>
            <h2 id="egt-home-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
              ElGrandeToto
            </h2>
            <p className="mt-1 max-w-[20rem] text-[13px] leading-relaxed text-white/44">
              Latest hoodies and tees from his Salvya shop — same lineup as his storefront.
            </p>
          </div>
          <Link
            href={SHOP_HREF}
            prefetch={false}
            className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-white/85 transition-colors hover:border-amber-200/25 hover:bg-white/[0.09]"
          >
            Full shop →
          </Link>
        </motion.div>
      </div>
      <div className="mt-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slice.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.4, ease, delay: i * 0.03 }}
            className="group/fav w-[42vw] max-w-[148px] shrink-0"
          >
            <Link href={card.href} className="group block">
              <article className="overflow-hidden rounded-2xl border border-amber-100/[0.08] bg-white/[0.03] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:border-amber-200/15 hover:shadow-[0_20px_48px_-24px_rgba(251,191,36,0.12)]">
                <div className="relative aspect-[3/4] bg-[#0b0b12]">
                  <img
                    src={card.imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 to-transparent opacity-90" aria-hidden />
                  <ProductCardBadge badge={card.badge} />
                  <ProductHeartButton input={likedItemInputFromPremiumCard(card)} />
                </div>
                <div className="px-2.5 py-2">
                  <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">{card.artistLabel}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-white/88">{card.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-white/50">{card.priceLabel}</p>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
