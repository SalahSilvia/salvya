"use client";

import { useTranslations } from "next-intl";
import { ProductCheckoutPaymentPage } from "@/components/shop/ProductCheckoutPaymentPage";
import { BagCheckoutError, BagCheckoutLoading } from "@/components/shop/bag-checkout/BagCheckoutLoading";
import { useBagCheckoutQuote } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import { productCheckoutPropsFromBag } from "@/lib/cart/bag-checkout-props";
import { computePayPalCheckoutTotal } from "@/lib/paypal/checkout-amount";

export function BagCheckoutPaymentPage() {
  const t = useTranslations("checkout");
  const { loading, error, quote, primaryLineItem } = useBagCheckoutQuote();

  if (loading) return <BagCheckoutLoading />;
  if (error || !quote || !primaryLineItem) {
    return <BagCheckoutError message={error ?? t("bagEmptyError")} />;
  }

  const props = productCheckoutPropsFromBag(quote, primaryLineItem);
  const totalQty = quote.lines.reduce((n, l) => n + l.qty, 0);
  const serverPayPalAmount = computePayPalCheckoutTotal(quote.subtotalLabel, totalQty, 0, {
    priceCents: quote.subtotalCents,
  });

  return <ProductCheckoutPaymentPage {...props} serverPayPalAmount={serverPayPalAmount} priceCents={quote.subtotalCents} />;
}
