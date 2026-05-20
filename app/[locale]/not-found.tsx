"use client";

import { useParams } from "next/navigation";
import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { defaultLocale, isAppLocale } from "@/i18n/routing";

/**
 * Next.js does not always pass `params` into `not-found.tsx` (it can be undefined).
 * Resolve locale from the URL segment when available.
 */
export default function LocaleNotFoundPage() {
  const params = useParams();
  const raw = params?.locale;
  const locale = typeof raw === "string" && isAppLocale(raw) ? raw : defaultLocale;
  return <SalvyaErrorPage variant="notFound" locale={locale} />;
}
