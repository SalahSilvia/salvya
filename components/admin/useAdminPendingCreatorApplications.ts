"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminPendingCreatorApplications() {
  const [pending, setPending] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/creator-applications/pending-count", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as { ok?: boolean; pending?: number };
      if (res.ok && data.ok) setPending(typeof data.pending === "number" ? data.pending : 0);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 45_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("salvya-admin-creator-applications-changed", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("salvya-admin-creator-applications-changed", onFocus);
    };
  }, [refresh]);

  return { pending, refresh };
}
