"use client";

import { useTranslations } from "next-intl";
import { ProductCheckoutConfirmPage } from "@/components/shop/ProductCheckoutConfirmPage";
import { BagCheckoutError, BagCheckoutLoading } from "@/components/shop/bag-checkout/BagCheckoutLoading";
import { useBagCheckoutQuote } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import { productCheckoutPropsFromBag } from "@/lib/cart/bag-checkout-props";

export function BagCheckoutConfirmPage() {
  const t = useTranslations("checkout");
  const { loading, error, quote, primaryLineItem } = useBagCheckoutQuote();

  if (loading) return <BagCheckoutLoading />;
  if (error || !quote || !primaryLineItem) {
    return <BagCheckoutError message={error ?? t("bagEmptyError")} />;
  }

  return <ProductCheckoutConfirmPage {...productCheckoutPropsFromBag(quote, primaryLineItem)} />;
}
