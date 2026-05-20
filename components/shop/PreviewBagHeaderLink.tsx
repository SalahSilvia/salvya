"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useBag } from "@/components/cart/BagProvider";

/** Tote-style bag: arched handles + tapered body (reads clearly at 20–22px). */
function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={22} height={22} aria-hidden>
      <path
        d="M8.25 9V6.75a3.75 3.75 0 017.5 0V9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4.75 9h14.5l-1.05 10.5a1.75 1.75 0 01-1.74 1.575H7.54A1.75 1.75 0 015.8 19.5L4.75 9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 13.25h.01M15 13.25h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity={0.35}
      />
    </svg>
  );
}

type Props = {
  className: string;
  style?: CSSProperties;
};

export function PreviewBagHeaderLink({ className, style }: Props) {
  const { totalQty, isSignedIn, synced } = useBag();
  const bagWord = "Your bag";
  const syncNote = isSignedIn && synced ? ", synced to your account" : "";

  return (
    <Link
      href="/preview-bag"
      prefetch={false}
      className={className}
      style={style}
      aria-label={
        totalQty > 0
          ? `${bagWord}, ${totalQty} ${totalQty === 1 ? "item" : "items"}${syncNote}`
          : `${bagWord}${syncNote}`
      }
    >
      <span className="relative inline-flex items-center justify-center [&>svg]:translate-y-px">
        <BagIcon />
        {totalQty > 0 ? (
          <span
            className="pointer-events-none absolute -right-1.5 -top-1.5 z-[1] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white"
            aria-hidden
          >
            {totalQty > 9 ? "9+" : totalQty}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
