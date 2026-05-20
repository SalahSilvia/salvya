"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/meta-pixel";
import { getOrCreateSessionId } from "@/lib/analytics/session";
import { TimeOnPageTracker } from "@/lib/analytics/time-on-page";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { captureUtmFromSearchParams } from "@/lib/analytics/utm";
import { shouldEnableAnalytics } from "@/lib/cookie-consent";
import { COOKIE_PREFERENCES_EVENT, loadCookiePreferences } from "@/lib/cookie-preferences";

const PAGE_VIEW_DEBOUNCE_MS = 320;
/** Slower in dev — avoids heartbeat pile-ups during HMR / many tabs. */
const HEARTBEAT_MS = process.env.NODE_ENV === "development" ? 120_000 : 45_000;

function SalvyaRouteAnalyticsInner() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeSeq = useRef(0);
  const [, setConsentTick] = useState(0);

  useEffect(() => {
    const bump = () => setConsentTick((n) => n + 1);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, bump);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, bump);
  }, []);

  useEffect(() => {
    const search = searchParams?.toString() ?? "";
    captureUtmFromSearchParams(search ? `?${search}` : "");

    const seq = ++routeSeq.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (seq !== routeSeq.current) return;
      void trackPageView();
      if (shouldEnableAnalytics(loadCookiePreferences())) {
        const page = pathname || "/";
        getAnalyticsTracker().trackPageView(page);
      }
    }, PAGE_VIEW_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      if (!shouldEnableAnalytics(loadCookiePreferences())) return;
      const sid = getOrCreateSessionId();
      if (!sid) return;
      void fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
        credentials: "same-origin",
        keepalive: true,
        signal: AbortSignal.timeout(15_000),
      }).catch(() => {});
    };

    tick();
    const id = window.setInterval(tick, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    const onPrefs = () => tick();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, onPrefs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, onPrefs);
    };
  }, []);

  if (!shouldEnableAnalytics(loadCookiePreferences())) return null;
  return <TimeOnPageTracker pathname={pathname} />;
}

/**
 * UTM persistence, debounced Meta `PageView`, first-party Salvya analytics (page views, heartbeat, time-on-page).
 * Wrapped in `Suspense` for `useSearchParams` (Next.js requirement).
 */
export function SalvyaAnalyticsRoot() {
  return (
    <Suspense fallback={null}>
      <SalvyaRouteAnalyticsInner />
    </Suspense>
  );
}
