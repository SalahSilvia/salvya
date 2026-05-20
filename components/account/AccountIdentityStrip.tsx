"use client";

import Link from "next/link";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";

export function AccountIdentityStrip() {
  const { user, session, loading } = useSalvyaSession();

  if (loading) return null;
  if (!user || !session) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Signed in as</p>
          <p className="mt-1 text-[15px] font-semibold text-white/92">{session.displayName || session.email}</p>
          <p className="mt-0.5 text-[13px] text-white/45">
            {session.roleLabel}
            {session.creatorStatus !== "none" ? ` · ${session.creatorStatusLabel}` : ""}
            {session.email ? ` · ${session.email}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap justify-end gap-2">
            {session.isAdminCapable ? (
              <Link
                href={session.isGodAdmin ? "/admin/god" : "/admin"}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#2D6BFF]/35 bg-[#2D6BFF]/15 px-4 text-[13px] font-semibold text-[#b8c9ff] transition-colors hover:bg-[#2D6BFF]/22"
              >
                Admin workspace
              </Link>
            ) : null}
            {session.canAccessCreatorDashboard ? (
              <Link
                href="/creator/dashboard"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 text-[13px] font-semibold text-violet-100/90 hover:bg-violet-500/15"
              >
                Creator dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
