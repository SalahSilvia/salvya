import { HELP_FAQS, HELP_TOPICS } from "@/lib/help-center/topics";
import { FAQ_PATH, HELP_CENTER_PATH } from "@/lib/help-center/content";
import { breadcrumbJsonLd, compactJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { localizedAbsoluteUrl, resolveSalvyaLocale, type SalvyaLocale } from "@/lib/seo/site";

export function helpCenterFaqJsonLd(locale?: string | SalvyaLocale) {
  const l = resolveSalvyaLocale(locale);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HELP_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
    url: localizedAbsoluteUrl(HELP_CENTER_PATH, l),
  });
}

export function helpCenterWebPageJsonLd(locale?: string | SalvyaLocale) {
  const l = resolveSalvyaLocale(locale);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Salvya Help Center",
    description:
      "Documentation, guides, developer APIs, creator tools, onboarding flows, policies, and AI-readable platform knowledge.",
    url: localizedAbsoluteUrl(HELP_CENTER_PATH, l),
    isPartOf: { "@id": `${localizedAbsoluteUrl("/", l).replace(/\/en\/?$/, "")}/#website` },
    about: {
      "@type": "Thing",
      name: "Salvya creator-commerce platform",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: HELP_TOPICS.length,
      itemListElement: HELP_TOPICS.slice(0, 30).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        url: t.href.startsWith("/") ? localizedAbsoluteUrl(t.href, l) : t.href,
      })),
    },
  });
}

export function helpCenterBreadcrumbJsonLd(locale?: string | SalvyaLocale) {
  return breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Help Center", path: HELP_CENTER_PATH },
    ],
    locale,
  );
}

export function helpCenterJsonLdGraph(locale?: string | SalvyaLocale) {
  return [
    organizationJsonLd(),
    websiteJsonLd(locale),
    helpCenterBreadcrumbJsonLd(locale),
    helpCenterWebPageJsonLd(locale),
    helpCenterFaqJsonLd(locale),
  ];
}

export function faqPageFaqJsonLd(locale?: string | SalvyaLocale) {
  const l = resolveSalvyaLocale(locale);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "Salvya FAQ",
    description: "Frequently asked questions for customers, creators, and developers on Salvya.",
    mainEntity: HELP_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
    url: localizedAbsoluteUrl(FAQ_PATH, l),
  });
}

export function faqPageBreadcrumbJsonLd(locale?: string | SalvyaLocale) {
  return breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Help Center", path: HELP_CENTER_PATH },
      { name: "FAQ", path: FAQ_PATH },
    ],
    locale,
  );
}

export function faqPageWebPageJsonLd(locale?: string | SalvyaLocale) {
  const l = resolveSalvyaLocale(locale);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Salvya FAQ",
    description: "Frequently asked questions for customers, creators, and developers.",
    url: localizedAbsoluteUrl(FAQ_PATH, l),
    isPartOf: { "@id": `${localizedAbsoluteUrl("/", l).replace(/\/en\/?$/, "")}/#website` },
  });
}

export function faqPageJsonLdGraph(locale?: string | SalvyaLocale) {
  return [organizationJsonLd(), websiteJsonLd(locale), faqPageBreadcrumbJsonLd(locale), faqPageWebPageJsonLd(locale), faqPageFaqJsonLd(locale)];
}
