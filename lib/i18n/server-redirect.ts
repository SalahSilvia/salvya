import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localePath, type SalvyaLocale } from "@/lib/seo/site";
import { isAppLocale } from "@/i18n/routing";

/** Server Component redirect that preserves the active locale prefix. */
export async function redirectLocalized(path: string): Promise<never> {
  const raw = await getLocale();
  const locale: SalvyaLocale = isAppLocale(raw) ? raw : "en";
  redirect(localePath(path, locale));
}
