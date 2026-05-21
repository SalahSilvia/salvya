import type { MetadataRoute } from "next";
import { getSiteFaviconUrl } from "@/lib/brand/site-branding";
import { SITE_NAME } from "@/lib/seo/site";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const faviconUrl = await getSiteFaviconUrl();
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Official artist merch, limited drops, and mobile-first checkout on Salvya.",
    start_url: "/en/shop",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      {
        src: faviconUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
