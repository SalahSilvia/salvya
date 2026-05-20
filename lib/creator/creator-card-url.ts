import { DEFAULT_LOCALE, localizedAbsoluteUrl, type SalvyaLocale } from "@/lib/seo/site";

/** Storefront URL with creator attribution query (scannable from wallet pass). */
export function buildCreatorAttributionUrl(creatorCode: string, locale: SalvyaLocale = DEFAULT_LOCALE): string {
  const url = new URL(localizedAbsoluteUrl("/", locale));
  url.searchParams.set("creator", creatorCode.trim());
  return url.toString();
}

/** Format creator code like a card number (groups of 4). */
export function formatCreatorCodeDisplay(code: string): string {
  const raw = code.replace(/\s+/g, "").toUpperCase();
  if (raw.length <= 8) return raw;
  return raw.match(/.{1,4}/g)?.join(" ") ?? raw;
}

/** Client-only: attribution URL using current origin + locale segment. */
export function buildCreatorAttributionUrlFromWindow(creatorCode: string): string {
  if (typeof window === "undefined") {
    return buildCreatorAttributionUrl(creatorCode);
  }
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  const locale =
    segment && ["en", "fr", "es", "it", "nl", "ar"].includes(segment) ? segment : DEFAULT_LOCALE;
  const url = new URL(`${window.location.origin}/${locale}`);
  url.searchParams.set("creator", creatorCode.trim());
  return url.toString();
}
