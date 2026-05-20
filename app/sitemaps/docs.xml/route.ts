import { NextResponse } from "next/server";
import { getAllDocs } from "@/lib/docs/loader";
import { buildUrlEntry, entriesToSitemapXml } from "@/lib/sitemaps/xml";

export function GET() {
  const docEntries = getAllDocs().flatMap((d) =>
    buildUrlEntry(d.path, {
      priority: d.priority ?? 0.6,
      changeFrequency: d.changeFrequency ?? "monthly",
      lastModified: d.updatedAt ? new Date(d.updatedAt) : undefined,
    }),
  );
  const hub = buildUrlEntry("/docs", { priority: 0.75, changeFrequency: "weekly" });
  const aiPages = ["/ai", "/platform", "/architecture", "/trust", "/security", "/how-it-works"].flatMap((p) =>
    buildUrlEntry(p, { priority: 0.7, changeFrequency: "weekly" }),
  );
  const xml = entriesToSitemapXml([...hub, ...docEntries, ...aiPages]);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
