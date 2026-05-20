"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { artists, heroBackgroundImage } from "@/lib/site-data";
import { HEADER_BAR_HEIGHT } from "./AppHeader";

const featuredArtist = artists.find((a) => a.statusTag !== "COMING SOON") ?? artists[0];

const kickerTop = `calc(env(safe-area-inset-top) + ${HEADER_BAR_HEIGHT} + 0.75rem)`;

export function ImmersiveHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const panelY = useTransform(scrollYProgress, [0, 0.9], [0, 28]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.85]);

  return (
    <section
      ref={ref}
      className="relative z-10 flex min-h-dvh w-full flex-col overflow-hidden bg-[#020203] pt-0"
    >
      {/* Full-viewport imagery from y=0 — continues seamlessly under the fixed header */}
      <motion.div
        style={{ y: yBg, scale: imgScale }}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <Image
          src={heroBackgroundImage}
          alt=""
          fill
          sizes="100vw"
          quality={75}
          className="scale-[1.12] object-cover object-center opacity-[0.42] blur-3xl saturate-[1.08]"
          aria-hidden
        />
        <Image
          src={heroBackgroundImage}
          alt="Salvya — artist merch and culture"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-contain object-center"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_42%,transparent_18%,rgba(2,2,4,0.5)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#030306] via-[#030306]/85 to-transparent"
          aria-hidden
        />
        <div className="grain-overlay absolute inset-0 z-[1] opacity-[0.065]" aria-hidden />
      </motion.div>

      {/* Light wash under status bar only — keeps continuity with the glass header */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-black/35 to-transparent"
        aria-hidden
      />

      {/* Copy stack sitting on the image, directly below the header bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-x-0 z-[25] px-5"
        style={{ top: kickerTop }}
      >
        <div className="mx-auto max-w-md space-y-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-white/88 drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
            The artist store
          </p>
          <div className="mx-auto flex items-center justify-center gap-3 opacity-90">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/45" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/55 drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]">
              Authentic merch · Limited runs
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/45" aria-hidden />
          </div>
          <p className="mx-auto max-w-[17rem] text-[13px] font-light leading-relaxed tracking-wide text-white/62 drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)]">
            Shop official drops from the artists you stream — shipped across Europe.
          </p>
        </div>
      </motion.div>

      <motion.div
        style={{ y: panelY, opacity: panelOpacity }}
        className="relative z-10 mt-auto flex w-full flex-1 flex-col justify-end"
      >
        <div className="mx-auto w-full max-w-md px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-t-[1.85rem] border border-white/[0.1] bg-gradient-to-b from-white/[0.11] to-white/[0.025] px-6 pb-8 pt-9 shadow-[0_-20px_90px_rgba(0,0,0,0.58)] backdrop-blur-[32px]"
          >
            <div
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#2D6BFF]/65 to-transparent"
              aria-hidden
            />

            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full border border-white/[0.1] bg-black/25 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-white/55 backdrop-blur-sm">
                Live lineup
              </span>
              <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.38em] text-white/78">
                Salvya presents
              </h2>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-center font-semibold tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(2.75rem, 12vw, 3.85rem)", lineHeight: 0.92 }}
            >
              <span className="bg-gradient-to-b from-white via-white to-white/78 bg-clip-text text-transparent">
                SALVYA
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-4 max-w-[19rem] text-center text-[15px] font-light leading-relaxed text-white/56"
            >
              Culture-first pieces — designed with artists, made for fans who show up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="#artists"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2D6BFF] text-[13px] font-semibold tracking-wide text-white shadow-[0_12px_40px_-12px_rgba(45,107,255,0.85)] transition-[transform,box-shadow] hover:bg-[#3f78ff] hover:shadow-[0_14px_44px_-10px_rgba(45,107,255,0.9)] active:scale-[0.98]"
                >
                  Explore artists
                </Link>
                <Link
                  href={`/artist/${featuredArtist.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.05] text-[13px] font-semibold tracking-wide text-white/92 transition-colors hover:bg-white/[0.09] active:scale-[0.98]"
                >
                  Shop {featuredArtist.name}
                </Link>
              </div>
              <p className="text-center text-[11px] font-light tracking-[0.06em] text-white/34">
                Secure checkout · EU shipping
              </p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none flex justify-center pb-3 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 1.35, duration: 0.8 }}
          aria-hidden
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-medium uppercase tracking-[0.4em] text-white/36">
              Discover
            </span>
            <div className="h-px w-10 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
