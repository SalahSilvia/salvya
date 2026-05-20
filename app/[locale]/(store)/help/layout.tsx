import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Legacy `/help` route redirects to `/help-center`; metadata kept for crawlers during transition. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Salvya Help Center",
    description:
      "Documentation, guides, developer APIs, creator tools, onboarding flows, policies, and AI-readable platform knowledge.",
    path: "/help-center",
    locale,
    canonicalPath: "/help-center",
  });
}

export default function LegacyHelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
