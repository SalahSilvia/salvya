import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ROBOTS_NOINDEX_FOLLOW } from "@/lib/seo/robots";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Search artists & merch",
    description:
      "Find artists, hoodies, tees, and limited drops across Salvya. Search by name, style, or product.",
    path: "/search",
    locale,
    robots: ROBOTS_NOINDEX_FOLLOW,
  });
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
