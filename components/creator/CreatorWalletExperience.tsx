"use client";

import { SalvyaInlineLoader } from "@/components/loading";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CreatorStudioKpi } from "@/components/creator/CreatorStudioKpi";
import { CreatorPassCard } from "@/components/creator/wallet/CreatorPassCard";
import { CreatorCommissionProfileStrip } from "@/components/creator/wallet/CreatorCommissionProfileStrip";
import { CreatorWalletBalanceStrip } from "@/components/creator/wallet/CreatorWalletBalanceStrip";
import { CreatorLiveBadge, CreatorMeshBackground } from "@/components/creator/dashboard/CreatorDashboardVisuals";
import type { CreatorWalletPayload } from "@/lib/creator/monetization-types";
import { formatCreatorMoney } from "@/lib/creator/format-earnings";
import { creatorCardSurface, creatorCtaButton, creatorCtaGhost, creatorEyebrow, creatorHeroSurface } from "@/lib/theme/creator-accent";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";

type ProfilePayload = {
  creator_code?: string;
  created_at?: string;
};

type ApplicationPayload = {
  full_name?: string;
};

export function CreatorWalletExperience() {
  const reduceMotion = useReducedMotion();
  const { session, loading: sessionLoading } = useSalvyaSession();
  const [wallet, setWallet] = useState<CreatorWalletPayload | null>(null);
  const [creatorCode, setCreatorCode] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Creator");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [walletRes, appRes] = await Promise.all([
        fetch("/api/creator/wallet", { credentials: "include", cache: "no-store" }),
        fetch("/api/creator/application", { credentials: "include", cache: "no-store" }),
      ]);
      const body = (await walletRes.json()) as { ok?: boolean; wallet?: CreatorWalletPayload; error?: string };
      const appBody = (await appRes.json()) as {
        profile?: ProfilePayload | null;
        application?: ApplicationPayload | null;
      };

      if (body.ok && body.wallet) {
        setWallet(body.wallet);
        setError(null);
      } else {
        setError(body.error ?? "Could not load wallet");
      }

      setCreatorCode(appBody.profile?.creator_code ?? null);
      setMemberSince(appBody.profile?.created_at ?? null);
      const appName = appBody.application?.full_name?.trim();
      if (appName) setDisplayName(appName);
    } catch {
      setError("Could not load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (session?.displayName) setDisplayName(session.displayName);
  }, [session?.displayName]);

  const balances = wallet?.balances;
  const currency = balances?.currency ?? "EUR";
  const minPayout = wallet?.minPayoutMinor ?? 1000;
  const canRequest =
    !loading &&
    (balances?.availableMinor ?? 0) >= minPayout &&
    !(wallet?.payoutRequests ?? []).some((r) => r.status === "pending");

  async function requestPayout() {
    setRequesting(true);
    setRequestMsg(null);
    try {
      const res = await fetch("/api/creator/payout-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (body.ok) {
        setRequestMsg("Payout request submitted for manual approval.");
        await load();
      } else {
        setRequestMsg(body.error ?? "Request failed");
      }
    } catch {
      setRequestMsg("Request failed");
    } finally {
      setRequesting(false);
    }
  }

  const fade = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } };
  const profileLoading = loading || sessionLoading;

  return (
    <motion.div className="space-y-8 pb-8" {...fade} transition={{ duration: 0.35 }}>
      <motion.header
        className={`rounded-[1.65rem] ${creatorHeroSurface}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-[1.6rem] bg-[#08050e]/95 px-6 py-5 sm:px-8 sm:py-6">
          <CreatorMeshBackground />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className={creatorEyebrow}>Wallet</p>
                <CreatorLiveBadge />
              </div>
              <h1 className="mt-2 text-[clamp(1.5rem,3.5vw,2rem)] font-semibold tracking-tight text-white">
                Earnings & payouts
              </h1>
              <p className="mt-2 max-w-lg text-[14px] text-white/45">
                Your creator pass, balance, and payout history — styled like a digital wallet.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/creator/dashboard"
                className={`inline-flex min-h-10 items-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
              >
                Dashboard
              </Link>
              <Link
                href="/creator/links"
                className={`inline-flex min-h-10 items-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
              >
                My links
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">{error}</p>
      ) : null}

      <section className="space-y-5">
        <CreatorPassCard
          displayName={displayName}
          creatorCode={creatorCode}
          memberSince={memberSince}
          loading={profileLoading}
        />
        <CreatorWalletBalanceStrip
          availableMinor={balances?.availableMinor ?? 0}
          currency={currency}
          loading={loading}
        />
      </section>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
      >
        <CreatorStudioKpi
          label="Available balance"
          value={loading ? "…" : formatCreatorMoney(balances?.availableMinor ?? 0, currency)}
          hint="Fraud-valid, ready for payout"
          accent="emerald"
        />
        <CreatorStudioKpi
          label="Pending clearance"
          value={loading ? "…" : formatCreatorMoney(balances?.clearancePendingMinor ?? 0, currency)}
          hint="Paid orders in refund window"
          accent="amber"
        />
        <CreatorStudioKpi
          label="Pending payment"
          value={loading ? "…" : formatCreatorMoney(balances?.pendingMinor ?? 0, currency)}
          hint="Awaiting payment confirmation"
          accent="violet"
        />
        <CreatorStudioKpi
          label="Lifetime earnings"
          value={loading ? "…" : formatCreatorMoney(balances?.lifetimeEarningsMinor ?? 0, currency)}
          hint={
            balances?.pendingLockMinor
              ? `${formatCreatorMoney(balances.pendingLockMinor, currency)} locked for payout`
              : "All-time commissions"
          }
          accent="fuchsia"
        />
      </motion.div>

      <motion.section
        className={`rounded-2xl p-6 ${creatorCardSurface}`}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <h2 className="text-lg font-semibold">Request payout</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          Withdrawals debit your available balance after manual approval. Minimum{" "}
          {formatCreatorMoney(minPayout, currency)}. Commissions are fixed per item sold in DH (MAD), based on your
          follower band.
        </p>
        {wallet?.scheduledPayoutDate ? (
          <p className="mt-2 text-[12px] text-white/40">
            Next eligibility check: {new Date(wallet.scheduledPayoutDate).toLocaleString()}
          </p>
        ) : null}
        {requestMsg ? <p className="mt-3 text-[13px] text-fuchsia-200/90">{requestMsg}</p> : null}
        <button
          type="button"
          disabled={!canRequest || requesting}
          onClick={() => void requestPayout()}
          className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-[14px] font-semibold text-white ${creatorCtaButton} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {requesting ? "Submitting…" : "Request payout"}
        </button>
      </motion.section>

      <CreatorCommissionProfileStrip profile={wallet?.commissionProfile ?? null} loading={loading} />

      <motion.section
        className={`overflow-hidden rounded-2xl ${creatorCardSurface}`}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
      >
        <div className="border-b border-white/[0.08] px-4 py-3">
          <h2 className="text-sm font-semibold">Payout history</h2>
        </div>
        {loading ? (
          <SalvyaInlineLoader message="Loading payout history" variant="creator" />
        ) : !wallet?.payouts.length && !wallet?.payoutRequests?.length ? (
          <p className="px-4 py-10 text-center text-[13px] text-white/45">No payouts yet.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {(wallet?.payoutRequests ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="text-white/70">
                  Request · {new Date(p.createdAt).toLocaleDateString()} · {p.status}
                </span>
                <span className="font-semibold tabular-nums text-amber-200/90">
                  {formatCreatorMoney(p.amountMinor, p.currency)}
                </span>
              </li>
            ))}
            {wallet?.payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="text-white/70">{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="font-semibold tabular-nums text-emerald-200/90">
                  {formatCreatorMoney(p.amountMinor, p.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <div className="flex flex-wrap gap-3">
        <a
          href="/api/creator/export-data"
          className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
        >
          Export my data (JSON)
        </a>
        <a
          href="/api/creator/export-data?format=csv"
          className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${creatorCtaGhost}`}
        >
          Export CSV
        </a>
      </div>
    </motion.div>
  );
}
