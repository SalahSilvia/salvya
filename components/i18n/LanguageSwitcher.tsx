"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, type AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

type Props = {
  variant?: "menu" | "compact";
  className?: string;
};

export function LanguageSwitcher({ variant = "menu", className }: Props) {
  const t = useTranslations("language");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const onChange = (next: string) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next as AppLocale });
  };

  if (variant === "compact") {
    return (
      <label className={className}>
        <span className="sr-only">{t("title")}</span>
        <select
          value={locale}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#2D6BFF]/50 focus:ring-2 focus:ring-[#2D6BFF]/20"
          aria-label={t("title")}
        >
          {routing.locales.map((code) => (
            <option key={code} value={code} className="bg-[#0a0a10] text-white">
              {localeLabels[code]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">{t("title")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {routing.locales.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors ${
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
  );
}
