"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { useGuestEngagement } from "@/components/auth/GuestEngagementProvider";
import { useLikes } from "@/components/likes/LikesProvider";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import type { LikedItemInput } from "@/lib/member/likes-storage";
import { usePathname } from "next/navigation";

type Props = {
  input: LikedItemInput;
  /** `overlay` = on carousel cards; `toolbar` = PDP header next to bag / menu. */
  variant?: "overlay" | "toolbar";
  className?: string;
};

/** Smooth asymmetric heart — reads crisp on merch photography. */
const HEART_D =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function HeartGlyph({ filled, uid }: { filled: boolean; uid: string }) {
  const fillGrad = `hf-${uid}`;
  const strokeGrad = `hs-${uid}`;

  return (
    <svg viewBox="0 0 24 24" width={24} height={24} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={fillGrad} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe4e6" />
          <stop offset="0.28" stopColor="#fda4af" />
          <stop offset="0.55" stopColor="#fb7185" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id={strokeGrad} x1="7" y1="4" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.98)" />
          <stop offset="0.45" stopColor="rgba(255,255,255,0.78)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.42)" />
        </linearGradient>
      </defs>

      {filled ? (
        <>
          <path d={HEART_D} fill={`url(#${fillGrad})`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.65" strokeLinejoin="round" />
          <ellipse cx="12" cy="9" rx="3.5" ry="2.2" fill="white" fillOpacity="0.35" />
        </>
      ) : (
        <path
          d={HEART_D}
          fill="rgba(8,8,12,0.2)"
          stroke={`url(#${strokeGrad})`}
          strokeWidth="1.9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function ProductHeartButton({ input, variant = "overlay", className = "" }: Props) {
  const rawId = useId();
  const uid = `x${rawId.replace(/\W/g, "")}`;
  const pathname = usePathname() ?? "/";
  const { isLiked, toggleLike, isSignedIn } = useLikes();
  const { openLikeGate } = useGuestEngagement();
  const liked = isLiked(input.productId);
  const reduceMotion = useReducedMotion();

  const isToolbar = variant === "toolbar";

  const visibility = isToolbar
    ? "opacity-100"
    : liked
      ? "opacity-100"
      : "opacity-100 md:opacity-0 md:pointer-events-none md:group-hover/fav:pointer-events-auto md:group-hover/fav:opacity-100";

  const positionClass = isToolbar
    ? "relative shrink-0"
    : "absolute right-2 top-2 z-20";

  const surfaceClass = isToolbar
    ? `rounded-xl border border-white/[0.12] bg-black/45 shadow-lg shadow-black/40 backdrop-blur-md hover:border-white/[0.18] hover:bg-black/55 ${
        liked ? "border-rose-400/35 bg-rose-950/40" : ""
      }`
    : "rounded-full border-0 bg-transparent";

  return (
    <motion.button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Remove from saved" : "Save to your taste archive"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) {
          if (liked) {
            toggleLike(input);
          } else {
            openLikeGate(input);
          }
          return;
        }
        if (!liked) {
          getAnalyticsTracker().trackLike(pathname, input.productId, input.artistSlug, { surface: variant });
          getAnalyticsTracker().trackWishlistAdd(pathname, input.productId, input.artistSlug, { surface: variant });
        }
        toggleLike(input);
      }}
      className={`pointer-events-auto ${visibility} ${positionClass} flex min-h-10 min-w-10 items-center justify-center p-0 outline-none transition-[filter,opacity,transform,background-color,border-color] duration-200 hover:opacity-100 ${surfaceClass} ${
        isToolbar
          ? ""
          : liked
            ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] drop-shadow-[0_0_18px_rgba(251,113,133,0.55)]"
            : "drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
      } ${className}`}
      whileTap={
        reduceMotion
          ? undefined
          : { scale: 0.9, transition: { type: "spring", stiffness: 580, damping: 22 } }
      }
      animate={reduceMotion ? undefined : liked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={
        reduceMotion
          ? undefined
          : liked
            ? { duration: 0.4, times: [0, 0.36, 1], ease: [0.22, 1, 0.36, 1] }
            : { type: "spring", stiffness: 400, damping: 30 }
      }
    >
      <motion.span
        className="relative flex items-center justify-center"
        animate={reduceMotion ? undefined : liked ? { rotate: [0, -5, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeartGlyph filled={liked} uid={uid} />
      </motion.span>
    </motion.button>
  );
}
