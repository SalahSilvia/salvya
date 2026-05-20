import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLdGraph } from "@/lib/help-center/seo";
import { FAQ_PATH } from "@/lib/help-center/content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { resolveSalvyaLocale } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "FAQ — Salvya Help",
    description:
      "Frequently asked questions for customers, creators, and developers — orders, refunds, payouts, API access, cookies, and platform policies.",
    path: FAQ_PATH,
    locale,
    keywords: [
      "Salvya FAQ",
      "order tracking help",
      "refunds",
      "creator payouts",
      "developer API",
      "shipping questions",
      "account help",
    ],
  });
}

export default async function FaqLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveSalvyaLocale(await getLocale());
  return (
    <>
      <JsonLd data={faqPageJsonLdGraph(locale)} />
      {children}
    </>
  );
}
