"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { homeHeroGreeting } from "@/lib/member/welcome-copy";
import { heroBackgroundImage } from "@/lib/site-data";
import { ease, fadeUp } from "./motion";

type Props = {
  user: User | null;
  backdropSrc: string | null;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
};

export function PremiumHeroSection({ user, backdropSrc, subtitle, primaryHref, primaryLabel }: Props) {
  const { line, name } = homeHeroGreeting(user);

  return (
    <section className="relative min-h-[32vh] w-full overflow-hidden px-5 pb-8 pt-[calc(4.75rem+env(safe-area-inset-top))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {backdropSrc ? (
          <img
            src={backdropSrc}
            alt=""
            className="absolute left-1/2 top-[18%] h-[120%] w-[140%] -translate-x-1/2 scale-110 object-cover opacity-[0.22] blur-[48px] saturate-[1.15]"
            decoding="async"
          />
        ) : (
          <img
            src={heroBackgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18] blur-[36px]"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_30%_20%,rgba(45,107,255,0.2),transparent_55%),radial-gradient(ellipse_80%_60%_at_100%_80%,rgba(255,200,180,0.06),transparent_50%)]" aria-hidden />
        <div className="grain-overlay absolute inset-0 opacity-[0.06]" aria-hidden />
      </div>

      <motion.div className="relative z-[1] mx-auto flex max-w-md flex-col">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
          <p className="text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">Salvya</p>
          <h1 className="mt-2 text-left text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[1.85rem]">
            <span className="text-white/88">{line},</span>{" "}
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">{name}</span>
          </h1>
          <p className="mt-3 max-w-[21rem] text-left text-[14px] leading-relaxed text-white/48">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.12 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.1] px-5 py-2.5 text-[13px] font-semibold text-white/95 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-[transform,background-color,border-color] active:scale-[0.98] hover:border-white/[0.22] hover:bg-white/[0.14]"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a10]/55 px-4 py-2.5 text-[13px] font-semibold text-white/75 backdrop-blur-xl transition-[transform,colors] active:scale-[0.98] hover:border-[#2D6BFF]/35 hover:text-white"
          >
            Search
          </Link>
          <Link
            href="#artist-stories"
            className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a10]/45 px-4 py-2.5 text-[12px] font-semibold text-white/65 backdrop-blur-xl transition-[transform,colors] active:scale-[0.98] hover:border-white/20 hover:text-white/85"
          >
            View artists
          </Link>
          <Link
            href="#limited-drops"
            className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a10]/38 px-4 py-2.5 text-[12px] font-semibold text-white/62 backdrop-blur-xl transition-[transform,colors] active:scale-[0.98] hover:border-[#ff9ecd]/30 hover:text-white/85"
          >
            View drops
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
