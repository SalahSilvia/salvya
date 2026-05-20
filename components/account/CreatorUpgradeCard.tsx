"use client";

import Link from "next/link";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";
import { CREATOR_APPLICATION_STATUS_PATH } from "@/lib/creator/apply-navigation";
import { creatorCardMuted, creatorCtaButton } from "@/lib/theme/creator-accent";

export function CreatorUpgradeCard() {
  const { session, loading } = useSalvyaSession();

  if (loading || !session) return null;

  if (session.canAccessCreatorDashboard) {
    return (
      <div className={`rounded-2xl border p-5 ${creatorCardMuted}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/70">Creator mode</p>
        <p className="mt-2 text-[15px] font-semibold text-white/92">You have creator tools on this account</p>
        <p className="mt-1 text-[14px] leading-relaxed text-white/48">
          Switch to Creator mode for dashboard, promo codes, and program tools — shopping stays on the same login.
        </p>
        <Link
          href="/creator/dashboard"
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-500/15 px-4 text-[13px] font-semibold text-violet-100/95 hover:bg-violet-500/22"
        >
          Open creator dashboard →
        </Link>
      </div>
    );
  }

  if (session.creatorStatus === "pending") {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/80">Creator application</p>
        <p className="mt-2 text-[15px] font-semibold text-white/92">Under review</p>
        <p className="mt-1 text-[14px] leading-relaxed text-white/48">
          We will email you when an admin approves your application. You can keep shopping as usual.
        </p>
        <Link
          href={CREATOR_APPLICATION_STATUS_PATH}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-amber-400/30 px-4 text-[13px] font-semibold text-amber-100/95 hover:bg-amber-500/15"
        >
          View application status →
        </Link>
      </div>
    );
  }

  if (!session.canApplyAsCreator) return null;

  return (
    <div className={`rounded-2xl border p-5 ${creatorCardMuted}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/70">Grow with Salvya</p>
      <p className="mt-2 text-[15px] font-semibold text-white/92">Become a creator</p>
      <p className="mt-1 text-[14px] leading-relaxed text-white/48">
        Use the same account — apply once, get approved, and unlock the creator dashboard without a new login.
      </p>
      <Link
        href="/creator/apply"
        className={`mt-4 inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[13px] font-semibold text-white ${creatorCtaButton}`}
      >
        Start creator onboarding →
      </Link>
    </div>
  );
}
