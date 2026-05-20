import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DocPlatformPage } from "@/components/docs/DocPlatformPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Trust & safety — Salvya",
    description: "Fraud prevention, moderation, and payout integrity.",
    path: "/trust",
    locale,
  });
}

export default async function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DocPlatformPage category="platform" slug="trust" locale={locale} />;
}
