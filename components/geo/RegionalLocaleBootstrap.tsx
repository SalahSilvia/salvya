"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** One-time locale align after server geo bootstrap (e.g. Morocco → /fr). */
export function RegionalLocaleBootstrap({ bootstrapLocale }: { bootstrapLocale?: AppLocale }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !bootstrapLocale || bootstrapLocale === locale) return;
    ran.current = true;
    router.replace(pathname, { locale: bootstrapLocale });
  }, [bootstrapLocale, locale, pathname, router]);

  return null;
}
