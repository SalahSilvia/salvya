"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SalvyaAccountSkeleton } from "@/components/skeleton";
import { MemberSignedShell } from "./MemberSignedShell";
import { useSupabaseUser } from "./useSupabaseUser";

type Props = {
  children: ReactNode;
  redirectingLabel?: string;
};

export function MemberRouteGate({ children, redirectingLabel = "Redirecting to sign in…" }: Props) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <SalvyaAccountSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#050508] px-6 text-[15px] text-white/55">
        {redirectingLabel}
      </div>
    );
  }

  return <MemberSignedShell>{children}</MemberSignedShell>;
}
