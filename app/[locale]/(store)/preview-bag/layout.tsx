import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Your bag",
  description: "Review items in your Salvya bag before checkout.",
  path: "/preview-bag",
});

export default function PreviewBagLayout({ children }: { children: React.ReactNode }) {
  return children;
}
