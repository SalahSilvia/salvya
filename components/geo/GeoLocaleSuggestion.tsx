"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { localeLabels, type AppLocale } from "@/i18n/routing";
import { currencyDisplayLabel } from "@/components/geo/currency-labels";
import {
  buildGeoSuggestion,
  dismissGeoSuggestion,
  clearGeoManual,
  persistGeoChoice,
  type RegionalPreferencesSnapshot,
} from "@/lib/geo/preferences";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";
import { stripLocaleFromPathname } from "@/lib/i18n/pathname";

function shouldHideGeoSuggestion(pathname: string): boolean {
  const path = stripLocaleFromPathname(pathname);
  return (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/auth") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.includes("/checkout")
  );
}

type Props = {
  initialSnapshot: RegionalPreferencesSnapshot;
  acceptLanguage?: string | null;
};

export function GeoLocaleSuggestion({ initialSnapshot, acceptLanguage }: Props) {
  const t = useTranslations("geo");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { setDisplayCurrency, markGeoResolved } = useRegionalPreferences();

  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snapshot, setSnapshot] = useState(initialSnapshot);

  const suggestion = useMemo(
    () => buildGeoSuggestion(snapshot, locale, acceptLanguage),
    [snapshot, locale, acceptLanguage],
  );

  useEffect(() => {
    setHydrated(true);
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);

  useEffect(() => {
    if (!hydrated || shouldHideGeoSuggestion(pathname)) {
      setVisible(false);
      return;
    }
    setVisible(Boolean(suggestion));
  }, [hydrated, pathname, suggestion]);

  const onSwitch = useCallback(() => {
    if (!suggestion) return;
    const { profile, suggestedLocale, suggestedCurrency } = suggestion;
    clearGeoManual();
    persistGeoChoice({
      locale: suggestedLocale,
      currency: suggestedCurrency,
      country: profile.countryCode,
    });
    setDisplayCurrency(suggestedCurrency);
    markGeoResolved();
    setVisible(false);
    void fetch("/api/me/regional-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        country: profile.countryCode,
        locale: suggestedLocale,
        displayCurrency: suggestedCurrency,
      }),
    }).catch(() => undefined);
    if (suggestedLocale !== locale) {
      router.replace(pathname, { locale: suggestedLocale });
    } else {
      router.refresh();
    }
  }, [suggestion, locale, pathname, router, setDisplayCurrency, markGeoResolved]);

  const onStay = useCallback(() => {
    if (!suggestion) return;
    dismissGeoSuggestion(suggestion.profile.countryCode);
    markGeoResolved();
    setSnapshot((prev) => ({ ...prev, geoResolved: true }));
    setVisible(false);
  }, [suggestion, markGeoResolved]);

  if (!hydrated || !suggestion) return null;

  const { profile, suggestedLocale, suggestedCurrency } = suggestion;
  const localeLabel = localeLabels[suggestedLocale];
  const currencyLabel = currencyDisplayLabel(suggestedCurrency, locale);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label={t("ariaLabel")}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-[5.75rem] z-[130] flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bottom-6 md:pb-6"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <motion.div
            className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0c12]/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2D6BFF]/60 to-transparent"
              aria-hidden
            />
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9eb6ff]/90">
                  {profile.flag} {t("detected", { country: profile.countryName })}
                </p>
                <p className="mt-1.5 text-[15px] font-semibold leading-snug text-white/92">{t("headline")}</p>
                <p className="mt-1 text-[13px] text-white/55">
                  {t("offer", { locale: localeLabel, currency: currencyLabel })}
                </p>
                <p className="mt-2 text-[11px] text-white/38">{t("chargeNote")}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <button
                  type="button"
                  onClick={onSwitch}
                  className="min-h-[44px] rounded-xl bg-[#2D6BFF] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_28px_-8px_rgba(45,107,255,0.65)] transition hover:bg-[#3d76ff]"
                >
                  {t("switch")}
                </button>
                <button
                  type="button"
                  onClick={onStay}
                  className="min-h-[44px] rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-white/75 transition hover:border-white/[0.2] hover:text-white/90"
                >
                  {t("stay")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
