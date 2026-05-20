"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { firstFollowedArtistName } from "@/lib/home/follows-personalize";
import { likedItemInputFromPremiumCard } from "@/lib/member/likes-from-card";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import { ease } from "./motion";

type Props = { cards: PremiumTrendingCard[]; follows?: ArtistFollowRecord[] };

export function ForYouSection({ cards, follows = [] }: Props) {
  const slice = cards.slice(0, 8);
  if (!slice.length) return null;

  const hasFollows = follows.length > 0;
  const leadFollow = firstFollowedArtistName(follows);

  return (
    <section
      id="home-for-you"
      className="scroll-mt-[calc(env(safe-area-inset-top)+4rem)] border-t border-white/[0.05] bg-[#06060a] py-10"
      aria-labelledby="for-you-title"
    >
      <div className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7ea3ff]/85">Personalized for you</p>
          <h2 id="for-you-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
            Your shelf
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-white/42">
            Ranked from artists you follow and pieces you save — nothing random here.
          </p>
          {hasFollows && leadFollow ? (
            <p className="mt-1 text-[12px] text-white/35">
              Leaning on {leadFollow}
              {follows.length > 1 ? ` + ${follows.length - 1} more` : ""}.
            </p>
          ) : null}
        </motion.div>
      </div>
      <div className="mt-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slice.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease, delay: i * 0.03 }}
            className="group/fav w-[42vw] max-w-[148px] shrink-0"
          >
            <Link href={card.href} className="group block">
              <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-24px_rgba(45,107,255,0.2)]">
                <div className="relative aspect-[3/4] bg-[#0b0b12]">
                  <img
                    src={card.imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 to-transparent opacity-90" aria-hidden />
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
