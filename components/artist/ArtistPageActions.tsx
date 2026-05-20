"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useArtistFollows } from "@/components/artist/ArtistFollowsProvider";

type Props = {
  slug: string;
  artistName: string;
  profileImage: string;
  aboutLead: string;
  aboutMore?: string;
};

function MenuDotsIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <circle cx="12" cy="6" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="18" r="1.75" />
    </svg>
  );
}

export function ArtistPageActions({ slug, artistName, profileImage, aboutLead, aboutMore }: Props) {
  const { isFollowing, toggleFollow } = useArtistFollows();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const following = mounted && isFollowing(slug);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else if (aboutOpen) setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, aboutOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [menuOpen]);

  useEffect(() => {
    if (!aboutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aboutOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleFollowFromMenu = useCallback(() => {
    toggleFollow(slug, { name: artistName, profileImage });
  }, [artistName, profileImage, slug, toggleFollow]);

  const shareArtist = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    setShareHint(null);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${artistName} — Salvya`, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareHint("Link copied");
      window.setTimeout(() => setShareHint(null), 2000);
    } catch {
      setShareHint("Copy link manually");
      window.setTimeout(() => setShareHint(null), 2500);
    }
  }, [artistName]);

  const openAbout = useCallback(() => {
    closeMenu();
    setAboutOpen(true);
  }, [closeMenu]);

  const onShare = useCallback(() => {
    closeMenu();
    void shareArtist();
  }, [closeMenu, shareArtist]);

  const onFollowToggle = useCallback(() => {
    closeMenu();
    toggleFollowFromMenu();
  }, [closeMenu, toggleFollowFromMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Artist menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-black/35 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors hover:border-white/[0.18] hover:bg-black/50 hover:text-white active:scale-[0.97]"
      >
        <MenuDotsIcon />
      </button>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="artist-menu"
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-[90] mt-2 w-[min(17.5rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white py-1.5 text-[#0c0c10] shadow-[0_20px_56px_-12px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-4 py-3.5 text-left text-[15px] font-medium text-[#0c0c10]/92 transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
              onClick={openAbout}
            >
              About artist
            </button>
            <div className="mx-3 h-px bg-black/[0.06]" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-4 py-3.5 text-left text-[15px] font-medium text-[#0c0c10]/92 transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
              onClick={onShare}
            >
              Share
            </button>
            <div className="mx-3 h-px bg-black/[0.06]" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-4 py-3.5 text-left text-[15px] font-medium transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
              onClick={onFollowToggle}
            >
              <span className={following ? "text-[#2D6BFF]" : "text-[#0c0c10]/92"}>
                {following ? "Unfollow" : "Follow"}
              </span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {shareHint ? (
        <p
          className="pointer-events-none absolute right-0 top-[calc(100%+0.35rem)] max-w-[11rem] text-right text-[11px] font-medium text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]"
          role="status"
        >
          {shareHint}
        </p>
      ) : null}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {aboutOpen ? (
              <motion.div
                key="about-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="artist-about-dialog-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-sm sm:items-center sm:p-6"
                onClick={() => setAboutOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="relative w-full max-w-md rounded-[1.35rem] bg-white text-[#0c0c10] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.55)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setAboutOpen(false)}
                    className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-[#0c0c10]/55 transition-colors hover:bg-black/[0.06] hover:text-[#0c0c10]"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <div className="max-h-[min(72vh,540px)] overflow-y-auto px-6 pb-7 pt-9 sm:px-8 sm:pb-8 sm:pt-10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0c0c10]/45">
                      About
                    </p>
                    <h2 id="artist-about-dialog-title" className="mt-2 text-xl font-semibold tracking-tight text-[#0c0c10]">
                      {artistName}
                    </h2>
                    <p className="mt-5 text-[15px] font-normal leading-[1.65] text-[#0c0c10]/78">{aboutLead}</p>
                    {aboutMore?.trim() ? (
                      <p className="mt-4 text-[15px] font-normal leading-[1.7] text-[#0c0c10]/65">{aboutMore}</p>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
