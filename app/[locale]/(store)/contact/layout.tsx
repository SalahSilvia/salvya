import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Contact us",
    description:
      "Contact Salvya by email, WhatsApp, or phone. CIEG in Morocco and Italy. Quick actions, FAQs, and help center — online only.",
    path: "/contact",
    locale,
    keywords: ["contact Salvya", "customer support", "artist merch help", "order support"],
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
