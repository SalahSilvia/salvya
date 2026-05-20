"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArtistCard } from "@/lib/site-data";

type Props = {
  artists: ArtistCard[];
};

function statusDotClass(tag: ArtistCard["statusTag"]) {
  if (tag === "COMING SOON") return "bg-white/35 ring-white/25";
  if (tag === "LIMITED DROP") return "bg-[#2D6BFF] ring-[#2D6BFF]/40";
  return "bg-emerald-400 ring-emerald-400/35";
}

export function ArtistsCarouselCinematic({ artists }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const recalc = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const mid = root.getBoundingClientRect().left + root.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    root.querySelectorAll<HTMLElement>("[data-artist-card]").forEach((node, i) => {
      const r = node.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    recalc();
    root.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      root.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [recalc]);

  return (
    <section
      id="artists"
      className="relative z-10 scroll-mt-[calc(env(safe-area-inset-top)+3.5rem+0.75rem)] py-10"
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory justify-center gap-6 overflow-x-auto px-6 py-2"
        style={{ scrollPaddingInline: "1.5rem" }}
      >
        {artists.map((artist, i) => {
          const isSoon = artist.statusTag === "COMING SOON";
          const isActive = i === active;
          const dim = isActive ? 1 : 0.5;
          const scale = isActive ? 1.08 : 0.92;

          const circle = (
            <motion.div
              data-artist-card
              animate={{ opacity: dim, scale }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              <div
                className={`pointer-events-none absolute inset-0 -z-10 scale-150 rounded-full bg-gradient-to-br ${artist.gradient} opacity-40 blur-xl`}
              />

              <div
                className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-full border border-white/[0.12] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] transition-shadow duration-300 sm:w-16 ${
                  isActive && !isSoon ? "ring-2 ring-[#2D6BFF]/60 shadow-[0_0_20px_-4px_rgba(45,107,255,0.45)]" : ""
                } ${isSoon ? "opacity-80 ring-1 ring-white/10" : ""}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${artist.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent opacity-60" />
                {isSoon && (
                  <>
                    <div className="absolute inset-0 backdrop-blur-sm" />
                    <div className="absolute inset-0 bg-black/35" />
                  </>
                )}
                <span
                  className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ring-2 ring-[#050508] ${statusDotClass(artist.statusTag)}`}
                  aria-hidden
                />
              </div>

              <p
                className={`mt-2 max-w-[4.5rem] truncate text-center text-[10px] font-medium leading-tight sm:max-w-[5rem] sm:text-[11px] ${
                  isActive ? "text-white" : "text-white/45"
                }`}
              >
                {artist.name}
              </p>
            </motion.div>
          );

          return (
            <motion.div
              key={artist.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-[4.75rem] shrink-0 snap-center flex-col items-center sm:w-[5.25rem]"
            >
              {isSoon ? (
                <div className="pointer-events-none cursor-default">{circle}</div>
              ) : (
                <Link href={`/artist/${artist.slug}`} className="flex flex-col items-center active:opacity-90">
                  {circle}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-1.5 px-5" aria-hidden>
        {artists.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              i === active ? "w-4 bg-[#2D6BFF]" : "w-1 bg-white/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
