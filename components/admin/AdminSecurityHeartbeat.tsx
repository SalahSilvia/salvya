"use client";

import { useEffect } from "react";
import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const INTERVAL_MS = 120_000;

/**
 * Periodic admin session re-validation. Signs out if role is no longer admin.
 */
export function AdminSecurityHeartbeat() {
  const { refresh, sessionExpired } = useAdminPreferences();

  useEffect(() => {
    if (!sessionExpired) return;
    void (async () => {
      const sb = getSupabaseBrowserClient();
      await sb?.auth.signOut();
      window.location.href = "/login?next=%2Fadmin";
    })();
  }, [sessionExpired]);

  useEffect(() => {
    const verify = () => void refresh();
    void verify();
    const id = window.setInterval(verify, INTERVAL_MS);
    const onFocus = verify;
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return null;
}
