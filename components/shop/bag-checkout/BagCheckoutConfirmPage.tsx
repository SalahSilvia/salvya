"use client";

import { ProductCheckoutConfirmPage } from "@/components/shop/ProductCheckoutConfirmPage";
import { BagCheckoutError, BagCheckoutLoading } from "@/components/shop/bag-checkout/BagCheckoutLoading";
import { useBagCheckoutQuote } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import { productCheckoutPropsFromBag } from "@/lib/cart/bag-checkout-props";

export function BagCheckoutConfirmPage() {
  const { loading, error, quote, primaryLineItem } = useBagCheckoutQuote();

  if (loading) return <BagCheckoutLoading />;
  if (error || !quote || !primaryLineItem) {
    return <BagCheckoutError message={error ?? "Your bag is empty or could not be loaded."} />;
  }

  return <ProductCheckoutConfirmPage {...productCheckoutPropsFromBag(quote, primaryLineItem)} />;
}
