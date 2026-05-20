"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ArtistCard } from "@/lib/site-data";
import { ease } from "./motion";

type Props = {
  artist: ArtistCard;
};

export function FeaturedCreatorSpotlight({ artist }: Props) {
  return (
    <section className="relative py-12">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease }}
        className="relative mx-auto max-w-md overflow-hidden rounded-[1.85rem] border border-white/[0.08] shadow-[0_40px_100px_-48px_rgba(0,0,0,0.95)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-[center_22%]"
          style={{ backgroundImage: `url(${artist.coverImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/95 via-[#050508]/82 to-[#050508]/35" aria-hidden />
        <div className="grain-overlay absolute inset-0 opacity-[0.07]" aria-hidden />
        <div className="relative z-[1] flex min-h-[280px] flex-col justify-end px-7 pb-8 pt-24 sm:min-h-[320px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Artist shop</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.1rem]">{artist.name}</h2>
          <p className="mt-2 max-w-[18rem] text-[14px] leading-relaxed text-white/55">{artist.aboutLead}</p>
          <Link
            href={`/artist/${artist.slug}`}
            className="mt-6 inline-flex w-fit rounded-full border border-white/[0.18] bg-white/[0.09] px-6 py-2.5 text-[13px] font-semibold text-white backdrop-blur-md transition-[transform,background-color] hover:bg-white/[0.14] active:scale-[0.98]"
          >
            Shop {artist.name}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
