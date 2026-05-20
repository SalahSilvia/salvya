"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import type { ElgrandetotoFolderTshirtItem } from "@/lib/elgrandetoto-tshirt-fs";
import { artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import { likedItemInputFromElgrandetotoTshirt } from "@/lib/member/likes-from-card";
import { formatOversizeTshirtTitle, TSHIRT_PRICE_LABEL } from "@/lib/shop-data";

const VISIBLE_FRACTION = 2.5;
const GAP_PX = 12;

type Props = {
  items: ElgrandetotoFolderTshirtItem[];
  artistSlug: string;
};

export function ElgrandetotoTshirtCarousel({ items, artistSlug }: Props) {
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
  }, [items.length, updateScrollState]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-tshirt-card]");
    const w = card?.offsetWidth ?? 0;
    const gapsBetweenVisible = 2;
    const delta =
      w > 0 ? w * VISIBLE_FRACTION + GAP_PX * gapsBetweenVisible : el.clientWidth * 0.78;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  }, []);

  if (!items.length) return null;

  const showBackArrow = scrollLeft > 2;

  const arrowBase =
    "absolute top-[42%] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#050508]/90 text-lg text-white/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-[opacity,transform,colors] duration-200 hover:border-white/[0.16] hover:bg-[#050508] sm:h-10 sm:w-10";

  return (
    <div className="relative">
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
        aria-label="Scroll T-shirts left"
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
        aria-label="Scroll T-shirts right"
        aria-hidden={!canScrollForward}
        tabIndex={canScrollForward ? 0 : -1}
      >
        ›
      </button>

      <div
        ref={scrollerRef}
        className="flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label="T-shirt carousel"
      >
        {items.map((item) => {
          const thumb = item.orderedFiles[0];
          const href = `/artist/${artistSlug}/tshirt/${encodeURIComponent(item.folder)}`;
          return (
            <div
              key={item.folder}
              data-tshirt-card
              className="group/fav relative w-[calc((100%-1.5rem)/2.5)] min-w-[8.25rem] shrink-0 snap-start sm:min-w-[9rem]"
            >
              <Link href={href} className="block">
                <article className="group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] via-[#0a0a0f] to-[#06060a] p-2 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-white/[0.04] transition-[border-color,box-shadow,transform] duration-200 hover:border-[#2D6BFF]/28 hover:shadow-[0_22px_48px_-24px_rgba(45,107,255,0.35)] active:scale-[0.98]">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#0c0c12] ring-1 ring-inset ring-white/[0.06]">
                    {thumb ? (
                      <img
                        src={artistCatalogTshirtImageSrc(artistSlug, item.folder, thumb)}
                        alt=""
                        className="h-full w-full object-cover transition-[transform,filter] duration-300 group-hover:scale-[1.04] group-hover:brightness-[1.04]"
                        decoding="async"
                      />
                    ) : null}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/[0.04] opacity-80 mix-blend-normal"
                      aria-hidden
                    />
                    {thumb ? (
                      <ProductHeartButton input={likedItemInputFromElgrandetotoTshirt(artistSlug, item, thumb)} />
                    ) : null}
                  </div>
                  <div className="mt-2.5 flex min-h-0 flex-1 flex-col gap-2 px-0.5 pb-0.5 pt-0.5">
                    <h3 className="line-clamp-3 min-h-0 text-[12px] font-semibold leading-snug tracking-[-0.015em] text-white sm:text-[13px]">
                      {formatOversizeTshirtTitle(item.title)}
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md border border-[#2D6BFF]/25 bg-[#2D6BFF]/12 px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-tight text-[#c8d6ff] sm:text-[12px]">
                        {TSHIRT_PRICE_LABEL}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-normal text-white/28">Tee</span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
