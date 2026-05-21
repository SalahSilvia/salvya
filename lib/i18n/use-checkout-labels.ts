"use client";

import { useTranslations } from "next-intl";

/** Shared checkout copy for large wizard components. */
export function useCheckoutLabels() {
  const t = useTranslations("checkout");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("product");
  return { t, tAuth, tCommon, tProduct };
}
