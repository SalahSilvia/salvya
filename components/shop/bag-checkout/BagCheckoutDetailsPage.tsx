"use client";

import { ProductCheckoutPage } from "@/components/shop/ProductCheckoutPage";
import { BagCheckoutError, BagCheckoutLoading } from "@/components/shop/bag-checkout/BagCheckoutLoading";
import { useBagCheckoutQuote } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import { productCheckoutPropsFromBag } from "@/lib/cart/bag-checkout-props";

export function BagCheckoutDetailsPage() {
  const { loading, error, quote, primaryLineItem } = useBagCheckoutQuote();

  if (loading) return <BagCheckoutLoading />;
  if (error || !quote || !primaryLineItem) {
    return <BagCheckoutError message={error ?? "Your bag is empty or could not be loaded."} />;
  }

  return <ProductCheckoutPage {...productCheckoutPropsFromBag(quote, primaryLineItem)} />;
}
