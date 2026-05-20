"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginHref, registerHref } from "@/lib/auth/login-href";
import { clearPendingEngagement, writePendingEngagement, type PendingEngagement } from "@/lib/auth/pending-engagement";
import type { LikedItemInput } from "@/lib/member/likes-storage";

export type GuestGateKind = "like" | "follow" | "comment";

export type GuestEngagementContextValue = {
  /** Soft gate for product hearts — stores pending like for post-login completion. */
  openLikeGate: (input: LikedItemInput) => void;
  /** Soft gate for follow — stores pending follow for post-login completion. */
  openFollowGate: (slug: string, meta: { name: string; profileImage: string }) => void;
  openCommentGate: () => void;
  closeGate: () => void;
  gateOpen: boolean;
  gateKind: GuestGateKind | null;
  followArtistLabel: string | null;
};

const GuestEngagementContext = createContext<GuestEngagementContextValue | null>(null);

export function useGuestEngagement(): GuestEngagementContextValue {
  const ctx = useContext(GuestEngagementContext);
  if (!ctx) throw new Error("useGuestEngagement must be used within GuestEngagementProvider");
  return ctx;
}

export function GuestEngagementProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState<GuestGateKind | null>(null);
  const [followArtistLabel, setFollowArtistLabel] = useState<string | null>(null);

  const nextPath = pathname || "/";

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setGateKind(null);
    setFollowArtistLabel(null);
    clearPendingEngagement();
  }, []);

  const openLikeGate = useCallback((input: LikedItemInput) => {
    const pending: PendingEngagement = { v: 1, kind: "like", input };
    writePendingEngagement(pending);
    setFollowArtistLabel(null);
    setGateKind("like");
    setGateOpen(true);
  }, []);

  const openFollowGate = useCallback((slug: string, meta: { name: string; profileImage: string }) => {
    const pending: PendingEngagement = { v: 1, kind: "follow", slug, meta };
    writePendingEngagement(pending);
    setFollowArtistLabel(meta.name);
    setGateKind("follow");
    setGateOpen(true);
  }, []);

  const openCommentGate = useCallback(() => {
    clearPendingEngagement();
    setFollowArtistLabel(null);
    setGateKind("comment");
    setGateOpen(true);
  }, []);

  const value = useMemo<GuestEngagementContextValue>(
    () => ({
      openLikeGate,
      openFollowGate,
      openCommentGate,
      closeGate,
      gateOpen,
      gateKind,
      followArtistLabel,
    }),
    [openLikeGate, openFollowGate, openCommentGate, closeGate, gateOpen, gateKind, followArtistLabel],
  );

  const login = loginHref(nextPath);
  const signup = registerHref(nextPath);

  return (
    <GuestEngagementContext.Provider value={value}>
      {children}
      {gateOpen && gateKind ? (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/75 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-gate-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={closeGate}
          />
          <div className="relative z-[1] w-full max-w-[min(100%,380px)] overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#0a0c12] p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04]">
            <h2 id="guest-gate-title" className="text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-white">
              {gateKind === "like"
                ? "Save favorites"
                : gateKind === "follow"
                  ? "Follow artists"
                  : "Join the conversation"}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/52">
              {gateKind === "like"
                ? "Create an account to like items and save your favorites."
                : gateKind === "follow"
                  ? "Create an account to follow artists and keep their drops on your radar."
                  : "Sign in to join the conversation."}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-end">
              {gateKind === "comment" ? (
                <Link
                  href={login}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(45,107,255,0.55)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] sm:flex-initial"
                >
                  Sign in
                </Link>
              ) : (
                <>
                  <Link
                    href={signup}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] px-5 text-[14px] font-semibold text-white/92 transition-colors hover:bg-white/[0.1] active:scale-[0.99] sm:flex-initial"
                  >
                    Create account
                  </Link>
                  <Link
                    href={login}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(45,107,255,0.55)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] sm:flex-initial"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {gateKind === "comment" ? (
              <p className="mt-4 text-center text-[13px] text-white/38">
                New here?{" "}
                <Link href={signup} className="font-semibold text-[#8fa8e8] underline-offset-2 hover:underline">
                  Create an account
                </Link>
              </p>
            ) : null}

            {gateKind === "follow" && followArtistLabel ? (
              <p className="mt-4 text-[12px] text-white/32">You were about to follow {followArtistLabel}.</p>
            ) : null}

            <div className="mt-5 flex justify-center border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={closeGate}
                className="text-[13px] font-medium text-white/40 transition-colors hover:text-white/60"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </GuestEngagementContext.Provider>
  );
}
