import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Your account",
  description: "Manage your Salvya profile, orders, and preferences.",
  path: "/account/profile",
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
