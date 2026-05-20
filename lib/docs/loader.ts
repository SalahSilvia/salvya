import "server-only";

import fs from "fs";
import path from "path";
import { isDocCategoryId } from "@/lib/docs/categories";
import { parseFrontmatter } from "@/lib/docs/frontmatter";
import { extractHeadings } from "@/lib/docs/markdown";
import { estimateReadingTimeMinutes } from "@/lib/docs/reading-time";
import type { DocArticle, DocArticleMeta, DocCategoryId } from "@/lib/docs/types";
import type { SalvyaLocale } from "@/lib/seo/site";

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

function toStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function metaFromData(data: Record<string, unknown>, category: DocCategoryId, slug: string): DocArticleMeta {
  const related = toStringArray(data.related);
  const relatedPaths = related.map((r) => (r.startsWith("/") ? r : `/docs/${category}/${r}`));
  return {
    category,
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    summary: String(data.summary ?? data.description ?? ""),
    aiSummary: String(data.aiSummary ?? data.summary ?? data.description ?? ""),
    keyPoints: toStringArray(data.keyPoints),
    tags: toStringArray(data.tags),
    related,
    relatedPaths,
    draft: data.draft === true,
    locales: toStringArray(data.locales).length
      ? (toStringArray(data.locales) as SalvyaLocale[])
      : undefined,
    priority: typeof data.priority === "number" ? data.priority : undefined,
    changeFrequency: (data.changeFrequency as DocArticleMeta["changeFrequency"]) ?? "monthly",
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    entities: data.entities
      ? {
          creators: toStringArray((data.entities as Record<string, unknown>).creators),
          products: toStringArray((data.entities as Record<string, unknown>).products),
          policies: toStringArray((data.entities as Record<string, unknown>).policies),
          apis: toStringArray((data.entities as Record<string, unknown>).apis),
        }
      : undefined,
  };
}

function parseDocFile(filePath: string, category: DocCategoryId, slug: string): DocArticle | null {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const meta = metaFromData(data, category, slug);
  if (meta.draft && process.env.NODE_ENV === "production") return null;
  const headings = extractHeadings(body);
  return {
    ...meta,
    body,
    path: `/docs/${category}/${slug}`,
    readingTimeMinutes: estimateReadingTimeMinutes(body),
    headings,
  };
}

function walkCategoryDir(categoryDir: string, category: DocCategoryId): DocArticle[] {
  if (!fs.existsSync(categoryDir)) return [];
  const articles: DocArticle[] = [];
  for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const slug = entry.name.replace(/\.md$/, "");
    const parsed = parseDocFile(path.join(categoryDir, entry.name), category, slug);
    if (parsed) articles.push(parsed);
  }
  return articles;
}

let cache: DocArticle[] | null = null;

export function getAllDocs(): DocArticle[] {
  if (cache) return cache;
  if (!fs.existsSync(DOCS_ROOT)) {
    cache = [];
    return cache;
  }
  const articles: DocArticle[] = [];
  for (const entry of fs.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!isDocCategoryId(entry.name)) continue;
    articles.push(...walkCategoryDir(path.join(DOCS_ROOT, entry.name), entry.name));
  }
  articles.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  cache = articles;
  return cache;
}

export function invalidateDocsCache() {
  cache = null;
}

export function getDocByPath(category: string, slug: string): DocArticle | null {
  if (!isDocCategoryId(category)) return null;
  const file = path.join(DOCS_ROOT, category, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return parseDocFile(file, category, slug);
}

export function getDocsByCategory(category: DocCategoryId): DocArticle[] {
  return getAllDocs().filter((d) => d.category === category);
}

export function getRelatedDocs(article: DocArticle, limit = 4): DocArticle[] {
  const all = getAllDocs();
  const paths = new Set(article.relatedPaths ?? article.related.map((r) => `/docs/${article.category}/${r}`));
  const byPath = all.filter((d) => paths.has(d.path));
  if (byPath.length >= limit) return byPath.slice(0, limit);
  const tagSet = new Set(article.tags);
  const scored = all
    .filter((d) => d.path !== article.path)
    .map((d) => {
      let s = 0;
      if (d.category === article.category) s += 3;
      d.tags.forEach((t) => {
        if (tagSet.has(t)) s += 2;
      });
      return { d, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  const merged = [...byPath, ...scored.map((x) => x.d).filter((d) => !byPath.some((b) => b.path === d.path))];
  return merged.slice(0, limit);
}

export function getAllDocStaticParams(): Array<{ category: string; slug: string }> {
  return getAllDocs().map((d) => ({ category: d.category, slug: d.slug }));
}
