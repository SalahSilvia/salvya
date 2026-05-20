import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Saved items",
  description: "Your liked products on Salvya.",
  path: "/likes",
});

export default function LikesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
