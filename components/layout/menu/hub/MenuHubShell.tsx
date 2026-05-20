"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: ReactNode;
  logoHref: string;
  onClose: () => void;
  closeLabel?: string;
};

export function MenuHubShell({ children, logoHref, onClose, closeLabel = "Done" }: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <motion.div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#050508] text-white"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease }}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-15%,rgba(45,107,255,0.14),transparent_55%)]" />
        <motion.div
          className="absolute -right-1/4 top-[8%] h-[45vh] w-[70vw] max-w-xl rounded-full bg-gradient-to-bl from-[#2D6BFF]/20 via-violet-500/10 to-transparent blur-[90px]"
          animate={reduceMotion ? undefined : { opacity: [0.35, 0.55, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.05]" />
      </motion.div>

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#050508]/70 px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-2xl sm:px-6">
        <Link
          href={logoHref}
          prefetch={false}
          className="inline-flex max-w-[min(100%,200px)] items-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
        >
          <SalvyaLogoImage
            variant="light"
            alt="Salvya"
            fallback="word"
            className="h-8 w-auto max-w-[min(100%,200px)] object-contain object-left"
            fallbackClassName="text-[15px] font-semibold tracking-tight text-white"
          />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] px-4 text-[13px] font-semibold text-white/88 transition-[background-color,transform] hover:bg-white/[0.1] active:scale-[0.98]"
        >
          <span className="hidden sm:inline">{closeLabel}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-white/75 sm:hidden" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        role="region"
        aria-label="Menu content"
      >
        <div className="mx-auto w-full max-w-lg px-4 pb-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom)))] pt-2 sm:px-6 sm:pb-28">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
