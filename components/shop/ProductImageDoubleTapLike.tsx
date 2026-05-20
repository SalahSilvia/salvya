"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLikes } from "@/components/likes/LikesProvider";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import type { LikedItemInput } from "@/lib/member/likes-storage";

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

type ParticleSpec = {
  id: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
  rotate: number;
  scale: number;
};

type Burst = {
  id: number;
  x: number;
  y: number;
  particles: ParticleSpec[];
};

function FilledHeart({ size, className }: { size: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const grad = `dbltap-${uid}`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ filter: "drop-shadow(0 2px 10px rgba(225,29,72,0.45))" }}
    >
      <defs>
        <linearGradient id={grad} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe4e6" />
          <stop offset="0.35" stopColor="#fb7185" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <path d={HEART_PATH} fill={`url(#${grad})`} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
    </svg>
  );
}

function makeBurst(x: number, y: number): Burst {
  const particles: ParticleSpec[] = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 72,
    dy: -(48 + Math.random() * 40),
    delay: i * 0.045,
    size: 9 + Math.random() * 11,
    rotate: (Math.random() - 0.5) * 40,
    scale: 0.85 + Math.random() * 0.25,
  }));
  return { id: Date.now() + Math.random(), x, y, particles };
}

type Props = {
  input: LikedItemInput;
  children: ReactNode;
};

export function ProductImageDoubleTapLike({ input, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const { isLiked, toggleLike } = useLikes();
  const liked = isLiked(input.productId);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const onDoubleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!liked) {
        toggleLike(input);
        getAnalyticsTracker().trackLike(pathname, input.productId, input.artistSlug, { surface: "double_tap" });
        getAnalyticsTracker().trackWishlistAdd(pathname, input.productId, input.artistSlug, { surface: "double_tap" });
      }

      if (reduceMotion) return;

      const burst = makeBurst(x, y);
      setBursts((prev) => [...prev, burst]);
      window.setTimeout(() => removeBurst(burst.id), 1100);
    },
    [input, liked, reduceMotion, removeBurst, toggleLike, pathname],
  );

  return (
    <div ref={rootRef} className="relative select-none">
      {children}
      <div
        className="absolute inset-0 z-[15] touch-manipulation"
        onDoubleClick={onDoubleClick}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-[25] overflow-hidden" aria-hidden>
        <AnimatePresence>
          {bursts.map((burst) => (
            <motion.div
              key={burst.id}
              className="absolute"
              style={{ left: burst.x, top: burst.y }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="-translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.3, 1.05], opacity: [0, 1, 0] }}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              >
                <FilledHeart size={76} />
              </motion.div>

              {burst.particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
                  initial={{ x: 0, y: 0, opacity: 0.95, scale: 0.4, rotate: 0 }}
                  animate={{
                    x: p.dx,
                    y: p.dy,
                    opacity: 0,
                    scale: p.scale,
                    rotate: p.rotate,
                  }}
                  transition={{
                    duration: 0.85,
                    delay: p.delay,
                    ease: [0.22, 0.8, 0.36, 1],
                  }}
                >
                  <FilledHeart size={p.size} className="opacity-90" />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
