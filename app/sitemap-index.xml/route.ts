import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";
import { sitemapIndexXml } from "@/lib/sitemaps/xml";

export function GET() {
  const base = getSiteUrl();
  const xml = sitemapIndexXml([
    `${base}/sitemap.xml`,
    `${base}/sitemaps/docs.xml`,
    `${base}/sitemaps/policies.xml`,
  ]);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
