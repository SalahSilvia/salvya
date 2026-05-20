"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ArtistCard } from "@/lib/site-data";
import { creatorExploreLine } from "@/lib/search/creator-lines";

export function ArtistsRow({
  artists,
  folderCatalogCounts,
  reduceMotion,
}: {
  artists: ArtistCard[];
  folderCatalogCounts: Map<string, { h: number; t: number }>;
  reduceMotion: boolean;
}) {
  return (
    <section className="mb-10" aria-labelledby="search-creators-title">
      <h2 id="search-creators-title" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
        Creators
      </h2>
      <p className="mt-1 text-[13px] text-white/42">Official storefronts — culture first.</p>
      <div className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto scroll-smooth pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {artists.map((artist) => {
          const isSoon = artist.statusTag === "COMING SOON";
          const counts = folderCatalogCounts.get(artist.slug) ?? { h: 0, t: 0 };
          const sub = creatorExploreLine(artist.slug, counts.h, counts.t, artist.statusTag);
          return (
            <motion.div
              key={artist.slug}
              whileHover={reduceMotion || isSoon ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-[min(78vw,17.5rem)] shrink-0"
            >
              <Link
                href={isSoon ? "#" : `/artist/${artist.slug}`}
                prefetch={false}
                onClick={(e) => isSoon && e.preventDefault()}
                className={`group relative block overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0a0a10]/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.85)] outline-none backdrop-blur-md transition-[border-color,box-shadow] hover:border-[#2D6BFF]/32 hover:shadow-[0_0_36px_-12px_rgba(45,107,255,0.22)] ${
                  isSoon ? "pointer-events-none opacity-55" : ""
                }`}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={artist.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/75 ${artist.ambient}`} />
                </div>
                <div className="space-y-1 px-4 pb-4 pt-3">
                  <p className="text-[17px] font-semibold uppercase tracking-[-0.03em] text-white/95">{artist.name}</p>
                  <p className="text-[12px] text-white/45">{sub}</p>
                  <span className="inline-flex items-center gap-1 pt-2 text-[12px] font-semibold text-[#9eb6ff]">
                    Storefront →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
