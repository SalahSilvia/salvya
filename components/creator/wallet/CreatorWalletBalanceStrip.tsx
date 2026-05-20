"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

type Props = {
  availableMinor: number;
  currency: string;
  loading?: boolean;
};

/** Apple Wallet–style balance row under the pass card. */
export function CreatorWalletBalanceStrip({ availableMinor, currency, loading }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`rounded-2xl px-5 py-4 ${creatorCardSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.4 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-white/45">Available to withdraw</p>
          <p className="mt-1 text-[clamp(1.75rem,5vw,2.25rem)] font-semibold tabular-nums tracking-tight text-white">
            {loading ? "…" : formatCreatorMoney(availableMinor, currency)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 ring-1 ring-emerald-400/25">
          <span className="text-[11px] font-bold tracking-wide" aria-hidden>
            DH
          </span>
        </div>
      </div>
    </motion.div>
  );
}
