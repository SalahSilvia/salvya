"use client";

import { useEffect } from "react";
import { isRtlLocale } from "@/i18n/routing";

type Props = {
  locale: string;
};

/** Sets `lang` and `dir` on `<html>` for the active storefront locale. */
export function LocaleDocumentAttributes({ locale }: Props) {
  const rtl = isRtlLocale(locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = rtl ? "rtl" : "ltr";
  }, [locale, rtl]);

  return null;
}
