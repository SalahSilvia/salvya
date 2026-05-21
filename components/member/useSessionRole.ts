"use client";

import { useEffect, useState } from "react";
import type { SalvyaRole } from "@/lib/auth/roles";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";

/** Client-side DB role for navigation chrome (only probes API when a Supabase session exists). */
export function useSessionRole(): SalvyaRole | null {
  const { user, loading: authLoading } = useSupabaseUser();
  const [role, setRole] = useState<SalvyaRole | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { ok?: boolean; user?: { role?: SalvyaRole } | null };
        if (!cancelled && data.ok && data.user?.role) setRole(data.user.role);
      } catch {
        if (!cancelled) setRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return role;
}
