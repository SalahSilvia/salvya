"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatBaseCentsForDisplay } from "@/lib/currency/display";
import { type CurrencyCode } from "@/lib/currency/config";
import { countryToMarketCode } from "@/lib/market/country-to-market";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { buildClientGeoDetectRequest } from "@/lib/geo/detect-request-headers";
import {
  formatCookieSnapshot,
  formatRegionalSnapshotForLog,
  geoLogBrowser,
  marketCodeToPriceTier,
  priceTierLabel,
  readGeoCookiesFromDocument,
} from "@/lib/geo/debug";
import {
  localeApplyForMorocco,
  persistGeoChoice,
  readClientRegionalPreferences,
  REGIONAL_PREFERENCES_EVENT,
  type RegionalPreferencesSnapshot,
} from "@/lib/geo/preferences";

export type ApplyRegionalPreferencesInput = {
  country: string;
  currency: CurrencyCode;
  locale?: AppLocale;
  /** Set when the shopper picks country in the menu (blocks silent VPN auto-switch). */
  manual?: boolean;
};

type RegionalPreferencesContextValue = {
  snapshot: RegionalPreferencesSnapshot;
  displayCurrency: CurrencyCode;
  prefCountry: string | null;
  marketCode: ReturnType<typeof countryToMarketCode>;
  formatPrice: (cents: number) => string;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  applyRegionalPreferences: (input: ApplyRegionalPreferencesInput) => Promise<void>;
  syncGeoDetection: () => Promise<void>;
  markGeoResolved: () => void;
};

const RegionalPreferencesContext = createContext<RegionalPreferencesContextValue | null>(null);

type Props = {
  children: ReactNode;
  initial: RegionalPreferencesSnapshot;
};

async function syncRegionalPreferencesToServer(input: ApplyRegionalPreferencesInput) {
  await fetch("/api/me/regional-preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      country: input.country,
      locale: input.locale,
      displayCurrency: input.currency,
    }),
  });
}

