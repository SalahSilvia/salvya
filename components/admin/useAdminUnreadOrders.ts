"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminUnreadOrders() {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders/unread-count", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; unread?: number };
      if (res.ok && data.ok) setUnread(typeof data.unread === "number" ? data.unread : 0);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 45_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("salvya-admin-orders-changed", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("salvya-admin-orders-changed", onFocus);
    };
  }, [refresh]);

  const markSeen = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders/mark-seen", { method: "POST", credentials: "include" });
      if (!res.ok) return;
      setUnread(0);
      window.dispatchEvent(new CustomEvent("salvya-admin-orders-changed"));
    } catch {
      /* ignore */
    }
  }, []);

  return { unread, refresh, markSeen };
}
