"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { motion, useReducedMotion } from "framer-motion";
import { welcomeHeadline } from "@/lib/member/welcome-copy";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  user: User;
};

/**
 * Minimal signed-in hero — typography-first, generous space, single primary action
 * (replaces the full-bleed marketing `StoreHero` on `/` for customers).
 */
export function MemberWelcomeHero({ user }: Props) {
  const reduceMotion = useReducedMotion();
  const { line, name } = welcomeHeadline(user);

  return (
    <section
      className="relative w-full overflow-hidden border-b border-white/[0.05] bg-[#0a0a0c]"
      aria-labelledby="member-welcome-heading"
    >
      {/* Quiet depth — soft bloom, no busy UI */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 70% at 50% -15%, rgba(88,110,180,0.14), transparent 55%), radial-gradient(ellipse 80% 50% at 80% 100%, rgba(45,107,255,0.06), transparent 45%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0c]/40 to-[#050508]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[min(100%,26rem)] px-6 sm:max-w-[28rem] sm:px-8">
        <div
          className="flex flex-col pt-[calc(env(safe-area-inset-top)+5.25rem)] pb-[clamp(3.5rem,12vh,5.5rem)] sm:pt-[calc(env(safe-area-inset-top)+6rem)] sm:pb-[clamp(4rem,14vh,6.5rem)]"
        >
          <motion.h1
            id="member-welcome-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.95, ease }}
            className="m-0 text-balance"
          >
            <span className="block text-[clamp(2.65rem,11vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-white">
              {name}
            </span>
            <span className="mt-4 block text-[clamp(1.05rem,3.6vw,1.2rem)] font-normal leading-snug tracking-[-0.01em] text-white/38">
              {line}.
            </span>
          </motion.h1>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.14, ease }}
            className="mt-14 sm:mt-16"
          >
            <Link
              href="/shop"
              prefetch={false}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-9 text-[15px] font-medium text-neutral-950 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] transition-[transform,opacity,background-color] duration-200 hover:bg-neutral-100 active:scale-[0.98]"
            >
              Continue
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
