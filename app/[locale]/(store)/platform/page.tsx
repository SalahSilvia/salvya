import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DocPlatformPage } from "@/components/docs/DocPlatformPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Salvya platform",
    description: "How Salvya creator-commerce works for fans, artists, and creators.",
    path: "/platform",
    locale,
  });
}

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DocPlatformPage category="platform" slug="how-salvya-works" locale={locale} />;
}
