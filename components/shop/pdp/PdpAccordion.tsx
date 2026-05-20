"use client";

import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  id: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function PdpAccordion({ kicker, title, id, defaultOpen = false, children }: Props) {
  return (
    <details
      className="group rounded-xl border border-white/[0.07] bg-black/20 open:bg-white/[0.02]"
      open={defaultOpen || undefined}
    >
      <summary className="cursor-pointer list-none px-4 py-4 sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="border-l-2 border-[#2D6BFF]/50 pl-4 sm:pl-5">
            <p className="text-[10px] font-semibold uppercase tracking-normal text-white/36">{kicker}</p>
            <h3 id={id} className="mt-2 text-[1.125rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.25rem]">
              {title}
            </h3>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 shrink-0 text-white/40 transition-transform group-open:rotate-180"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </summary>
      <div className="border-t border-white/[0.06] px-4 pb-5 pt-4 sm:px-5 sm:pb-6">{children}</div>
    </details>
  );
}
