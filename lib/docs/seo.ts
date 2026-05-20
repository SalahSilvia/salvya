import type { DocArticle } from "@/lib/docs/types";
import { breadcrumbJsonLd, compactJsonLd } from "@/lib/seo/json-ld";
import { localizedAbsoluteUrl, resolveSalvyaLocale, type SalvyaLocale } from "@/lib/seo/site";

export function techArticleJsonLd(article: DocArticle, locale?: string | SalvyaLocale) {
  const l = resolveSalvyaLocale(locale);
  const url = localizedAbsoluteUrl(article.path, l);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    abstract: article.aiSummary,
    url,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    timeRequired: `PT${article.readingTimeMinutes}M`,
    inLanguage: l,
    keywords: article.tags.join(", "),
    isPartOf: { "@type": "WebSite", url: localizedAbsoluteUrl("/", l) },
    publisher: { "@id": `${localizedAbsoluteUrl("/", l).replace(/\/en\/?$/, "")}/#organization` },
  });
}

export function docBreadcrumbJsonLd(article: DocArticle, locale?: string | SalvyaLocale) {
  return breadcrumbJsonLd(
    [
      { name: "Docs", path: "/docs" },
      { name: article.category, path: `/docs/${article.category}` },
      { name: article.title, path: article.path },
    ],
    locale,
  );
}

export function docFaqFromKeyPointsJsonLd(article: DocArticle, locale?: string | SalvyaLocale) {
  if (!article.keyPoints.length) return null;
  const l = resolveSalvyaLocale(locale);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.keyPoints.slice(0, 6).map((point) => ({
      "@type": "Question",
      name: point,
      acceptedAnswer: {
        "@type": "Answer",
        text: article.aiSummary,
      },
    })),
    url: localizedAbsoluteUrl(article.path, l),
  });
}

export function docPageJsonLdGraph(article: DocArticle, locale?: string | SalvyaLocale) {
  const nodes = [techArticleJsonLd(article, locale), docBreadcrumbJsonLd(article, locale)];
  const faq = docFaqFromKeyPointsJsonLd(article, locale);
  if (faq) nodes.push(faq);
  return nodes;
}
