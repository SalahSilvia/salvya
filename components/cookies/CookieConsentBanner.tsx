"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  acceptAllCookies,
  dismissCookieBannerImplicit,
  hasConsentDecision,
} from "@/lib/cookie-consent";
import {
  COOKIE_PREFERENCES_EVENT,
  loadCookiePreferences,
} from "@/lib/cookie-preferences";

const AUTO_DISMISS_MS = 7500;

function shouldHideOnRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  );
}

export function CookieConsentBanner() {
  const pathname = usePathname() ?? "";
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const syncVisibility = useCallback(() => {
    if (shouldHideOnRoute(pathname)) {
      setVisible(false);
      return;
    }
    setVisible(!hasConsentDecision(loadCookiePreferences()));
  }, [pathname]);

  useEffect(() => {
    setHydrated(true);
    syncVisibility();
  }, [syncVisibility]);

  useEffect(() => {
    const onUpdate = () => syncVisibility();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, onUpdate);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, onUpdate);
  }, [syncVisibility]);

  useEffect(() => {
    if (!hydrated || !visible) return;
    const timer = window.setTimeout(() => {
      dismissCookieBannerImplicit();
      setVisible(false);
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, visible]);

  const onAccept = useCallback(() => {
    acceptAllCookies("banner_accept");
    setVisible(false);
  }, []);

  const onDismiss = useCallback(() => {
    dismissCookieBannerImplicit();
    setVisible(false);
  }, []);

  if (!hydrated || shouldHideOnRoute(pathname)) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Cookie notice"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(0.85rem,env(safe-area-inset-bottom))] z-[200] flex justify-center px-3"
        >
          <motion.div
            className="pointer-events-auto flex w-full max-w-[min(100%,22.5rem)] flex-col gap-3 rounded-2xl border border-white/[0.12] bg-[#0a0a10]/92 p-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl backdrop-saturate-150 sm:max-w-md sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            layout
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug text-white/92">Cookies on Salvya</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/48">
                We use essential cookies plus optional analytics.{" "}
                <Link href="/cookies" className="font-medium text-[#8fa8e8] underline-offset-2 hover:underline">
                  Policy
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/cookies/settings"
                className="inline-flex min-h-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex min-h-9 items-center justify-center rounded-xl bg-[#2D6BFF] px-3.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(45,107,255,0.65)] transition-transform active:scale-[0.98]"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                aria-label="Dismiss cookie notice"
              >
                <span aria-hidden className="text-[18px] leading-none">
                  ×
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
