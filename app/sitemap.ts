import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog/get-posts";
import { fetchAllPublishedProducts } from "@/lib/catalog/fetch-published-products";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { getStorefrontArtists } from "@/lib/artists/get-artists";
import { getAllDocs } from "@/lib/docs/loader";
import { getSiteUrl, localePath, SUPPORTED_LOCALES, type SalvyaLocale } from "@/lib/seo/site";

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }> =
  [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.95, changeFrequency: "daily" },
    { path: "/search", priority: 0.7, changeFrequency: "weekly" },
    { path: "/blogs", priority: 0.85, changeFrequency: "daily" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/help-center", priority: 0.65, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.6, changeFrequency: "weekly" },
    { path: "/docs", priority: 0.75, changeFrequency: "weekly" },
    { path: "/developers", priority: 0.55, changeFrequency: "monthly" },
    { path: "/ai", priority: 0.7, changeFrequency: "weekly" },
    { path: "/platform", priority: 0.65, changeFrequency: "weekly" },
    { path: "/architecture", priority: 0.6, changeFrequency: "monthly" },
    { path: "/trust", priority: 0.55, changeFrequency: "monthly" },
    { path: "/security", priority: 0.55, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.65, changeFrequency: "weekly" },
    { path: "/status", priority: 0.45, changeFrequency: "daily" },
    { path: "/creator/apply", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.35, changeFrequency: "yearly" },
    { path: "/shipping", priority: 0.4, changeFrequency: "yearly" },
    { path: "/payment", priority: 0.35, changeFrequency: "yearly" },
    { path: "/returns", priority: 0.4, changeFrequency: "yearly" },
    { path: "/size-guide", priority: 0.45, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/track-order", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.55, changeFrequency: "monthly" },
  ];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const { path, priority, changeFrequency } of STATIC_PATHS) {
      entries.push({
        url: `${base}${localePath(path, locale as SalvyaLocale)}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  }

  const [artists, products, posts] = await Promise.all([
    getStorefrontArtists(),
    fetchAllPublishedProducts(200),
    getPublishedBlogPosts(200),
  ]);

  for (const locale of SUPPORTED_LOCALES) {
    for (const artist of artists) {
      if (artist.statusTag === "COMING SOON") continue;
      entries.push({
        url: `${base}${localePath(`/artist/${artist.slug}`, locale as SalvyaLocale)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    for (const product of products) {
      const productUpdated = product.publishedAt;
      entries.push({
        url: `${base}${localePath(pdpPath(product), locale as SalvyaLocale)}`,
        lastModified: productUpdated ? new Date(productUpdated) : now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }

    for (const post of posts) {
      entries.push({
        url: `${base}${localePath(`/blog/${post.slug}`, locale as SalvyaLocale)}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: "monthly",
        priority: post.featured ? 0.75 : 0.65,
      });
    }

    for (const doc of getAllDocs()) {
      entries.push({
        url: `${base}${localePath(doc.path, locale as SalvyaLocale)}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
        changeFrequency: doc.changeFrequency ?? "monthly",
        priority: doc.priority ?? 0.6,
      });
    }
  }

  return entries;
}
