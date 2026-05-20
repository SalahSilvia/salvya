"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localeLabels, routing, type AppLocale } from "@/i18n/routing";
import { DISPLAY_CURRENCIES, type CurrencyCode } from "@/lib/currency/config";
import { currencyDisplayLabel } from "@/components/geo/currency-labels";
import { menuCountryOptions } from "@/lib/geo/country-options";
import { geoProfileForCountry } from "@/lib/geo/country-map";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";

const card =
  "overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.04] shadow-[0_20px_60px_-36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl";

type Props = {
  className?: string;
};

export function MenuRegionalSettings({ className }: Props) {
  const t = useTranslations("geo");
  const tLang = useTranslations("language");
  const locale = useLocale() as AppLocale;
  const { snapshot, displayCurrency, prefCountry, marketCode, applyRegionalPreferences } =
    useRegionalPreferences();

  const countries = useMemo(() => menuCountryOptions(), []);
  const activeCountry = prefCountry ?? snapshot.detectedCountry ?? "EU";
  const [pending, setPending] = useState(false);

  const pricingHint =
    marketCode === "MA" ? t("pricingMorocco") : t("pricingInternational");

  const detectedProfile = snapshot.detectedCountry
    ? geoProfileForCountry(snapshot.detectedCountry)
    : null;

  const onCountryChange = async (code: string) => {
    const profile = geoProfileForCountry(code);
    setPending(true);
    try {
      await applyRegionalPreferences({
        country: code,
        currency: profile.currency,
        locale: profile.locale !== locale ? profile.locale : undefined,
        manual: true,
      });
    } finally {
      setPending(false);
    }
  };

  const onLocaleChange = async (next: AppLocale) => {
    if (next === locale) return;
    setPending(true);
    try {
      await applyRegionalPreferences({
        country: activeCountry,
        currency: displayCurrency,
        locale: next,
      });
    } finally {
      setPending(false);
    }
  };

  const onCurrencyChange = async (currency: CurrencyCode) => {
    if (currency === displayCurrency) return;
    setPending(true);
    try {
      await applyRegionalPreferences({
        country: activeCountry,
        currency,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={className} aria-labelledby="menu-regional-heading">
      <div className={card}>
        <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <h2 id="menu-regional-heading" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
            {t("regionalTitle")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/38">{pricingHint}</p>
          {detectedProfile ? (
            <p className="mt-2 text-[12px] text-white/45">
              {t("detectedLine", {
                flag: detectedProfile.flag,
                country: detectedProfile.countryName,
              })}
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-amber-200/70">{t("detectedUnknown")}</p>
          )}
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
              {t("countryTitle")}
            </span>
            <select
              value={activeCountry}
              disabled={pending}
              onChange={(e) => void onCountryChange(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#2D6BFF]/50 focus:ring-2 focus:ring-[#2D6BFF]/20 disabled:opacity-60"
              aria-label={t("countryTitle")}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0a0a10] text-white">
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
              {tLang("title")}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {routing.locales.map((code) => {
                const active = code === locale;
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={pending}
                    onClick={() => void onLocaleChange(code)}
                    className={`min-h-[44px] rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60 ${
                      active
                        ? "border-[#2D6BFF]/45 bg-[#2D6BFF]/15 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.14] hover:text-white/85"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    {localeLabels[code]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
              {t("currencyTitle")}
            </span>
            <p className="mb-2 text-[12px] leading-relaxed text-white/32">{t("currencyHint")}</p>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_CURRENCIES.map((code) => {
                const active = code === displayCurrency;
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={pending}
                    onClick={() => void onCurrencyChange(code)}
                    className={`min-h-[40px] rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                      active
                        ? "border-[#2D6BFF]/45 bg-[#2D6BFF]/15 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.14] hover:text-white/85"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    {currencyDisplayLabel(code, locale)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
