"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CreatorCommissionRulesTable } from "@/components/creator/CreatorCommissionRulesTable";
import type { CreatorWalletCommissionProfile } from "@/lib/creator/monetization-types";
import { formatDhAmount, formatFollowersCount } from "@/lib/creator/follower-commission";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

type Props = {
  profile: CreatorWalletCommissionProfile | null;
  loading?: boolean;
};

export function CreatorCommissionProfileStrip({ profile, loading }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`overflow-hidden rounded-2xl ${creatorCardSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04, duration: 0.4 }}
    >
      <div className="border-b border-fuchsia-400/15 bg-gradient-to-r from-violet-500/12 via-fuchsia-500/10 to-transparent px-5 py-5 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/70">Your commission rate</p>
        {loading ? (
          <p className="mt-3 text-[15px] text-white/45">Loading programme details…</p>
        ) : profile ? (
          <>
            <p className="mt-3 text-[clamp(1.15rem,3.2vw,1.65rem)] font-semibold leading-snug tracking-tight text-white">
              You have{" "}
              <span className="text-fuchsia-200">{formatFollowersCount(profile.followersCount)} followers</span>
            </p>
            <p className="mt-2 text-[clamp(1.35rem,3.8vw,2rem)] font-bold leading-tight text-white">
              You earn{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                {formatDhAmount(profile.perItemDh)}
              </span>{" "}
              per item sold
            </p>
            <p className="mt-2 text-[13px] text-white/42">Band: {profile.tierLabel} · based on your application</p>
          </>
        ) : (
          <p className="mt-3 text-[14px] text-white/45">Commission band unavailable — complete your creator application.</p>
        )}
      </div>
      <div className="px-5 py-4 sm:px-6">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-white/35">All follower bands</p>
        <CreatorCommissionRulesTable />
      </div>
    </motion.section>
  );
}
