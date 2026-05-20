"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { NotificationsHeaderLink } from "@/components/shop/NotificationsHeaderLink";
import { ProfileHeaderLink } from "@/components/shop/ProfileHeaderLink";
import { PreviewBagHeaderLink } from "@/components/shop/PreviewBagHeaderLink";
import { ease } from "./motion";

const iconBtn =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/90 transition-colors hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white";

export function PremiumHomeTopBar() {
  const pathname = usePathname() ?? "";
  const onSearch = pathname.startsWith("/search");

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="pointer-events-none fixed top-0 right-0 left-0 z-[90] flex justify-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden"
    >
      <div className="pointer-events-auto mt-1 flex h-[3.25rem] w-full max-w-md items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0a0a10]/72 px-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-150">
        <ProfileHeaderLink className={iconBtn} />

        <Link href="/" className="flex min-w-0 flex-1 justify-center px-1 opacity-95" aria-label="Salvya home">
          <SalvyaLogoImage
            variant="light"
            alt=""
            fallback="word"
            className="h-[26px] w-auto max-w-[min(160px,42vw)] object-contain"
            fallbackClassName="text-[15px] font-semibold tracking-tight text-white"
          />
        </Link>

        <motion.div className="flex shrink-0 items-center gap-1">
          <Link
            href="/search"
            className={`${iconBtn} ${onSearch ? "text-white" : ""}`}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.55" />
              <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
            </svg>
          </Link>

          <NotificationsHeaderLink className={iconBtn} iconClassName="h-[19px] w-[19px]" />

          <PreviewBagHeaderLink className={iconBtn} />
        </motion.div>
      </div>
    </motion.header>
  );
}
