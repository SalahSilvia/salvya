import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { helpCenterJsonLdGraph } from "@/lib/help-center/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { resolveSalvyaLocale } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Salvya Help Center",
    description:
      "Documentation, guides, developer APIs, creator tools, onboarding flows, policies, and AI-readable platform knowledge.",
    path: "/help-center",
    locale,
    keywords: [
      "Salvya help",
      "order tracking",
      "refunds",
      "creator programme",
      "developer API",
      "shipping policy",
      "account help",
      "AI documentation",
    ],
  });
}

export default async function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveSalvyaLocale(await getLocale());
  return (
    <>
      <JsonLd data={helpCenterJsonLdGraph(locale)} />
      {children}
    </>
  );
}
