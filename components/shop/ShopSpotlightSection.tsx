"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import { likedItemInputFromStorefrontCarousel } from "@/lib/member/likes-from-card";
import { storefrontArtistDisplayName } from "@/lib/artists/display-name";
import type { StorefrontCarouselItem } from "@/lib/catalog/storefront-product";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  item: StorefrontCarouselItem | null;
};

function kindLabel(kind: StorefrontCarouselItem["kind"]) {
  return kind === "tshirt" ? "Tee" : "Hoodie";
}

export function ShopSpotlightSection({ item }: Props) {
  const reduceMotion = useReducedMotion();
  if (!item) return null;

  const price = item.priceLabel.split(" · ")[0];
  const artistName = storefrontArtistDisplayName(item.artistSlug);
  const heroImage = item.modelImageUrl ?? item.imageUrl;
  const backImage = item.imageUrl;
  const showDual = Boolean(heroImage && backImage && item.modelImageUrl && backImage !== heroImage);

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.65, ease },
      };

  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#050508] py-12"
      aria-labelledby="shop-spotlight"
    >
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-[#2D6BFF]/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]"
        aria-hidden
      />
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      <div className="relative mx-auto max-w-md px-5">
        <motion.div {...fade} className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!reduceMotion ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5b8cff] opacity-60" />
                ) : null}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2D6BFF] shadow-[0_0_12px_rgba(45,107,255,0.9)]" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7ea3ff]/90">
                Live spotlight
              </p>
            </div>
            <h2
              id="shop-spotlight"
              className="mt-2 text-[clamp(1.5rem,6vw,1.85rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white"
            >
              Piece of the{" "}
              <span className="bg-gradient-to-r from-white via-[#c5d6ff] to-[#5b8cff] bg-clip-text text-transparent">
                moment
              </span>
            </h2>
            <p className="mt-2 max-w-[15rem] text-[13px] leading-relaxed text-white/45">
              Back print, on-body fit — one drop singled out before it vanishes.
            </p>
          </div>
          <span className="font-mono text-[2.5rem] font-medium leading-none tracking-tighter text-white/[0.07]">
            01
          </span>
        </motion.div>

        <motion.div
          {...(reduceMotion ? {} : { ...fade, transition: { duration: 0.7, ease, delay: 0.08 } })}
        >
          <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.1] bg-[#0a0a10] shadow-[0_32px_80px_-40px_rgba(45,107,255,0.55)]">
          <Link
            href={item.href}
            className="relative block"
          >
            <div className="relative min-h-[min(118vw,32rem)]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] to-[#050508]" />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/35 to-[#050508]/10" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050508]/80 via-transparent to-transparent" />

              <div className="absolute left-0 top-0 z-10 flex w-full items-start justify-between gap-2 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {item.limited ? (
                    <span className="rounded-full bg-[#2D6BFF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_20px_rgba(45,107,255,0.5)]">
                      Limited
                    </span>
                  ) : null}
                  {item.badge && !item.limited ? (
                    <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                      {item.badge}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-md">
                    {kindLabel(item.kind)}
                  </span>
                </div>
              </div>

              {showDual && backImage ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: 16, rotate: 6 }}
                  whileInView={{ opacity: 1, x: 0, rotate: -4 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease, delay: 0.2 }}
                  className="absolute right-4 top-[38%] z-10 w-[38%] max-w-[9.5rem] -translate-y-1/2 sm:right-6 sm:top-[42%]"
                >
                  <div className="overflow-hidden rounded-xl border border-white/20 bg-[#050508] p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.02]">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[0.65rem] bg-[#0c0c12]">
                      <img src={backImage} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <p className="py-1.5 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/55">
                      Back print
                    </p>
                  </div>
                </motion.div>
              ) : null}

              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9eb6ff]">
                  {artistName} <span className="text-white/40">· official drop</span>
                </p>

                <h3 className="mt-2 line-clamp-2 text-[1.4rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[1.55rem]">
                  {item.title}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-white px-3.5 py-1.5 text-[15px] font-bold tabular-nums text-[#050508]">
                    {price}
                  </span>
                  {item.soldOut ? (
                    <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-white/70">
                      Sold out
                    </span>
                  ) : (
                    <span className="rounded-lg border border-[#2D6BFF]/40 bg-[#2D6BFF]/15 px-2.5 py-1 text-[11px] font-semibold text-[#c8d6ff]">
                      In stock
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="text-[12px] text-white/45">
                    {showDual ? "Flat lay + model · " : ""}
                    Tap to open the piece
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-md transition-[background-color,transform] group-hover:bg-white/[0.14] group-active:scale-[0.98]">
                    Claim it
                    <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
          {heroImage ? (
            <div className="pointer-events-none absolute right-4 top-4 z-20">
              <div className="pointer-events-auto">
                <ProductHeartButton input={likedItemInputFromStorefrontCarousel(item)} />
              </div>
            </div>
          ) : null}
          </div>
        </motion.div>

        <motion.p
          {...(reduceMotion ? {} : { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } })}
          className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/25"
        >
          Rotates with heat · Always official merch
        </motion.p>
      </div>
    </section>
  );
}
