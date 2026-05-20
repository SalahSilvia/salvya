import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DocPlatformPage } from "@/components/docs/DocPlatformPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "AI platform overview — Salvya",
    description: "Machine-readable Salvya index for LLMs, crawlers, and answer engines.",
    path: "/ai",
    locale,
    keywords: ["Salvya AI", "llms.txt", "structured data", "AI commerce"],
  });
}

export default async function AiOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DocPlatformPage category="platform" slug="ai-overview" locale={locale} />;
}
