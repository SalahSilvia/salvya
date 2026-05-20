import { NextResponse } from "next/server";
import { buildUrlEntry, entriesToSitemapXml } from "@/lib/sitemaps/xml";

const POLICY_PATHS = ["/terms", "/returns", "/shipping", "/payment", "/cookies", "/terms/creator", "/terms/account"];

export function GET() {
  const entries = POLICY_PATHS.flatMap((p) => buildUrlEntry(p, { priority: 0.4, changeFrequency: "yearly" }));
  return new NextResponse(entriesToSitemapXml(entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
