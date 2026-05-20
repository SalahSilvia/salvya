"use client";

import { useMemo, useRef, type ElementRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { artists, heroBackgroundImage } from "@/lib/site-data";

const ease = [0.22, 1, 0.36, 1] as const;

export function StoreHero() {
  const ref = useRef<ElementRef<"section">>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", "16%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 0.65], reduceMotion ? [0, 0] : [0, 22]);

  const liveArtists = useMemo(() => artists.filter((a) => a.statusTag !== "COMING SOON"), []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh w-full flex-col overflow-hidden rounded-b-[2rem] border-b border-white/[0.06] bg-[#050508] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
    >
      <motion.div
        style={{ y: imgY, scale: imgScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={heroBackgroundImage}
          alt=""
          fill
          priority
          quality={94}
          sizes="100vw"
          className="object-cover object-[center_22%] sm:object-center"
          aria-hidden
        />

        {/* Ambient color — reads on top of photo */}
        <div
          className="pointer-events-none absolute -left-[20%] bottom-[-10%] h-[min(28rem,95vw)] w-[min(28rem,95vw)] rounded-full bg-[#2D6BFF]/25 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-[15%] top-[5%] h-[min(22rem,80vw)] w-[min(22rem,80vw)] rounded-full bg-violet-500/18 blur-[90px]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #050508 0%, #050508 10%, rgba(5,5,8,0.96) 24%, rgba(5,5,8,0.78) 42%, rgba(5,5,8,0.42) 58%, rgba(5,5,8,0.12) 78%, rgba(5,5,8,0) 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(45,107,255,0.12),transparent_55%)]" aria-hidden />
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.055]" aria-hidden />
      </motion.div>

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mt-auto flex flex-1 flex-col justify-end px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+5.75rem)] sm:px-6"
      >
        <div className="mx-auto w-full max-w-md space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b8cff] shadow-[0_0_12px_rgba(91,140,255,0.75)]" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-white/58">Salvya exclusive</p>
            </div>

            <h1 className="text-balance font-semibold tracking-[-0.05em] text-white drop-shadow-[0_12px_48px_rgba(0,0,0,0.55)]">
              <span className="block text-[clamp(2.35rem,9.5vw,3.45rem)] leading-[1.02]">
                Merch from the{" "}
                <span className="bg-gradient-to-r from-white via-[#dbe4ff] to-[#8fa8e8] bg-clip-text text-transparent">
                  artists
                </span>{" "}
                you follow.
              </span>
              <span className="mt-3 block text-[clamp(1.2rem,4.2vw,1.65rem)] font-medium leading-snug tracking-[-0.03em] text-white/78">
                Official drops · small batches · no middlemen
              </span>
            </h1>

            <p className="max-w-[23rem] text-[15px] font-light leading-[1.65] text-white/62">
              Hoodies and tees from the artists you actually follow — EU shipping, secure checkout, every piece tied to
              a real artist shop.
            </p>
          </motion.div>

          {liveArtists.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.28, ease }}
              className="flex flex-wrap items-center gap-3"
            >
              <p className="w-full text-[10px] font-semibold uppercase tracking-wide text-white/38">In the store now</p>
              <div className="flex -space-x-2.5">
                {liveArtists.slice(0, 5).map((a, i) => (
                  <Link
                    key={a.slug}
                    href={`/artist/${a.slug}`}
                    prefetch={false}
                    title={a.name}
                    className="relative z-[1] transition-transform hover:z-[2] hover:scale-105 active:scale-100"
                    style={{ zIndex: 5 - i }}
                  >
                    <span className="relative block h-11 w-11 overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-lg shadow-black/20">
                      <img
                        src={a.profileImage}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.34, ease }}
            className="flex flex-wrap gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/72 backdrop-blur-md">
              <span className="text-[13px]" aria-hidden>
                ✦
              </span>
              EU-friendly shipping
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/72 backdrop-blur-md">
              Limited capsules
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/72 backdrop-blur-md">
              Preview checkout
            </span>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
