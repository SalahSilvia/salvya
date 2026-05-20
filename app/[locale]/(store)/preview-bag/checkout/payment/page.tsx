import type { Metadata } from "next";
import { BagCheckoutPaymentPage } from "@/components/shop/bag-checkout/BagCheckoutPaymentPage";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Bag checkout · Payment",
  description: "Pay for all variants in your Salvya bag.",
  path: "/preview-bag/checkout/payment",
});

export default function PreviewBagCheckoutPaymentPage() {
  return <BagCheckoutPaymentPage />;
}
