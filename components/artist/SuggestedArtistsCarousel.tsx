"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ArtistCard } from "@/lib/site-data";

const VISIBLE_FRACTION = 3.2;
const GAP_PX = 12;

type Props = {
  artists: ArtistCard[];
};

function statusRing(tag: ArtistCard["statusTag"]) {
  if (tag === "LIMITED DROP") return "ring-[#2D6BFF]/35";
  if (tag === "COMING SOON") return "ring-white/15";
  return "ring-emerald-400/25";
}

export function SuggestedArtistsCarousel({ artists }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollForward(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [artists.length, updateScrollState]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-artist-suggest-card]");
    const w = card?.offsetWidth ?? 0;
    const delta = w > 0 ? w * VISIBLE_FRACTION + GAP_PX * 2 : el.clientWidth * 0.75;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  }, []);

  if (!artists.length) return null;

  const showBackArrow = scrollLeft > 2;
  const arrowBase =
    "absolute top-[42%] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#050508]/90 text-lg text-white/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-[opacity,transform,colors] duration-200 hover:border-white/[0.16] hover:bg-[#050508] sm:h-10 sm:w-10";

  return (
    <div className="relative -mx-5">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l from-[#050508] to-transparent sm:w-9"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        className={`${arrowBase} left-1 sm:left-2 ${
          showBackArrow ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Scroll artists left"
        aria-hidden={!showBackArrow}
        tabIndex={showBackArrow ? 0 : -1}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        className={`${arrowBase} right-1 sm:right-2 ${
          canScrollForward ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Scroll artists right"
        aria-hidden={!canScrollForward}
        tabIndex={canScrollForward ? 0 : -1}
      >
        ›
      </button>
      <div
        ref={scrollerRef}
        className="flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label="Suggested artists"
      >
        {artists.map((artist) => (
          <div
            key={artist.slug}
            data-artist-suggest-card
            className="w-[calc((100%-2.25rem)/3.2)] min-w-[5.5rem] shrink-0 snap-start sm:min-w-[6rem]"
          >
            <Link href={`/artist/${artist.slug}`} className="flex flex-col items-center active:scale-[0.98]">
              <div
                className={`relative h-[4.75rem] w-[4.75rem] overflow-hidden rounded-full border-[2.5px] border-[#050508] bg-[#0a0a0c] ring-2 ring-inset ${statusRing(artist.statusTag)} sm:h-20 sm:w-20`}
              >
                <img src={artist.profileImage} alt="" className="h-full w-full object-cover" decoding="async" />
              </div>
              <span className="mt-2.5 max-w-full text-center text-[11px] font-semibold leading-tight text-white/88 sm:text-[12px]">
                {artist.name}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
