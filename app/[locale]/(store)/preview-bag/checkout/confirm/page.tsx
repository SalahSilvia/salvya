import type { Metadata } from "next";
import { BagCheckoutConfirmPage } from "@/components/shop/bag-checkout/BagCheckoutConfirmPage";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Bag checkout · Confirmation",
  description: "Order confirmation for your Salvya bag.",
  path: "/preview-bag/checkout/confirm",
});

export default function PreviewBagCheckoutConfirmPage() {
  return <BagCheckoutConfirmPage />;
}
