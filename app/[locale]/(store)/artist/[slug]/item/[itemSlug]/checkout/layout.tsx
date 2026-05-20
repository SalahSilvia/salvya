import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Checkout",
  description: "Complete your Salvya order securely.",
  path: "/checkout",
});

export default function ItemCheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
