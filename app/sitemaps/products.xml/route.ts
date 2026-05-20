import { NextResponse } from "next/server";
import { fetchAllPublishedProducts } from "@/lib/catalog/fetch-published-products";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { buildUrlEntry, entriesToSitemapXml } from "@/lib/sitemaps/xml";

export async function GET() {
  const products = await fetchAllPublishedProducts(500);
  const now = new Date();
  const entries = products.flatMap((product) =>
    buildUrlEntry(pdpPath(product), {
      priority: 0.85,
      changeFrequency: "weekly",
      lastModified: product.publishedAt ? new Date(product.publishedAt) : now,
    }),
  );
  return new NextResponse(entriesToSitemapXml(entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
