import { defaultLocale, isAppLocale, localeBcp47, type AppLocale } from "@/i18n/routing";

/** Stable blog date strings for SSR + hydration (never rely on `undefined` locale). */
export function formatBlogDate(
  iso: string,
  locale: string,
  dateStyle: "long" | "medium" = "medium",
): string {
  const loc: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  return new Date(iso).toLocaleDateString(localeBcp47[loc], { dateStyle });
}
