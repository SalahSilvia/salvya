"use client";

import { useEffect, useRef } from "react";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";

const MIN_MS = 2000;

/**
 * Sends `time_on_page` when the user leaves a route, hides the tab, or navigates away (SPA).
 */
export function TimeOnPageTracker({ pathname }: { pathname: string }) {
  const started = useRef<number>(Date.now());
  const pathRef = useRef(pathname);

  useEffect(() => {
    const prev = pathRef.current;
    if (prev !== pathname) {
      const ms = Date.now() - started.current;
      if (ms >= MIN_MS && prev) {
        getAnalyticsTracker().trackEvent("time_on_page", prev, {
          metadata: { duration_ms: ms, reason: "route_change" },
        });
      }
      pathRef.current = pathname;
      started.current = Date.now();
    }
  }, [pathname]);

  useEffect(() => {
    const flush = (reason: string) => {
      const page = pathRef.current;
      const ms = Date.now() - started.current;
      if (ms < MIN_MS) return;
      getAnalyticsTracker().trackEvent("time_on_page", page, {
        metadata: { duration_ms: ms, reason },
      });
      void getAnalyticsTracker().flush();
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") flush("visibility");
    };
    const onPageHide = () => flush("pagehide");

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
