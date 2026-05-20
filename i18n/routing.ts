import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "es", "it", "nl", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  ar: "العربية",
};

/** BCP 47 tags for SEO hreflang. */
export const localeBcp47: Record<AppLocale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  ar: "ar",
};

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});
