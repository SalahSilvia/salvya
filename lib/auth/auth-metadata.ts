import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";
import { resolveSalvyaLocale, type SalvyaLocale } from "@/lib/seo/site";

type AuthPage = "login" | "register";

export async function buildAuthPageMetadata(
  locale: string | undefined,
  page: AuthPage,
): Promise<Metadata> {
  const loc = resolveSalvyaLocale(locale) as SalvyaLocale;
  const t = await getTranslations({ locale: loc, namespace: "auth" });

  const path = page === "login" ? "/login" : "/register";
  const title = page === "login" ? t("signInTitle") : t("createAccountTitle");
  const description = page === "login" ? t("signInDescription") : t("createAccountDescription");

  return buildPrivatePageMetadata({
    title,
    description,
    path,
    locale: loc,
  });
}