export function RegionalPreferencesProvider({ children, initial }: Props) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initial);

  const pricingCountry = snapshot.geoManual
    ? (snapshot.prefCountry ?? snapshot.detectedCountry)
    : snapshot.weakDetection
      ? snapshot.prefCountry
      : (snapshot.prefCountry ?? snapshot.detectedCountry);
  const prefCountry = snapshot.prefCountry ?? snapshot.detectedCountry;
  const marketCode = countryToMarketCode(pricingCountry);

  const applyRegionalPreferences = useCallback(
    async (input: ApplyRegionalPreferencesInput) => {
      persistGeoChoice({
        currency: input.currency,
        country: input.country,
        resolved: true,
        manual: input.manual,
        weakDetection: false,
      });
      setSnapshot((prev) => ({
        ...prev,
        prefCountry: input.country,
        detectedCountry: input.country,
        displayCurrency: input.currency,
        geoResolved: true,
        geoManual: input.manual ? true : prev.geoManual,
        weakDetection: false,
      }));

      void syncRegionalPreferencesToServer(input).catch(() => undefined);

      if (input.locale && input.locale !== locale) {
        router.replace(pathname, { locale: input.locale });
      } else {
        router.refresh();
      }
    },
    [locale, pathname, router],
  );

  const setDisplayCurrency = useCallback(
    (currency: CurrencyCode) => {
      const country = snapshot.prefCountry ?? snapshot.detectedCountry ?? "EU";
      void applyRegionalPreferences({ country, currency });
    },
    [applyRegionalPreferences, snapshot.detectedCountry, snapshot.prefCountry],
  );

  const markGeoResolved = useCallback(() => {
    setSnapshot((prev) => ({ ...prev, geoResolved: true }));
  }, []);

  const syncGeoDetection = useCallback(async () => {
    try {
      const cookiesBefore = readGeoCookiesFromDocument();
      geoLogBrowser("cookies before sync:", cookiesBefore ? formatCookieSnapshot(cookiesBefore) : {});

      const { query, headers: geoHeaders } = buildClientGeoDetectRequest();
      geoLogBrowser("device geo request =", { query, geoHeaders });
      const res = await fetch(`/api/geo/detect${query}`, {
        credentials: "include",
        cache: "no-store",
        headers: geoHeaders,
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        country?: string;
        source?: string;
        reason?: string;
        applied?: boolean;
        confidence?: string;
        weakDetection?: boolean;
        permanent?: boolean;
        persistable?: boolean;
        profile?: { countryCode: string; currency: CurrencyCode; locale: AppLocale };
      };
      const country = data.country;
      const profile = data.profile;
      if (!country || !profile) return;

      geoLogBrowser("detect API result =", {
        country,
        source: data.source,
        confidence: data.confidence,
        weakDetection: data.weakDetection,
        permanent: data.permanent,
        reason: data.reason,
        applied: data.applied,
        priceTier: priceTierLabel(country),
      });

      setSnapshot((prev) => {
        const matchesProfile =
          normalizeCountryCode(prev.prefCountry) === normalizeCountryCode(profile.countryCode) &&
          prev.displayCurrency === profile.currency;
        const shouldAutoApply =
          !prev.geoManual && !matchesProfile && data.permanent === true && !data.weakDetection;

        if (data.weakDetection && !prev.geoManual) {
          geoLogBrowser("weak detection — session hint only, no pref lock", { country });
          return {
            ...prev,
            detectedCountry: country,
            weakDetection: true,
            confidence: (data.confidence as RegionalPreferencesSnapshot["confidence"]) ?? "LOW",
          };
        }

        if (shouldAutoApply) {
          geoLogBrowser("applying regional defaults =", {
            country: profile.countryCode,
            currency: profile.currency,
            priceTier: marketCodeToPriceTier(countryToMarketCode(profile.countryCode)),
            geoManual: false,
          });
          const localeApply =
            profile.countryCode === "MA"
              ? localeApplyForMorocco(locale, profile.locale)
              : profile.locale !== locale
                ? profile.locale
                : undefined;
          queueMicrotask(() => {
            void applyRegionalPreferences({
              country: profile.countryCode,
              currency: profile.currency,
              locale: localeApply,
            });
          });
        } else if (prev.geoManual) {
          geoLogBrowser("skip auto-apply — manual country lock", {
            pref: prev.prefCountry,
            detected: country,
          });
        }

        const detectedChanged =
          normalizeCountryCode(prev.detectedCountry) !== normalizeCountryCode(country);
        if (!detectedChanged && !shouldAutoApply) return prev;

        return {
          ...prev,
          detectedCountry: country,
          weakDetection: false,
          confidence: (data.confidence as RegionalPreferencesSnapshot["confidence"]) ?? prev.confidence,
        };
      });

      const cookiesAfter = readGeoCookiesFromDocument();
      geoLogBrowser("cookies after sync:", cookiesAfter ? formatCookieSnapshot(cookiesAfter) : {});
    } catch {
      geoLogBrowser("syncGeoDetection failed");
    }
  }, [applyRegionalPreferences, locale]);

  const formatPrice = useCallback(
    (cents: number) => formatBaseCentsForDisplay(cents, snapshot.displayCurrency, { locale }),
    [snapshot.displayCurrency, locale],
  );

  useEffect(() => {
    geoLogBrowser("hydration initial snapshot =", formatRegionalSnapshotForLog(initial, { locale, marketCode }));
    if (initial.bootstrapCountry && initial.bootstrapCurrency) {
      geoLogBrowser("persisting SSR bootstrap to cookies =", {
        country: initial.bootstrapCountry,
        currency: initial.bootstrapCurrency,
        priceTier: priceTierLabel(initial.bootstrapCountry),
      });
      persistGeoChoice({
        country: initial.bootstrapCountry,
        currency: initial.bootstrapCurrency,
        resolved: true,
      });
    }
  }, [initial, initial.bootstrapCountry, initial.bootstrapCurrency, locale, marketCode]);

  useEffect(() => {
    const onRegionalUpdate = () => {
      setSnapshot(readClientRegionalPreferences());
      void syncGeoDetection();
    };
    window.addEventListener(REGIONAL_PREFERENCES_EVENT, onRegionalUpdate);
    return () => window.removeEventListener(REGIONAL_PREFERENCES_EVENT, onRegionalUpdate);
  }, [syncGeoDetection]);

  const value = useMemo(
    () => ({
      snapshot,
      displayCurrency: snapshot.displayCurrency,
      prefCountry,
      marketCode,
      formatPrice,
      setDisplayCurrency,
      applyRegionalPreferences,
      syncGeoDetection,
      markGeoResolved,
    }),
    [
      snapshot,
      prefCountry,
      marketCode,
      formatPrice,
      setDisplayCurrency,
      applyRegionalPreferences,
      syncGeoDetection,
      markGeoResolved,
    ],
  );

  return (
    <RegionalPreferencesContext.Provider value={value}>{children}</RegionalPreferencesContext.Provider>
  );
}

export function useRegionalPreferences(): RegionalPreferencesContextValue {
  const ctx = useContext(RegionalPreferencesContext);
  if (!ctx) {
    const fallback = readClientRegionalPreferences();
    const prefCountry = fallback.prefCountry ?? fallback.detectedCountry;
    return {
      snapshot: fallback,
      displayCurrency: fallback.displayCurrency,
      prefCountry,
      marketCode: countryToMarketCode(prefCountry),
      formatPrice: (cents) => formatBaseCentsForDisplay(cents, fallback.displayCurrency),
      setDisplayCurrency: () => {},
      applyRegionalPreferences: async () => {},
      syncGeoDetection: async () => {},
      markGeoResolved: () => {},
    };
  }
  return ctx;
}

export function DisplayPrice({ cents, className }: { cents: number; className?: string }) {
  const { formatPrice } = useRegionalPreferences();
  return <span className={className}>{formatPrice(cents)}</span>;
}
