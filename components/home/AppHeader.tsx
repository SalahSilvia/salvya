"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { ProfileHeaderLink } from "@/components/shop/ProfileHeaderLink";
import { PreviewBagHeaderLink } from "@/components/shop/PreviewBagHeaderLink";

/** Matches `h-14` inner bar + ScrollProgress offset */
export const HEADER_BAR_HEIGHT = "3.5rem";

export function AppHeader() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 72, 200],
    ["rgba(3, 3, 6, 0)", "rgba(4, 4, 8, 0.72)", "rgba(5, 5, 9, 0.94)"],
  );
  const borderColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"],
  );
  const boxShadow = useTransform(
    scrollY,
    [0, 120],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 16px 48px -16px rgba(0,0,0,0.45)"],
  );

  return (
    <motion.header
      style={{
        backgroundColor,
        borderBottomColor: borderColor,
        boxShadow,
      }}
      className="fixed top-0 right-0 left-0 z-[60] border-b border-transparent pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <div className="relative mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="w-10 shrink-0" aria-hidden />

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <SalvyaLogoImage
            variant="light"
            alt="Salvya"
            fallback="word"
            className="h-[23px] w-auto max-w-[min(200px,50vw)] object-contain object-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
            fallbackClassName="text-base font-semibold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
          />
        </motion.div>

        <div className="relative z-[1] flex shrink-0 items-center gap-2">
          <ProfileHeaderLink className="h-10 w-10 shrink-0 border border-white/[0.09] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-[border-color,transform] hover:border-white/[0.14] hover:bg-white/[0.07] active:scale-[0.97]" />
          <PreviewBagHeaderLink className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.05] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-colors hover:border-white/[0.14] hover:bg-white/[0.09] hover:text-white" />
        </div>
      </div>
    </motion.header>
  );
}
