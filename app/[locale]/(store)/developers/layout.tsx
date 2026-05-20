import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Developer portal — Salvya API",
    description: "REST APIs, authentication, webhooks, SDK previews, and OpenAPI specification for Salvya integrations.",
    path: "/developers",
    locale,
    keywords: ["Salvya API", "developer docs", "OpenAPI", "webhooks", "creator API", "orders API"],
  });
}

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
