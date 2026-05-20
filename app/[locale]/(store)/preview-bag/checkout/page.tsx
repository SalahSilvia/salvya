import type { Metadata } from "next";
import { BagCheckoutDetailsPage } from "@/components/shop/bag-checkout/BagCheckoutDetailsPage";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Bag checkout",
  description: "Shipping and contact for all variants in your Salvya bag.",
  path: "/preview-bag/checkout",
});

export default function PreviewBagCheckoutPage() {
  return <BagCheckoutDetailsPage />;
}
