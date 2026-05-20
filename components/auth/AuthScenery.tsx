"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export function AuthScenery({ children }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#06060c] text-zinc-100 antialiased selection:bg-violet-500/25 selection:text-white">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 20% -10%, rgba(99, 102, 241, 0.35), transparent 50%), radial-gradient(ellipse 100% 70% at 100% 0%, rgba(45, 107, 255, 0.28), transparent 45%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(236, 72, 153, 0.12), transparent 55%), #06060c",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.65] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,black_20%,transparent_75%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030305]/90" />

        {!reduceMotion ? (
          <>
            <motion.div
              className="absolute -left-[10%] top-[15%] h-[min(32rem,100vw)] w-[min(32rem,100vw)] rounded-full bg-indigo-500/20 blur-[120px]"
              animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-[8%] top-[40%] h-[min(28rem,90vw)] w-[min(28rem,90vw)] rounded-full bg-fuchsia-500/15 blur-[100px]"
              animate={{ x: [0, -18, 0], y: [0, -22, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute bottom-[-5%] left-[25%] h-[min(24rem,80vw)] w-[min(24rem,80vw)] rounded-full bg-cyan-400/10 blur-[90px]"
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </>
        ) : (
          <>
            <div className="absolute -left-[10%] top-[15%] h-[min(32rem,100vw)] w-[min(32rem,100vw)] rounded-full bg-indigo-500/18 blur-[120px]" />
            <div className="absolute -right-[8%] top-[40%] h-[min(28rem,90vw)] w-[min(28rem,90vw)] rounded-full bg-fuchsia-500/12 blur-[100px]" />
          </>
        )}
      </div>

      <div className="grain-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.035]" aria-hidden />

      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
