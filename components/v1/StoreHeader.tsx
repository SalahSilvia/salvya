"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { ProfileHeaderLink } from "@/components/shop/ProfileHeaderLink";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { NotificationsHeaderLink } from "@/components/shop/NotificationsHeaderLink";
import { PreviewBagHeaderLink } from "@/components/shop/PreviewBagHeaderLink";

const spring = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.8 };

const iconBtnBase =
  "relative z-[1] flex h-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-colors hover:bg-white/[0.1] hover:text-white touch-manipulation active:bg-white/[0.08]";
const iconBtn = `${iconBtnBase} w-11`;

type Props = {
  /**
   * When `false`, the left header control is omitted (signed-in home uses bottom nav only).
   * When `true`, guests see profile + logo + bag — no overlay menu trigger in the header.
   */
  showNavMenu?: boolean;
};

export function StoreHeader({ showNavMenu = true }: Props) {
  const { user } = useSupabaseUser();
  const profileBtnClass = user
    ? `${iconBtn} touch-manipulation active:scale-[0.94] motion-safe:transition-transform`
    : "touch-manipulation active:scale-[0.94] motion-safe:transition-transform";
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 72], ["rgba(5, 5, 8, 0)", "rgba(5, 5, 8, 0.82)"]);
  const backdropFilter = useTransform(
    scrollY,
    [0, 80],
    ["blur(14px) saturate(1.35)", "blur(28px) saturate(1.45)"],
  );

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      style={{
        backgroundColor: headerBg,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
      }}
      className="fixed top-0 right-0 left-0 z-[100] border-b border-white/[0.06] pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(255,255,255,0.04)] md:hidden"
    >
      {showNavMenu ? (
        <motion.div className="mx-auto grid h-14 max-w-md grid-cols-[auto_1fr_auto] items-center gap-2 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.06 }}
            className="relative z-[102] justify-self-start"
          >
            <ProfileHeaderLink className={profileBtnClass} />
          </motion.div>

          <motion.div className="flex min-w-0 justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.08 }}
            >
              <SalvyaLogoImage
                variant="light"
                alt="Salvya"
                fallback="word"
                className="h-[34px] w-auto max-w-[min(240px,52vw)] object-contain object-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
                fallbackClassName="text-xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="flex items-center justify-end gap-2"
          >
            <PreviewBagHeaderLink
              className={`${iconBtn} touch-manipulation active:scale-[0.94] motion-safe:transition-transform`}
            />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.06 }}
            className="min-w-0 flex-1"
          >
            <Link
              href={user ? "/" : "/shop"}
              prefetch={false}
              className="inline-flex max-w-full items-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
            >
              <SalvyaLogoImage
                variant="light"
                alt="Salvya"
                fallback="word"
                className="h-[34px] w-auto max-w-[min(240px,58vw)] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
                fallbackClassName="text-xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="flex shrink-0 items-center gap-2"
          >
            <ProfileHeaderLink className={profileBtnClass} />
            <NotificationsHeaderLink
              className={`${iconBtn} touch-manipulation active:scale-[0.94] motion-safe:transition-transform`}
            />
            <PreviewBagHeaderLink
              className={`${iconBtn} touch-manipulation active:scale-[0.94] motion-safe:transition-transform`}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
