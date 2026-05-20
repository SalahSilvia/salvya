import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { DocsArticleView } from "@/components/docs/DocsArticleView";
import { getAllDocStaticParams, getDocByPath } from "@/lib/docs/loader";
import { isDocCategoryId } from "@/lib/docs/categories";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug, locale } = await params;
  if (!isDocCategoryId(category)) {
    return buildPageMetadata({ title: "Not found", description: "", path: "/docs", locale });
  }
  const article = getDocByPath(category, slug);
  if (!article) {
    return buildPageMetadata({ title: "Not found", description: "", path: `/docs/${category}/${slug}`, locale });
  }
  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: article.path,
    locale,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    tags: article.tags,
    keywords: article.tags,
  });
}

export function generateStaticParams() {
  return getAllDocStaticParams();
}

export default async function DocArticlePage({ params }: Props) {
  const { category, slug, locale } = await params;
  if (!isDocCategoryId(category)) notFound();
  const article = getDocByPath(category, slug);
  if (!article) notFound();
  return <DocsArticleView article={article} locale={locale} />;
}
