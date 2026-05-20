import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DocPlatformPage } from "@/components/docs/DocPlatformPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Security — Salvya",
    description: "Account security, sessions, and responsible disclosure.",
    path: "/security",
    locale,
  });
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DocPlatformPage category="platform" slug="security" locale={locale} />;
}
