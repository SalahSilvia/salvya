"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/creator/phase6-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { creatorCardSurface } from "@/lib/theme/creator-accent";
import { SalvyaInlineLoader } from "@/components/loading";

type LeaderboardPayload = {
  weekKey: string;
  entries: LeaderboardEntry[];
};

type YouContext = {
  weekKey: string;
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
};

export function CreatorLeaderboardExperience() {
  const reduceMotion = useReducedMotion();
  const [board, setBoard] = useState<LeaderboardPayload | null>(null);
  const [you, setYou] = useState<YouContext | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/creator/leaderboard", {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        leaderboard?: LeaderboardPayload;
        you?: YouContext;
      };
      if (body.ok && body.leaderboard) {
        setBoard(body.leaderboard);
        setYou(body.you ?? null);
      }
    } catch {
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div className="space-y-8" {...fade} transition={{ duration: 0.4 }}>
      <header>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-[14px] text-white/45">
          Weekly creator rankings by growth score, virality, and conversion. Resets each ISO week.
        </p>
        {board?.weekKey ? (
          <p className="mt-1 text-[12px] text-white/35">Week {board.weekKey}</p>
        ) : null}
      </header>

      {you?.myEntry ? (
        <motion.section className={`rounded-2xl p-5 ${creatorCardSurface}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-fuchsia-200/60">Your standing</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {you.myRank ? `#${you.myRank}` : "Unranked"} · {you.myEntry.rankTier} · score {you.myEntry.growthScore}
          </p>
        </motion.section>
      ) : null}

      <motion.section className={`overflow-hidden rounded-2xl ${creatorCardSurface}`}>
        {loading ? (
          <SalvyaInlineLoader message="Loading leaderboard" variant="creator" />
        ) : !board?.entries.length ? (
          <p className="px-4 py-12 text-center text-[13px] text-white/45">
            Leaderboard populates after the growth cron runs.
          </p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-white/40">
                <th className="px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">Creator</th>
                <th className="px-4 py-2 font-semibold">Growth</th>
                <th className="px-4 py-2 font-semibold">Viral</th>
                <th className="px-4 py-2 font-semibold">Revenue</th>
                <th className="px-4 py-2 font-semibold">Badges</th>
              </tr>
            </thead>
            <tbody>
              {board.entries.map((row) => (
                <tr key={row.creatorId} className="border-t border-white/[0.06]">
                  <td className="px-4 py-2.5 tabular-nums font-semibold text-white/70">{row.rank}</td>
                  <td className="px-4 py-2.5 font-medium text-white/90">{row.displayName}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.growthScore}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.viralScore}</td>
                  <td className="px-4 py-2.5 tabular-nums text-emerald-200/80">
                    {formatCreatorMoney(row.revenueMinor, "EUR")}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-violet-200/80">
                    {row.badges.join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.section>

      <Link href="/creator/dashboard" className="inline-flex text-[13px] font-semibold text-fuchsia-300/90">
        ← Back to dashboard
      </Link>
    </motion.div>
  );
}
