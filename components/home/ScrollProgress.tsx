"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Spotify-style thin progress along the top of the feed */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.15 });

  return (
    <div
      className="pointer-events-none fixed top-[calc(env(safe-area-inset-top)+3.5rem)] right-0 left-0 z-[61] h-[2px] bg-white/[0.06]"
      aria-hidden
    >
      <motion.div
        style={{ scaleX: smooth, transformOrigin: "0% 50%" }}
        className="h-full w-full bg-gradient-to-r from-[#2D6BFF] via-[#5b8fff] to-[#2D6BFF] shadow-[0_0_12px_rgba(45,107,255,0.45)]"
      />
    </div>
  );
}
