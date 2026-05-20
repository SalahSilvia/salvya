"use client";

import { useEffect } from "react";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";

/**
 * Resolves shopper country via /api/geo/detect (edge headers + IP lookup).
 * Re-runs when the tab regains focus so VPN / travel updates are picked up.
 */
export function RegionalPreferencesBootstrap() {
  const { syncGeoDetection } = useRegionalPreferences();

  useEffect(() => {
    void syncGeoDetection();

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncGeoDetection();
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
