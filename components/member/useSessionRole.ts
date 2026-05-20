"use client";

import { useEffect, useState } from "react";
import type { SalvyaRole } from "@/lib/auth/roles";

/** Client-side DB role for navigation chrome (refreshes on mount). */
export function useSessionRole(): SalvyaRole | null {
  const [role, setRole] = useState<SalvyaRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { ok?: boolean; user?: { role?: SalvyaRole } };
        if (!cancelled && data.ok && data.user?.role) setRole(data.user.role);
      } catch {
        /* guest */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return role;
}
