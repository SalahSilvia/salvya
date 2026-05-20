"use client";

import { useCallback, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SalvyaRole } from "@/lib/auth/roles";
import { roleSatisfies } from "@/lib/auth/roles";

type Props = {
  allowedRoles: readonly SalvyaRole[];
  /** Where to send the user after forced sign-out (privilege mismatch). */
  redirectTo?: string;
};

/**
 * Re-validates role from the server on focus. Signs out if the session no longer
 * matches the protected surface (stale session / escalation guard).
 */
export function RoleMismatchGuard({ allowedRoles, redirectTo = "/login" }: Props) {
  const verify = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        await supabase.auth.signOut();
        window.location.href = redirectTo;
        return;
      }
      if (!res.ok) return;

      const body = (await res.json()) as { ok?: boolean; role?: SalvyaRole; user?: { role?: SalvyaRole } };
      const role = body.user?.role ?? body.role;
      if (!body.ok || !role || !roleSatisfies(role, allowedRoles)) {
        await supabase.auth.signOut();
        window.location.href = redirectTo;
      }
    } catch {
      /* network blip — keep session */
    }
  }, [allowedRoles, redirectTo]);

  useEffect(() => {
    void verify();
    const onFocus = () => void verify();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [verify]);

  return null;
}
