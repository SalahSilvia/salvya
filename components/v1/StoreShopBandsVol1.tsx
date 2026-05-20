"use client";

import { motion } from "framer-motion";
import { StorefrontProductCarousel } from "@/components/shop/StorefrontProductCarousel";
import type { StorefrontCarouselItem } from "@/lib/catalog/storefront-product";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  tshirtCarousel: StorefrontCarouselItem[];
  hoodieCarousel: StorefrontCarouselItem[];
};

export function StoreShopBandsVol1({ tshirtCarousel, hoodieCarousel }: Props) {
  if (!tshirtCarousel.length && !hoodieCarousel.length) return null;

  return (
    <div className="border-t border-white/[0.06] bg-[#050508]">
      {tshirtCarousel.length > 0 ? (
        <section className="relative pt-8 pb-2" aria-labelledby="trend-now-heading">
          <div className="mx-auto max-w-md px-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease }}
              className="mb-4 flex items-end justify-between gap-3"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7ea3ff]/90">Shop</p>
                <h2 id="trend-now-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
                  Tee wall
                </h2>
                <p className="mt-1 text-[13px] text-white/42">Graphic tees &amp; tour fits — swipe the rack.</p>
              </div>
            </motion.div>
          </div>
          <div className="relative -mx-5">
            <StorefrontProductCarousel items={tshirtCarousel} sectionLabel="tees" />
          </div>
        </section>
      ) : null}

      {hoodieCarousel.length > 0 ? (
        <section
          className={`relative pb-8 pt-6 ${tshirtCarousel.length > 0 ? "border-t border-white/[0.08]" : ""}`}
          aria-labelledby="last-collections-heading"
        >
          <div className="mx-auto max-w-md px-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease }}
              className="mb-4 flex items-end justify-between gap-3"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">Shop</p>
                <h2 id="last-collections-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
                  Hoodie vault
                </h2>
                <p className="mt-1 text-[13px] text-white/42">Heavy fleece, oversized cuts, stage-ready warmth.</p>
              </div>
            </motion.div>
          </div>
          <div className="relative -mx-5">
            <StorefrontProductCarousel items={hoodieCarousel} sectionLabel="hoodies" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
