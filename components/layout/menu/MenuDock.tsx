"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { airSpring } from "./menu-motion";

type Props = {
  bagTotal: number;
  onClose: () => void;
  reduceMotion: boolean | null;
};

/** Floating bag — elevated surface, crisp ring */
export function MenuDock({ bagTotal, onClose, reduceMotion }: Props) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.18 }}
      className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-10"
    >
      <Link
        href="/preview-bag"
        prefetch={false}
        onClick={onClose}
        className="relative flex h-14 min-w-[7.25rem] items-center justify-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white px-4 text-neutral-900 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-14px_rgba(15,23,42,0.16)] active:translate-y-0 active:scale-[0.97]"
        aria-label={bagTotal > 0 ? `Your bag, ${bagTotal} items` : "Your bag"}
      >
        <BagIcon className="h-[21px] w-[21px] shrink-0" />
        <span className="text-[13px] font-semibold tracking-tight">Bag</span>
        {bagTotal > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full bg-gradient-to-b from-neutral-900 to-neutral-800 px-1 text-[10px] font-bold text-white shadow-md tabular-nums ring-2 ring-white">
            {bagTotal > 99 ? "99+" : bagTotal}
          </span>
        ) : null}
      </Link>
    </motion.div>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8h12l1 12H5L6 8zm3-3a3 3 0 016 0V8H9V5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
