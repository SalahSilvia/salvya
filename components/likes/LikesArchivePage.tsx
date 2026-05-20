"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GuestSavedItemsWall } from "@/components/likes/GuestSavedItemsWall";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import { useLikes } from "@/components/likes/LikesProvider";
import { SalvyaHeartIcon } from "@/components/ui/SalvyaIcons";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

const ease = [0.22, 1, 0.36, 1] as const;

export function LikesArchivePage() {
  const reduceMotion = useReducedMotion();
  const { getLikedItems, isSignedIn, synced } = useLikes();
  const items = getLikedItems();

  if (!isSignedIn) {
    return <GuestSavedItemsWall />;
  }

  const archiveSubtitle = synced
    ? "Everything you loved — saved to your Salvya account and ready on any device."
    : "Everything you loved — saved on this device. Cloud sync will keep them on your account when enabled.";

  if (!items.length) {
    return <LikesEmptyState reduceMotion={Boolean(reduceMotion)} />;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(45,107,255,0.1),transparent_55%)]" />
        <div className="absolute -right-[20%] top-[20%] h-[min(22rem,80vw)] w-[min(22rem,80vw)] rounded-full bg-rose-500/10 blur-[100px]" />
        <div className="grain-overlay absolute inset-0 opacity-[0.055]" />
      </div>

      <header className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#050508]/72 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-2xl sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">Saved</p>
          <h1 className="mt-1 text-[clamp(1.65rem,6.5vw,2.1rem)] font-semibold leading-tight tracking-[-0.04em] text-white">
            Your taste archive
          </h1>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/45">{archiveSubtitle}</p>
        </motion.div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-4 pb-[max(6.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-28">
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4">
          {items.map((item, i) => (
            <SavedPieceCard key={item.productId} item={item} index={i} reduceMotion={Boolean(reduceMotion)} />
          ))}
        </ul>
      </main>
    </div>
  );
}

function SavedPieceCard({
  item,
  index,
  reduceMotion,
}: {
  item: LikedItemRecord;
  index: number;
  reduceMotion: boolean;
}) {
  const input = {
    productId: item.productId,
    type: item.type,
    artistSlug: item.artistSlug,
    title: item.title,
    imageSrc: item.imageSrc,
    href: item.href,
    priceLabel: item.priceLabel,
    artistLabel: item.artistLabel,
  };

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay: index * 0.05 }}
      className="group/fav relative"
    >
      <Link href={item.href} prefetch={false} className="block outline-none">
        <article className="overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-[#07070f] shadow-[0_22px_56px_-36px_rgba(0,0,0,0.88)] ring-1 ring-inset ring-white/[0.05] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#2D6BFF]/28 hover:shadow-[0_28px_64px_-28px_rgba(45,107,255,0.22)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#0c0c14]">
            <img
              src={item.imageSrc}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover/fav:scale-[1.05]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/88 via-transparent to-transparent" />
            <span className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/[0.12] bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur-md">
              Quick view
            </span>
            <ProductHeartButton input={input} />
          </div>
          <div className="space-y-0.5 px-3 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/38">{item.artistLabel}</p>
            <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-white/92">{item.title}</p>
            <p className="text-[12px] font-semibold text-[#b8c9ff]">{item.priceLabel}</p>
          </div>
        </article>
      </Link>
    </motion.li>
  );
}

function LikesEmptyState({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(45,107,255,0.12),transparent_60%)]" />
        <motion.div
          className="absolute left-[-15%] top-[28%] h-[14rem] w-[14rem] rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-transparent opacity-40 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 16, 0], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-10%] bottom-[22%] h-[12rem] w-[12rem] rounded-full bg-rose-500/15 blur-[90px]"
          animate={reduceMotion ? undefined : { opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.07]" />
      </div>

      <header className="relative z-10 shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Saved</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">Your taste archive</h1>
      </header>

      <main className="relative z-[1] mx-auto flex max-w-md flex-1 flex-col justify-center px-6 pb-[max(6rem,env(safe-area-inset-bottom))] pt-4 text-center sm:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/25 bg-rose-500/[0.12] text-rose-300 shadow-[0_0_40px_-12px_rgba(251,113,133,0.35)]">
            <SalvyaHeartIcon />
          </div>
          <h2 className="m-0 text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-white/95">
            No saved items yet
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/48">
            Tap the heart on any drop to save it here. Sign in to keep your taste archive across devices.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              prefetch={false}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] px-6 text-[14px] font-semibold text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[transform,background-color] hover:bg-white/[0.12] active:scale-[0.99]"
            >
              Explore drops
            </Link>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#2D6BFF]/35 bg-[#2D6BFF]/15 px-6 text-[14px] font-semibold text-[#c8d6ff] transition-[transform,background-color] hover:bg-[#2D6BFF]/22 active:scale-[0.99]"
            >
              Browse creators
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
