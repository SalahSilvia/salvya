"use client";

import { useTranslations } from "next-intl";
import { DISPLAY_CURRENCIES, type CurrencyCode } from "@/lib/currency/config";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";
import { currencyDisplayLabel } from "@/components/geo/currency-labels";

type Props = {
  className?: string;
  variant?: "menu" | "compact";
};

export function DisplayCurrencySwitcher({ className, variant = "menu" }: Props) {
  const t = useTranslations("geo");
  const { displayCurrency, setDisplayCurrency } = useRegionalPreferences();

  if (variant === "compact") {
    return (
      <label className={className}>
        <span className="sr-only">{t("currencyTitle")}</span>
        <select
          value={displayCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value as CurrencyCode)}
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#2D6BFF]/50 focus:ring-2 focus:ring-[#2D6BFF]/20"
          aria-label={t("currencyTitle")}
        >
          {DISPLAY_CURRENCIES.map((code) => (
            <option key={code} value={code} className="bg-[#0a0a10] text-white">
              {currencyDisplayLabel(code)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">{t("currencyTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {DISPLAY_CURRENCIES.map((code) => {
          const active = code === displayCurrency;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setDisplayCurrency(code)}
              className={`min-h-[40px] rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors ${
                active
                  ? "border-[#2D6BFF]/45 bg-[#2D6BFF]/15 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.14] hover:text-white/85"
              }`}
              aria-current={active ? "true" : undefined}
            >
              {currencyDisplayLabel(code)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
