import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { DocsShell } from "@/components/docs/DocsShell";
import { getDocCategory, isDocCategoryId } from "@/lib/docs/categories";
import { getDocsByCategory } from "@/lib/docs/loader";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = isDocCategoryId(category) ? getDocCategory(category) : undefined;
  const locale = await getLocale();
  return buildPageMetadata({
    title: cat ? `${cat.title} — Salvya Docs` : "Documentation",
    description: cat?.description ?? "Salvya documentation",
    path: `/docs/${category}`,
    locale,
  });
}

export function generateStaticParams() {
  return ["orders", "creators", "api", "platform", "policies", "glossary", "onboarding"].map((category) => ({
    category,
  }));
}

export default async function DocsCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isDocCategoryId(category)) notFound();
  const cat = getDocCategory(category);
  if (!cat) notFound();
  const articles = getDocsByCategory(category);

  return (
    <DocsShell breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: cat.title }]}>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600/80">{cat.icon}</p>
      <h1 className="mt-2 text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-tight">{cat.title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-neutral-600">{cat.description}</p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {articles.map((a) => (
          <li key={a.path}>
            <Link
              href={a.path}
              className="block rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm hover:border-blue-200"
            >
              <p className="text-[16px] font-semibold text-neutral-950">{a.title}</p>
              <p className="mt-1 text-[13px] text-neutral-500">{a.summary}</p>
              <p className="mt-2 text-[12px] text-neutral-400">{a.readingTimeMinutes} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </DocsShell>
  );
}
