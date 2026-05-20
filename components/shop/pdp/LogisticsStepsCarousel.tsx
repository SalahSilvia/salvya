"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LogisticsStep = {
  n: string;
  title: string;
  body: string;
};

type Props = {
  steps: LogisticsStep[];
};

export function LogisticsStepsCarousel({ steps }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
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
  }, [steps.length, updateScrollState]);

  return (
    <div className="relative mt-8">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Fulfillment steps"
      >
        {steps.map((s) => (
          <article
            key={s.n}
            className="w-[min(82vw,17.5rem)] shrink-0 snap-start rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:w-[17.5rem] sm:p-5"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2D6BFF]/15 text-[12px] font-bold text-[#9ab6ff]">
              {s.n}
            </span>
            <p className="mt-3 text-[14px] font-semibold text-white/88">{s.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/42">{s.body}</p>
          </article>
        ))}
      </div>
      {canScrollForward ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#050508] to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
