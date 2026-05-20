"use client";

import Link from "next/link";
import { CreatorNotificationsMenu } from "@/components/creator/CreatorNotificationsMenu";
import { ProfileHeaderLink } from "@/components/shop/ProfileHeaderLink";

const utilBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/90 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white";

type CreatorStudioHeaderProps = {
  onOpenCommand: () => void;
  className?: string;
};

/** Standalone creator SaaS header — no storefront mode switching. */
export function CreatorStudioHeader({ onOpenCommand, className = "" }: CreatorStudioHeaderProps) {
  return (
    <header
      className={`border-b border-white/[0.08] bg-[#07040c]/90 backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/creator/dashboard" className="min-w-0 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300/70">
            Salvya
          </p>
          <p className="truncate text-[14px] font-semibold text-white/90">Creator Workspace</p>
        </Link>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white/80 sm:inline-flex"
          aria-label="Open quick actions"
        >
          <span>Quick actions</span>
          <kbd className="rounded border border-white/10 px-1 text-[10px] text-white/40">⌘K</kbd>
        </button>

        <Link
          href="/creator/wallet"
          className={utilBtn}
          aria-label="Wallet"
          title="Wallet"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M4 8h16v10H4V8zm3-3h10a2 2 0 012 2v1H5V7a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <CreatorNotificationsMenu />

        <ProfileHeaderLink className={utilBtn} />
      </div>
    </header>
  );
}
