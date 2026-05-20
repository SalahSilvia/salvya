"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

/**
 * Light auth shell — pairs with {@link AuthTopBar} `variant="day"`.
 * Matches storefront / help center daylight aesthetic.
 */
export function AuthDaylight({ children }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#f4f6fb] text-neutral-950 antialiased selection:bg-blue-500/20">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_-10%,rgba(59,130,246,0.14),transparent_50%),radial-gradient(90%_70%_at_100%_0%,rgba(14,165,233,0.1),transparent_45%),radial-gradient(80%_55%_at_50%_100%,rgba(99,102,241,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:radial-gradient(ellipse_90%_70%_at_50%_20%,black,transparent)]" />

        {!reduceMotion ? (
          <>
            <motion.div
              className="absolute -left-[12%] top-[18%] h-[min(28rem,90vw)] w-[min(28rem,90vw)] rounded-full bg-blue-400/15 blur-[100px]"
              animate={{ x: [0, 16, 0], y: [0, 12, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-[10%] top-[38%] h-[min(24rem,85vw)] w-[min(24rem,85vw)] rounded-full bg-sky-400/12 blur-[90px]"
              animate={{ x: [0, -14, 0], y: [0, -16, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </>
        ) : (
          <>
            <div className="absolute -left-[12%] top-[18%] h-[min(28rem,90vw)] w-[min(28rem,90vw)] rounded-full bg-blue-400/12 blur-[100px]" />
            <div className="absolute -right-[10%] top-[38%] h-[min(24rem,85vw)] w-[min(24rem,85vw)] rounded-full bg-sky-400/10 blur-[90px]" />
          </>
        )}
      </div>

      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
