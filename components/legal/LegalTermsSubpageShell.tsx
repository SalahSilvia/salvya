import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  pill: string;
  children: ReactNode;
};

/**
 * Shared chrome for /terms/* subpages (matches main Terms header pattern).
 */
export function LegalTermsSubpageShell({ pill, children }: Props) {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <Link
            href="/terms"
            className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            ← All terms
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold sm:gap-x-4">
            <Link href="/terms/account" className="text-slate-500 transition-colors hover:text-slate-800">
              Account
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/terms/creator" className="text-slate-500 transition-colors hover:text-slate-800">
              Influencer
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <span className="hidden text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:inline">
              {pill}
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
