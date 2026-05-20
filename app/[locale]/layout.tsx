import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { LocaleDocumentAttributes } from "@/components/i18n/LocaleDocumentAttributes";
import { LocaleProviders } from "@/components/layout/LocaleProviders";
import { JsonLd } from "@/components/seo/JsonLd";
import { isRtlLocale, routing, type AppLocale } from "@/i18n/routing";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { rootSiteMetadata } from "@/lib/seo/metadata";
import { getAcceptLanguage, getRegionalPreferences } from "@/lib/geo/preferences-server";

export const metadata: Metadata = rootSiteMetadata();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Locale shell: providers only. Navigation lives in (store) or (creator) route groups. */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const [regionalPrefs, acceptLanguage] = await Promise.all([
    getRegionalPreferences(),
    getAcceptLanguage(),
  ]);

  const fontClass = isRtlLocale(locale) ? "font-arabic" : "font-sans";

  return (
    <div className={fontClass}>
      <LocaleDocumentAttributes locale={locale} />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(locale)]} />
      <LocaleProviders
        locale={locale as AppLocale}
        messages={messages}
        regionalPrefs={regionalPrefs}
        acceptLanguage={acceptLanguage}
      >
        {children}
      </LocaleProviders>
    </div>
  );
}
