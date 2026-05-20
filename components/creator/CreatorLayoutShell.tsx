"use client";

import Link from "next/link";

/** Apply / onboarding shell — separate from Creator Studio product surface. */
export function CreatorLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#050508] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050508]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/creator" className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300/70">Salvya</p>
            <p className="text-[14px] font-semibold tracking-tight text-white/90">Creator Workspace</p>
          </Link>
          <Link
            href="/creator/dashboard"
            className="hidden rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-100/90 hover:bg-violet-500/15 sm:inline-flex"
          >
            Dashboard
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
