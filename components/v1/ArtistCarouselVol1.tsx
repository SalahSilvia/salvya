"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArtistCard } from "@/lib/site-data";

type Props = {
  artists: ArtistCard[];
};

const ease = [0.22, 1, 0.36, 1] as const;

function initials(name: string): string {
  const spaced = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  const parts = spaced.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function statusDotClass(tag: ArtistCard["statusTag"]) {
  if (tag === "COMING SOON") return "bg-white/35 ring-white/20";
  if (tag === "LIMITED DROP") return "bg-[#5b8fff] ring-[#2D6BFF]/50";
  return "bg-emerald-400 ring-emerald-300/40";
}

function ArtistAvatar({
  artist,
  isSoon,
}: {
  artist: ArtistCard;
  isSoon: boolean;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!photoFailed && (
        <img
          src={artist.profileImage}
          alt={artist.name}
          className={`absolute inset-0 h-full w-full object-cover ${isSoon ? "opacity-55 saturate-[0.65]" : ""}`}
          loading="lazy"
          decoding="async"
          onError={() => setPhotoFailed(true)}
        />
      )}
      {photoFailed && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${artist.gradient}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.12] via-transparent to-transparent" />
          <span className="relative z-[1] text-[19px] font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-xl">
            {initials(artist.name)}
          </span>
        </div>
      )}
      {isSoon && (
        <div className="absolute inset-0 z-[2] bg-black/45 backdrop-blur-[2px]" aria-hidden />
      )}
    </div>
  );
}

export function ArtistCarouselVol1({ artists }: Props) {
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
      className="relative scroll-mt-[calc(env(safe-area-inset-top)+4rem)] pb-4 pt-2"
      aria-labelledby="artists-heading"
    >
      <div className="mx-auto w-full max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease }}
          className="mb-8"
        >
          <h2 id="artists-heading" className="text-2xl font-semibold tracking-[-0.03em] text-white">
            Artists
          </h2>
          <p className="mt-2 max-w-[20rem] text-[14px] font-light leading-relaxed text-white/48">
            Choose an artist to see their shop. Swipe the row to browse the lineup.
          </p>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-3"
        style={{ scrollPaddingInline: "1.25rem" }}
      >
        {artists.map((artist, i) => {
          const isSoon = artist.statusTag === "COMING SOON";
          const isActive = i === active;
          const scale = isActive ? 1 : 0.92;
          const opacity = isActive ? 1 : 0.55;

          const cardInner = (
            <motion.div
              data-artist-card
              animate={{ scale, opacity }}
              transition={{ duration: 0.42, ease }}
              className="flex w-[6.75rem] shrink-0 snap-center flex-col items-center sm:w-[7.25rem]"
            >
              <div className="relative">
                <div
                  className={`pointer-events-none absolute -inset-4 -z-10 rounded-full bg-gradient-to-br ${artist.gradient} opacity-50 blur-2xl transition-opacity duration-500 ${isActive ? "opacity-70" : "opacity-35"}`}
                />
                <div
                  className={`relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-full border bg-[#0a0a0c] shadow-[0_14px_36px_-12px_rgba(0,0,0,0.88)] transition-[box-shadow,transform] duration-300 sm:h-[6rem] sm:w-[6rem] ${
                    isActive && !isSoon
                      ? "border-[#2D6BFF]/55 ring-2 ring-[#2D6BFF]/35 shadow-[0_0_32px_-6px_rgba(45,107,255,0.48)]"
                      : "border-white/[0.12]"
                  } ${isSoon ? "opacity-75" : ""}`}
                >
                  <ArtistAvatar artist={artist} isSoon={isSoon} />
                  <span
                    className={`absolute bottom-1.5 right-1.5 z-[3] h-2.5 w-2.5 rounded-full ring-2 ring-[#050508] ${statusDotClass(artist.statusTag)}`}
                    aria-hidden
                  />
                </div>
              </div>

              <p
                className={`mt-3.5 max-w-[7rem] truncate text-center text-[13px] font-semibold tracking-tight ${isActive ? "text-white" : "text-white/50"}`}
              >
                {artist.name}
              </p>

              {!isSoon && (
                <span className="mt-2 text-[11px] font-medium tracking-wide text-[#7ea3ff]/90">
                  Profile →
                </span>
              )}
              {isSoon && (
                <span className="mt-2 text-[11px] font-medium tracking-wide text-white/30">Profile soon</span>
              )}
            </motion.div>
          );

          return (
            <motion.div
              key={artist.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
              className="flex shrink-0 justify-center first:pl-0"
            >
              {isSoon ? (
                <div className="cursor-default touch-manipulation">{cardInner}</div>
              ) : (
                <Link
                  href={`/artist/${artist.slug}`}
                  className="touch-manipulation outline-none transition-transform active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
                >
                  {cardInner}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mx-auto mt-6 flex max-w-md justify-center gap-1.5 px-5" aria-hidden>
        {artists.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-colors duration-500 ${
              i === active ? "w-6 bg-[#2D6BFF]" : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
