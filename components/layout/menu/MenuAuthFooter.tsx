"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { loginHref } from "@/lib/auth/login-href";
import { airSpring } from "./menu-motion";

type Props = {
  onClose: () => void;
  reduceMotion: boolean | null;
};

function UserBadge() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-sm ring-1 ring-white/15"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-current">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8ZM4 20a8 8 0 0116 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function MenuAuthFooter({ onClose, reduceMotion }: Props) {
  const pathname = usePathname() ?? "/";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.08 }}
      className="overflow-hidden rounded-[1.35rem] border border-neutral-100 bg-white shadow-[0_2px_24px_-16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1),inset_3px_0_0_0_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/50 px-4 py-3.5">
        <UserBadge />
        <p className="m-0 text-[13px] font-bold uppercase leading-none tracking-wide text-neutral-500 sm:text-[14px]">Account</p>
      </div>
      <div className="flex flex-col gap-2.5 p-4 sm:p-5">
        <Link
          href={loginHref(pathname)}
          prefetch={false}
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-800 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_-10px_rgba(0,0,0,0.45)] transition-[transform,filter] hover:brightness-110 active:scale-[0.99]"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          prefetch={false}
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-xl border border-neutral-200/90 bg-white/95 py-3.5 text-[15px] font-semibold text-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-[transform,background-color,border-color] hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99]"
        >
          Create account
        </Link>
      </div>
    </motion.div>
  );
}
