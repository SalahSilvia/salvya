import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localePath, resolveSalvyaLocale } from "@/lib/seo/site";

/** API docs hub — canonical developer portal. */
export default async function ApiDocsRedirectPage() {
  const locale = resolveSalvyaLocale(await getLocale());
  redirect(localePath("/developers", locale));
}
