"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";

/** One `artist_view` per mount / slug change (SPA-safe). */
export function ArtistViewAnalytics({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "/";
  const lastSlug = useRef<string | null>(null);

  useEffect(() => {
    if (lastSlug.current === slug) return;
    lastSlug.current = slug;
    getAnalyticsTracker().trackArtistView(pathname, slug);
    getAnalyticsTracker().trackArtistProfileView(pathname, slug);
  }, [slug, pathname]);

  return null;
}
