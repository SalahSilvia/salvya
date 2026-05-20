import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DocPlatformPage } from "@/components/docs/DocPlatformPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Platform architecture — Salvya",
    description: "Storefront, workspace, admin, and API boundaries.",
    path: "/architecture",
    locale,
  });
}

export default async function ArchitecturePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DocPlatformPage category="platform" slug="architecture" locale={locale} />;
}
