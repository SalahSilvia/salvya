"use client";

import type { SearchProductHit } from "@/lib/member/search-catalog";
import { motion } from "framer-motion";
import { SearchProductCard } from "./SearchProductCard";
import { ease } from "./SearchHeader";

export function FeaturedPiecesGrid({
  hits,
  reduceMotion,
}: {
  hits: SearchProductHit[];
  reduceMotion: boolean;
}) {
  if (!hits.length) return null;
  return (
    <section className="mb-10" aria-labelledby="search-featured-title">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.45, ease }}
      >
        <h2 id="search-featured-title" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
          Featured pieces
        </h2>
        <p className="mt-1 text-[13px] text-white/42">Curated picks from the catalog.</p>
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        {hits.map((hit, i) => (
          <SearchProductCard key={hit.id} hit={hit} index={i} reduceMotion={reduceMotion} />
        ))}
      </div>
    </section>
  );
}
