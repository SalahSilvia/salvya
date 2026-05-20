import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { SalvyaStatusPage } from "@/components/status/SalvyaStatusPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Salvya platform status",
    description: "Operational status for storefront, payments, creator systems, APIs, and documentation.",
    path: "/status",
    locale,
  });
}

export default function StatusPage() {
  return <SalvyaStatusPage />;
}
