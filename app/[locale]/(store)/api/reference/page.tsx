import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localePath, resolveSalvyaLocale } from "@/lib/seo/site";

export default async function ApiReferenceRedirectPage() {
  const locale = resolveSalvyaLocale(await getLocale());
  redirect(`${localePath("/developers", locale)}#api`);
}
