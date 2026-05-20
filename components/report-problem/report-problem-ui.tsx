"use client";

import type { ReactNode } from "react";

export const REPORT_EASE = [0.22, 1, 0.36, 1] as const;

export function ReportAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-[6%] top-[-4%] h-[min(18rem,55vw)] w-[min(18rem,55vw)] rounded-full bg-violet-500/[0.12] blur-[88px]" />
      <div className="absolute -left-[18%] bottom-[12%] h-[min(12rem,40vw)] w-[min(12rem,40vw)] rounded-full bg-[#2D6BFF]/[0.1] blur-[72px]" />
      <div className="grain-overlay absolute inset-0 opacity-[0.04]" />
    </div>
  );
}

export function ReportSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/38">{children}</h2>
  );
}

export function ReportCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[1.15rem] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export const reportFieldClass =
  "w-full rounded-xl border border-white/[0.12] bg-black/30 px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none transition-shadow focus:border-[#2D6BFF]/40 focus:ring-2 focus:ring-[#2D6BFF]/25";
