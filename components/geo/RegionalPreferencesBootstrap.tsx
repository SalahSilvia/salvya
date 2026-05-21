"use client";

import { useEffect, useRef } from "react";
import { COOKIE_GEO_LOCKED } from "@/lib/geo/constants";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";

const MIN_SYNC_INTERVAL_MS = 30_000;

/**
 * Resolves shopper country via /api/geo/detect (edge + IP + device signals).
 * Throttled on tab focus to avoid mobile ISP flip-flop rerenders.
 */
export function RegionalPreferencesBootstrap() {
  const { syncGeoDetection } = useRegionalPreferences();
  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const runSync = async () => {
      if (typeof document !== "undefined") {
        const locked = document.cookie.match(
          new RegExp(`(?:^|; )${COOKIE_GEO_LOCKED.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=1`),
        );
        if (locked) return;
      }
      if (syncingRef.current) return;
      const now = Date.now();
      if (mountedRef.current && now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) {
        return;
      }
      syncingRef.current = true;
      lastSyncRef.current = now;
      mountedRef.current = true;
      try {
        await syncGeoDetection();
      } finally {
        syncingRef.current = false;
      }
    };

    void runSync();

    const onVisible = () => {
      if (document.visibilityState === "visible") void runSync();
    };

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [syncGeoDetection]);

  return null;
}
