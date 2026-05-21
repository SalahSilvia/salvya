"use client";

import { useTranslations } from "next-intl";
import { ProductCheckoutPage } from "@/components/shop/ProductCheckoutPage";
import { BagCheckoutError, BagCheckoutLoading } from "@/components/shop/bag-checkout/BagCheckoutLoading";
import { useBagCheckoutQuote } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import { productCheckoutPropsFromBag } from "@/lib/cart/bag-checkout-props";

export function BagCheckoutDetailsPage() {
  const t = useTranslations("checkout");
  const { loading, error, quote, primaryLineItem } = useBagCheckoutQuote();

  if (loading) return <BagCheckoutLoading />;
  if (error || !quote || !primaryLineItem) {
    return <BagCheckoutError message={error ?? t("bagEmptyError")} />;
  }

  return <ProductCheckoutPage {...productCheckoutPropsFromBag(quote, primaryLineItem)} />;
}
