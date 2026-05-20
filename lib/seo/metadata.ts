import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_LOCALE,
  SITE_NAME,
  SUPPORTED_LOCALES,
  absoluteUrl,
  getSiteUrl,
  localePath,
  localizedAbsoluteUrl,
  resolveSalvyaLocale,
  type SalvyaLocale,
} from "./site";
import { localeBcp47 } from "@/i18n/routing";
import { ROBOTS_PRIVATE, ROBOTS_PUBLIC } from "./robots";

export type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  /** Locale segment for canonical, hreflang, and OG (defaults to `en`). */
  locale?: string | SalvyaLocale;
  /** Override canonical path if different from `path` (still locale-prefixed). */
  canonicalPath?: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  keywords?: string[];
  robots?: Metadata["robots"];
  noSuffix?: boolean;
};

function buildHreflangAlternates(path: string): NonNullable<Metadata["alternates"]>["languages"] {
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[localeBcp47[loc]] = localizedAbsoluteUrl(path, loc);
  }
  languages["x-default"] = localizedAbsoluteUrl(path, DEFAULT_LOCALE);
  return languages;
}

function openGraphLocale(locale: SalvyaLocale): string {
  const bcp = localeBcp47[locale];
  if (locale === "en") return "en_US";
  if (locale === "fr") return "fr_FR";
  if (locale === "es") return "es_ES";
  if (locale === "it") return "it_IT";
  if (locale === "nl") return "nl_NL";
  if (locale === "ar") return "ar_MA";
  return bcp;
}

function openGraphAlternateLocales(current: SalvyaLocale): string[] {
  return SUPPORTED_LOCALES.filter((loc) => loc !== current).map((loc) => openGraphLocale(loc));
}

function titleWithBrand(title: string, noSuffix?: boolean): string {
  const t = title.trim();
  if (noSuffix || t.includes("Salvya")) return t;
  return `${t} | ${SITE_NAME}`;
}

function defaultOgImages(
  image?: string | null,
  alt?: string,
): Array<{ url: string; width: number; height: number; alt: string }> {
  const url = absoluteUrl(image?.trim() ? image : DEFAULT_OG_IMAGE_PATH);
  return [{ url, width: 1200, height: 630, alt: alt ?? SITE_NAME }];
}

/**
 * Builds consistent Next.js Metadata: title, description, locale canonical, hreflang, OG, Twitter.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const locale = resolveSalvyaLocale(input.locale);
  const path = input.canonicalPath ?? input.path;
  const localizedPath = localePath(path, locale);
  const description = (input.description?.trim() || DEFAULT_DESCRIPTION).slice(0, 320);
  const canonical = localizedAbsoluteUrl(path, locale);
  const title = titleWithBrand(input.title, input.noSuffix);
  const ogType = input.type === "article" ? "article" : "website";
  const robots = input.robots ?? ROBOTS_PUBLIC;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: ogType,
    siteName: SITE_NAME,
    title,
    description,
    url: canonical,
    locale: openGraphLocale(locale),
    alternateLocale: openGraphAlternateLocales(locale),
    images: defaultOgImages(input.image, input.imageAlt),
    ...(input.type === "article" && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    ...(input.type === "article" && input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    ...(input.type === "article" && input.authors?.length ? { authors: input.authors } : {}),
    ...(input.type === "article" && input.tags?.length ? { tags: input.tags } : {}),
  };

  return {
    title,
    description,
    keywords: input.keywords?.length ? input.keywords : undefined,
    robots,
    alternates: {
      canonical,
      languages: buildHreflangAlternates(path),
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: defaultOgImages(input.image, input.imageAlt).map((i) => i.url),
    },
    metadataBase: new URL(getSiteUrl()),
  };
}

export function buildPrivatePageMetadata(
  input: Omit<PageMetadataInput, "robots"> & { robots?: Metadata["robots"] },
): Metadata {
  return buildPageMetadata({ ...input, robots: input.robots ?? ROBOTS_PRIVATE });
}

/** Root layout defaults — use with title.template in layout. */
export function rootSiteMetadata(): Metadata {
  const keywords = [
    "artist merch",
    "limited drops",
    "streetwear",
    "official merch",
    "Salvya",
    "hoodies",
    "graphic tees",
    "ElGrandeToto",
  ];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${SITE_NAME} — Official artist merch & limited drops`,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords,
    applicationName: SITE_NAME,
    robots: ROBOTS_PUBLIC,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Official artist merch & limited drops`,
      description: DEFAULT_DESCRIPTION,
      url: localizedAbsoluteUrl("/", DEFAULT_LOCALE),
      locale: "en_US",
      alternateLocale: openGraphAlternateLocales(DEFAULT_LOCALE),
      images: defaultOgImages(null),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: defaultOgImages(null).map((i) => i.url),
    },
    alternates: {
      canonical: localizedAbsoluteUrl("/", DEFAULT_LOCALE),
      languages: buildHreflangAlternates("/"),
    },
    /** Same-origin path — avoids locale-prefixed `/en/manifest.webmanifest` 404s. */
    manifest: "/manifest.webmanifest",
  };
}
