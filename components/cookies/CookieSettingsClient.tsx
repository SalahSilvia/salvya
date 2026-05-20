"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import {
  acceptAllCookies,
  essentialOnlyCookies,
  shouldEnableAnalytics,
  shouldEnableFunctional,
  shouldEnableMarketing,
} from "@/lib/cookie-consent";
import {
  COOKIE_PREFERENCES_EVENT,
  clearCookiePreferences,
  defaultCookiePreferences,
  loadCookiePreferences,
  saveCookiePreferences,
} from "@/lib/cookie-preferences";
import {
  clearRegionalPreferenceCookies,
  dispatchRegionalPreferencesUpdated,
} from "@/lib/geo/preferences";

function ToggleRow({
  id,
  title,
  description,
  checked,
  disabled,
  activeLabel,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  activeLabel?: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold text-white/92">{title}</p>
          {activeLabel ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                checked ? "bg-emerald-500/15 text-emerald-200/90" : "bg-white/[0.06] text-white/35"
              }`}
            >
              {activeLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/42">{description}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 h-9 w-[3.25rem] shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] ${
          disabled ? "cursor-not-allowed bg-white/[0.08]" : checked ? "bg-[#2D6BFF]" : "bg-white/[0.14] hover:bg-white/[0.2]"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[1.35rem]" : "translate-x-0"
          }`}
          aria-hidden
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export function CookieSettingsClient() {
  const router = useRouter();
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [consentSource, setConsentSource] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const hydrateFromStorage = useCallback(() => {
    const stored = loadCookiePreferences();
    if (stored) {
      setFunctional(stored.functional);
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      setSavedAt(stored.savedAt);
      setConsentSource(stored.consentSource ?? null);
    } else {
      const d = defaultCookiePreferences();
      setFunctional(d.functional);
      setAnalytics(d.analytics);
      setMarketing(d.marketing);
      setSavedAt(null);
      setConsentSource(null);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
    setHydrated(true);
    const onUpdate = () => hydrateFromStorage();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, onUpdate);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, onUpdate);
  }, [hydrateFromStorage]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  const persist = useCallback(
    (
      f: boolean,
      a: boolean,
      m: boolean,
      message: string,
      source: "settings_accept_all" | "settings_essential" | "settings_custom",
    ) => {
      const next = saveCookiePreferences(
        { functional: f, analytics: a, marketing: m },
        { consentSource: source },
      );
      setFunctional(next.functional);
      setAnalytics(next.analytics);
      setMarketing(next.marketing);
      setSavedAt(next.savedAt);
      setConsentSource(next.consentSource ?? null);
      flash(message);
      router.refresh();
    },
    [flash, router],
  );

  const liveStatus = useMemo(() => {
    const prefs = loadCookiePreferences();
    return {
      analytics: shouldEnableAnalytics(prefs),
      marketing: shouldEnableMarketing(prefs),
      functional: shouldEnableFunctional(prefs),
    };
  }, [functional, analytics, marketing, savedAt, consentSource]);

  const onSave = useCallback(() => {
    persist(functional, analytics, marketing, "Your cookie choices are active on this device.", "settings_custom");
  }, [functional, analytics, marketing, persist]);

  const onAcceptAll = useCallback(() => {
    const next = acceptAllCookies("settings_accept_all");
    setFunctional(next.functional);
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setSavedAt(next.savedAt);
    setConsentSource(next.consentSource ?? null);
    dispatchRegionalPreferencesUpdated();
    flash("All optional cookies are enabled on this device.");
    router.refresh();
  }, [flash, router]);

  const onEssentialOnly = useCallback(() => {
    const next = essentialOnlyCookies("settings_essential");
    setFunctional(next.functional);
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setSavedAt(next.savedAt);
    setConsentSource(next.consentSource ?? null);
    flash("Only essential cookies remain active. Analytics and marketing are off.");
    router.refresh();
  }, [flash, router]);

  const onReset = useCallback(() => {
    clearCookiePreferences();
    clearRegionalPreferenceCookies();
    dispatchRegionalPreferencesUpdated();
    hydrateFromStorage();
    flash("Choices cleared. Region and prices will detect again from your location.");
    router.refresh();
  }, [flash, hydrateFromStorage, router]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[18%] top-[8%] h-[min(20rem,80vw)] w-[min(20rem,80vw)] rounded-full bg-[#2D6BFF]/12 blur-[88px]" />
        <div className="absolute -right-[14%] bottom-[18%] h-[min(16rem,65vw)] w-[min(16rem,65vw)] rounded-full bg-violet-600/10 blur-[76px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/78 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <AccountBackButton fallbackHref="/" />
          <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
            Cookies
          </span>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-xl space-y-8 px-[max(1rem,env(safe-area-inset-left))] pb-28 pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Privacy</p>
          <h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[1.85rem]">
            Cookie settings
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/48">
            Control what runs in this browser. Choices apply immediately to Salvya analytics and marketing pixels.{" "}
            <Link href="/cookies" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
              Read the policy
            </Link>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-[#2D6BFF]/20 bg-gradient-to-br from-[#2D6BFF]/10 via-white/[0.03] to-transparent p-4 sm:p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">Live on this device</p>
          <ul className="mt-3 space-y-2 text-[13px] text-white/70">
            <li className="flex items-center justify-between gap-3">
              <span>First-party analytics</span>
              <span className={liveStatus.analytics ? "font-semibold text-emerald-300/90" : "text-white/35"}>
                {liveStatus.analytics ? "Active" : "Paused"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span>Marketing pixels</span>
              <span className={liveStatus.marketing ? "font-semibold text-emerald-300/90" : "text-white/35"}>
                {liveStatus.marketing ? "Active" : "Paused"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span>Functional extras</span>
              <span className={liveStatus.functional ? "font-semibold text-emerald-300/90" : "text-white/35"}>
                {liveStatus.functional ? "Active" : "Paused"}
              </span>
            </li>
          </ul>
        </div>

        {!hydrated ? (
          <p className="text-[14px] text-white/40" aria-live="polite">
            Loading your saved preferences…
          </p>
        ) : null}

        {toast ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[14px] font-medium text-emerald-100/90"
          >
            {toast}
          </div>
        ) : null}

        {savedAt && hydrated ? (
          <p className="text-[13px] text-white/38">
            Last saved:{" "}
            <time dateTime={savedAt} className="font-medium text-white/55">
              {new Date(savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </time>
            {consentSource ? (
              <span className="text-white/30"> · {consentSource.replace(/_/g, " ")}</span>
            ) : null}
          </p>
        ) : null}

        <div className="space-y-3">
          <ToggleRow
            id="toggle-essential"
            title="Strictly necessary"
            description="Sign-in, checkout, security, and remembering these settings. Always on."
            checked
            disabled
            activeLabel="Always on"
            onChange={() => {}}
          />
          <ToggleRow
            id="toggle-functional"
            title="Functional"
            description="Remembers display and accessibility choices where we support them."
            checked={functional}
            activeLabel={liveStatus.functional ? "Running" : "Off"}
            onChange={setFunctional}
          />
          <ToggleRow
            id="toggle-analytics"
            title="Analytics"
            description="Anonymous page views, errors, and time-on-page so we can improve Salvya."
            checked={analytics}
            activeLabel={liveStatus.analytics ? "Running" : "Off"}
            onChange={setAnalytics}
          />
          <ToggleRow
            id="toggle-marketing"
            title="Marketing"
            description="Campaign measurement (e.g. Meta Pixel) when configured for your region."
            checked={marketing}
            activeLabel={liveStatus.marketing ? "Running" : "Off"}
            onChange={setMarketing}
          />
        </div>

        <p className="text-[13px] leading-relaxed text-white/38">
          Stored in local storage on this browser only — not synced to your Salvya account. If you dismiss the cookie
          notice without choosing, optional cookies stay on for this device.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2D6BFF] px-6 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] transition-transform active:scale-[0.99]"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] px-6 text-[14px] font-semibold text-white/88 transition-colors hover:bg-white/[0.08]"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={onEssentialOnly}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] px-6 text-[14px] font-semibold text-white/88 transition-colors hover:bg-white/[0.08]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center justify-center px-2 text-[14px] font-semibold text-white/45 underline decoration-white/20 underline-offset-2 hover:text-white/65"
          >
            Reset choices
          </button>
        </div>
      </main>
    </div>
  );
}
