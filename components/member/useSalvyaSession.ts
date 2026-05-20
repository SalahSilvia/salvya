"use client";

import { useCallback, useEffect, useState } from "react";
import type { SalvyaSessionPayload } from "@/lib/auth/session-payload";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";

export function useSalvyaSession() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [session, setSession] = useState<SalvyaSessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; user?: SalvyaSessionPayload; error?: string };
      if (!res.ok || !body.ok || !body.user) throw new Error(body.error ?? "session_failed");
      setSession(body.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "session_failed");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void reload();
  }, [authLoading, reload]);

  return {
    user,
    session,
    loading: authLoading || loading,
    error,
    reload,
  };
}
