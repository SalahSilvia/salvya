"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { sortArtistsByFollows } from "@/lib/home/follows-personalize";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ArtistCard } from "@/lib/site-data";
import { ease } from "./motion";

function initials(name: string): string {
  const spaced = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  const parts = spaced.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StoryAvatar({ artist, isSoon }: { artist: ArtistCard; isSoon: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full">
      {!failed && (
        <img
          src={artist.profileImage}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${isSoon ? "opacity-55 saturate-[0.7]" : ""}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${artist.gradient}`}>
          <span className="text-[15px] font-semibold tracking-tight text-white">{initials(artist.name)}</span>
        </div>
      )}
      {isSoon && <div className="absolute inset-0 z-[1] rounded-full bg-black/40 backdrop-blur-[1px]" aria-hidden />}
    </div>
  );
}

function StoryRing({
  artist,
  isSoon,
  hasLive,
}: {
  artist: ArtistCard;
  isSoon: boolean;
  hasLive: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto size-[76px] sm:size-[84px]">
      {hasLive && !reduce ? (
        <motion.span
          className="pointer-events-none absolute -inset-[3px] rounded-full bg-gradient-to-br from-[#2D6BFF]/55 via-fuchsia-400/25 to-amber-300/20 opacity-90 blur-[1px]"
          animate={{ opacity: [0.55, 0.95, 0.55], scale: [1, 1.03, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      ) : hasLive ? (
        <span
          className="pointer-events-none absolute -inset-[3px] rounded-full bg-gradient-to-br from-[#2D6BFF]/45 via-fuchsia-400/20 to-amber-200/15 opacity-80"
          aria-hidden
        />
      ) : null}
      <div
        className={`relative flex size-full items-center justify-center rounded-full bg-gradient-to-br p-[2.5px] shadow-[0_18px_48px_-20px_rgba(0,0,0,0.75)] ${
          hasLive
            ? "from-[#2D6BFF]/70 via-white/25 to-[#ff9ecd]/35"
            : "from-white/25 via-white/[0.08] to-white/[0.04]"
        }`}
      >
        <div className="relative size-[calc(100%-5px)] overflow-hidden rounded-full ring-1 ring-black/40">
          <StoryAvatar artist={artist} isSoon={isSoon} />
        </div>
      </div>
      {hasLive ? (
        <span className="absolute -bottom-0.5 left-1/2 z-[2] -translate-x-1/2 rounded-full border border-white/20 bg-[#ff3355] px-1.5 py-[1px] text-[7px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,51,85,0.55)]">
          Live
        </span>
      ) : null}
    </div>
  );
}

function ArtistStoryCell({
  artist,
  onPreview,
  isFollowed,
}: {
  artist: ArtistCard;
  onPreview: (a: ArtistCard) => void;
  isFollowed: boolean;
}) {
  const isSoon = artist.statusTag === "COMING SOON";
  /** Some “limited” artists skip the red Live pill in this rail. */
  const hasLive =
    artist.statusTag === "LIMITED DROP" &&
    artist.slug !== "babygang" &&
    artist.slug !== "billie-eilish";
  const blockClickRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPress = useCallback(() => {
    blockClickRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      blockClickRef.current = true;
      onPreview(artist);
    }, 520);
  }, [artist, onPreview, clearTimer]);

  const endPress = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return (
    <div className="flex w-[88px] shrink-0 flex-col items-center gap-2.5 sm:w-[96px]">
      <Link
        href={isSoon ? "#" : `/artist/${artist.slug}`}
        prefetch={false}
        onClick={(e) => {
          if (isSoon) {
            e.preventDefault();
            return;
          }
          if (blockClickRef.current) {
            e.preventDefault();
            blockClickRef.current = false;
          }
        }}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={clearTimer}
        onPointerCancel={clearTimer}
        className={`group relative block outline-none ${isSoon ? "pointer-events-none opacity-60" : ""}`}
        aria-label={`${artist.name} storefront`}
      >
        <motion.div whileTap={isSoon ? undefined : { scale: 0.96 }} transition={{ type: "spring", stiffness: 520, damping: 28 }}>
          <StoryRing artist={artist} isSoon={isSoon} hasLive={hasLive} />
        </motion.div>
      </Link>
      <p className="max-w-[5.5rem] text-center text-[11px] font-medium leading-tight tracking-[-0.01em] text-white/72">
        {artist.name}
        {isFollowed ? (
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-[#7ea3ff]/90">
            Following
          </span>
        ) : null}
      </p>
    </div>
  );
}

export function ArtistStoriesRail({
  artists,
  follows = [],
  maxVisible = 8,
  viewAllHref = "/shop",
}: {
  artists: ArtistCard[];
  follows?: ArtistFollowRecord[];
  /** Cap horizontal rail (remainder via “View all”). */
  maxVisible?: number;
  viewAllHref?: string | null;
}) {
  const [preview, setPreview] = useState<ArtistCard | null>(null);
  const followSet = useMemo(() => new Set(follows.map((f) => f.slug)), [follows]);
  const orderedArtists = useMemo(() => {
    if (!follows.length) return artists;
    return sortArtistsByFollows(artists, follows);
  }, [artists, follows]);

  const visible = orderedArtists.slice(0, maxVisible);
  const overflow = orderedArtists.length > maxVisible;

  return (
    <>
      <section id="artist-stories" className="scroll-mt-[calc(env(safe-area-inset-top)+5rem)] border-t border-white/[0.04] bg-[#050508] px-5 py-9">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-md"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/42">Discover</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Artists</h2>
          <p className="mt-1 text-[13px] text-white/42">
            {follows.length > 0 ? "Creators you follow appear first." : "Explore official storefronts on Salvya."}
          </p>
        </motion.div>
        <div className="mt-6 flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((artist) => (
            <ArtistStoryCell
              key={artist.slug}
              artist={artist}
              onPreview={setPreview}
              isFollowed={followSet.has(artist.slug)}
            />
          ))}
        </div>
        {viewAllHref && overflow ? (
          <div className="mx-auto mt-4 flex max-w-md justify-end px-0">
            <Link
              href={viewAllHref}
              prefetch={false}
              className="text-[12px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]"
            >
              View all artists →
            </Link>
          </div>
        ) : viewAllHref && !overflow ? (
          <div className="mx-auto mt-4 flex max-w-md justify-end px-0">
            <Link
              href={viewAllHref}
              prefetch={false}
              className="text-[12px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]"
            >
              Browse shop →
            </Link>
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {preview ? (
          <motion.div
            key={preview.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] backdrop-blur-md sm:items-center sm:pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-preview-title"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#0c0c12]/95 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
            >
              <div className="relative h-36 bg-gradient-to-br from-white/[0.08] to-transparent">
                <img src={preview.coverImage} alt="" className="h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] to-transparent" />
              </div>
              <div className="space-y-2 px-5 pb-5 pt-3">
                <p id="story-preview-title" className="text-lg font-semibold tracking-[-0.02em] text-white">
                  {preview.name}
                </p>
                <p className="text-[13px] leading-relaxed text-white/55">{preview.aboutLead}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7ea3ff]/90">Latest drop</p>
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/artist/${preview.slug}`}
                    className="flex-1 rounded-xl bg-white py-2.5 text-center text-[13px] font-semibold text-[#050508] transition-opacity hover:opacity-95"
                    onClick={() => setPreview(null)}
                  >
                    Open storefront
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="rounded-xl border border-white/[0.12] px-4 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/[0.06]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
