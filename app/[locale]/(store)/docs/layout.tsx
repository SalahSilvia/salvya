import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { resolveSalvyaLocale } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Salvya Documentation",
    description:
      "AI-readable documentation for orders, creators, APIs, policies, and platform architecture on Salvya.",
    path: "/docs",
    locale,
    keywords: ["Salvya docs", "API documentation", "creator payouts", "refunds", "platform architecture"],
  });
}

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveSalvyaLocale(await getLocale());
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(locale),
          breadcrumbJsonLd([{ name: "Docs", path: "/docs" }], locale),
        ]}
      />
      {children}
    </>
  );
}
