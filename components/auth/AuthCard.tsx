"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

/** Stripe / Notion–style elevated auth card. */
export function AuthCard({ title, subtitle, children, footer, maxWidthClass = "max-w-[400px]" }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`mx-auto w-full ${maxWidthClass}`}
    >
      <div className="relative overflow-hidden rounded-[1.35rem] border border-neutral-200/90 bg-white/[0.98] p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_80px_-28px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.9)_inset] ring-1 ring-neutral-900/[0.04] backdrop-blur-sm sm:p-9">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent"
          aria-hidden
        />

        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50/90 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <SalvyaLogoImage
              variant="dark"
              alt="Salvya"
              className="h-[22px] w-auto max-w-[9rem] object-contain object-left"
              fallback="word"
              fallbackClassName="text-lg font-bold tracking-tight text-neutral-900"
            />
          </div>
          <h1 className="mt-6 text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-[1.85rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </motion.div>
  );
}
