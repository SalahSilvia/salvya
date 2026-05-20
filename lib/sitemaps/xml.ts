import type { MetadataRoute } from "next";
import { getSiteUrl, localePath, SUPPORTED_LOCALES, type SalvyaLocale } from "@/lib/seo/site";

export function buildUrlEntry(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority?: number;
    locales?: readonly SalvyaLocale[];
  } = {},
): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = opts.lastModified ?? new Date();
  const locales = opts.locales ?? SUPPORTED_LOCALES;
  return locales.map((locale) => ({
    url: `${base}${localePath(path, locale)}`,
    lastModified: now,
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.5,
  }));
}

export function entriesToSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${(e.lastModified instanceof Date ? e.lastModified : new Date()).toISOString()}</lastmod>
    ${e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : ""}
    ${e.priority != null ? `<priority>${e.priority}</priority>` : ""}
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function sitemapIndexXml(sitemapUrls: string[]): string {
  const nodes = sitemapUrls
    .map(
      (loc) => `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</sitemapindex>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
