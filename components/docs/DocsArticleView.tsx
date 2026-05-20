import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { DocsMarkdown } from "@/lib/docs/markdown";
import { getRelatedDocs } from "@/lib/docs/loader";
import { docPageJsonLdGraph } from "@/lib/docs/seo";
import type { DocArticle } from "@/lib/docs/types";
import { DocsReadingProgress } from "@/components/docs/DocsReadingProgress";
import { DocsToc } from "@/components/docs/DocsToc";
import { DocsShell } from "@/components/docs/DocsShell";

export function DocsArticleView({ article, locale }: { article: DocArticle; locale: string }) {
  const related = getRelatedDocs(article, 4);

  return (
    <>
      <JsonLd data={docPageJsonLdGraph(article, locale)} />
      <DocsReadingProgress />
      <DocsShell
        breadcrumbs={[
          { label: "Docs", href: "/docs" },
          { label: article.category, href: `/docs/${article.category}` },
          { label: article.title },
        ]}
      >
        <div className="lg:grid lg:grid-cols-[1fr_16rem] lg:gap-12">
          <article>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600/80">{article.category}</p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.04em]">{article.title}</h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-neutral-600">{article.summary}</p>
            <p className="mt-2 text-[13px] text-neutral-400">
              {article.readingTimeMinutes} min read
              {article.updatedAt ? ` · Updated ${article.updatedAt}` : null}
            </p>

            <section
              className="mt-8 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-5"
              aria-label="AI summary"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700/80">AI explanation</p>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-700">{article.aiSummary}</p>
              {article.keyPoints.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {article.keyPoints.map((point) => (
                    <li key={point} className="flex gap-2 text-[13px] text-neutral-700">
                      <span className="text-blue-600" aria-hidden>
                        •
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <div className="prose-salvya mt-10 max-w-none">
              <DocsMarkdown markdown={article.body} theme="light" headingIds />
            </div>

            {related.length > 0 ? (
              <section className="mt-14 border-t border-neutral-200/80 pt-8" aria-labelledby="related-docs">
                <h2 id="related-docs" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
                  Related articles
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.path}>
                      <Link
                        href={r.path}
                        className="block rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm hover:border-blue-200"
                      >
                        <p className="text-[14px] font-semibold text-neutral-950">{r.title}</p>
                        <p className="mt-1 text-[12px] text-neutral-500">{r.summary}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>

          <aside className="mt-10 lg:mt-0">
            <DocsToc headings={article.headings} />
          </aside>
        </div>
      </DocsShell>
    </>
  );
}
