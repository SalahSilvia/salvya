import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localePath, resolveSalvyaLocale } from "@/lib/seo/site";

export default async function LegacyHelpRedirectPage() {
  const locale = resolveSalvyaLocale(await getLocale());
  redirect(localePath("/help-center", locale));
}
