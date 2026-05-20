"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";

export function useActiveOrderCount(): number {
  const { user } = useSupabaseUser();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch("/api/account/orders/active-count", {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as { ok?: boolean; count?: number };
      if (res.ok && body.ok && typeof body.count === "number") {
        setCount(body.count);
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, refresh]);

  return count;
}
