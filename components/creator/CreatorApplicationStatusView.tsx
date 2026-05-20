"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CREATOR_DASHBOARD_PATH } from "@/lib/creator/apply-navigation";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";
import { SalvyaLoadingScreen } from "@/components/loading";
import { creatorCardSurface } from "@/lib/theme/creator-accent";

export function CreatorApplicationStatusView() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { session, loading } = useSalvyaSession();

  useEffect(() => {
    if (loading || !session) return;
    if (session.canAccessCreatorDashboard) {
      router.replace(CREATOR_DASHBOARD_PATH);
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <SalvyaLoadingScreen
        variant="creator"
        label="Application"
        description="Checking your creator application status…"
        layout="panel"
        className="min-h-[50vh] rounded-none bg-transparent"
      />
    );
  }

  const rejected = session?.creatorStatus === "rejected";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg px-4 py-14 sm:px-6"
    >
      <div className={`rounded-[1.5rem] p-8 text-center ${creatorCardSurface}`}>
        <div
          className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
            rejected ? "bg-rose-500/15 text-rose-200" : "bg-amber-500/15 text-amber-200"
          }`}
        >
          <span className="text-2xl" aria-hidden>
            {rejected ? "✕" : "◷"}
          </span>
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/75">
          {rejected ? "Not approved" : "Application pending"}
        </p>
        <h1 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-white">
          {rejected ? "We could not approve this application" : "We are reviewing your application"}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          {rejected
            ? "You can submit a new application with updated details, or contact support if you believe this was a mistake."
            : "Our team is reviewing your creator profile. Estimated review time is 2–4 business days. You can keep shopping while you wait."}
        </p>
        {!rejected ? (
          <p className="mt-3 text-[13px] text-white/40">We will email you when your creator studio is ready.</p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {rejected ? (
            <Link
              href="/creator/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 px-5 text-[14px] font-semibold text-white"
            >
              Apply again
            </Link>
          ) : null}
          <Link
            href="/menu"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-[14px] font-semibold text-white/80 hover:bg-white/5"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
