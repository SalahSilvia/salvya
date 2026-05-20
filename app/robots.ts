import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/auth/",
          "/*/login",
          "/*/register",
          "/*/forgot-password",
          "/*/update-password",
          "/*/account",
          "/*/account/",
          "/*/preview-bag",
          "/*/notifications",
          "/*/likes",
          "/*/menu",
          "/*/creator/dashboard",
          "/*/influencer",
          "/*/403",
          "/*/checkout",
          "/*/checkout/",
        ],
      },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/sitemap-index.xml`],
    host: base,
  };
}
