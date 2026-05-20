"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MoreIcon } from "@/components/creator/more/CreatorMoreIcons";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

const QUICK = [
  { href: "/creator/dashboard", icon: "dashboard", label: "Dashboard", accent: "violet" as const },
  { href: "/creator/products", icon: "products", label: "Products", accent: "fuchsia" as const },
  { href: "/creator/links", icon: "links", label: "My links", accent: "emerald" as const },
  { href: "/creator/wallet", icon: "wallet", label: "Wallet", accent: "amber" as const },
];

const RING = {
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-200",
  fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-200",
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-200",
};

export function CreatorMoreQuickGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.4 }}
    >
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">Quick access</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {QUICK.map((item, i) => (
          <motion.div
            key={item.href}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
          >
            <Link
              href={item.href}
              className={`flex flex-col items-center gap-2 rounded-[1.15rem] px-3 py-4 text-center transition-shadow hover:shadow-[0_20px_50px_-24px_rgba(139,92,246,0.45)] ${creatorCardSurface}`}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-xl border ${RING[item.accent]}`}
              >
                <MoreIcon id={item.icon} />
              </span>
              <span className="text-[13px] font-semibold text-white/88">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
