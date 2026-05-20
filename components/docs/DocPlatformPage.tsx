import { notFound } from "next/navigation";
import { DocsArticleView } from "@/components/docs/DocsArticleView";
import { getDocByPath } from "@/lib/docs/loader";
import type { DocCategoryId } from "@/lib/docs/types";

export function DocPlatformPage({
  category,
  slug,
  locale,
}: {
  category: DocCategoryId;
  slug: string;
  locale: string;
}) {
  const article = getDocByPath(category, slug);
  if (!article) notFound();
  return <DocsArticleView article={article} locale={locale} />;
}
