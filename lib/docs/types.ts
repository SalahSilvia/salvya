import type { SalvyaLocale } from "@/lib/seo/site";

export type DocCategoryId =
  | "orders"
  | "creators"
  | "api"
  | "platform"
  | "policies"
  | "glossary"
  | "onboarding";

export type DocArticleMeta = {
  category: DocCategoryId;
  slug: string;
  title: string;
  description: string;
  /** Short human summary (also used in cards). */
  summary: string;
  /** AI/crawler-optimized explanation block. */
  aiSummary: string;
  keyPoints: string[];
  tags: string[];
  related: string[];
  /** Related doc paths e.g. /docs/orders/tracking */
  relatedPaths?: string[];
  draft?: boolean;
  locales?: SalvyaLocale[];
  priority?: number;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  publishedAt?: string;
  updatedAt?: string;
  /** Entity graph: creator slugs, product ids, policy paths */
  entities?: {
    creators?: string[];
    products?: string[];
    policies?: string[];
    apis?: string[];
  };
};

export type DocArticle = DocArticleMeta & {
  body: string;
  path: string;
  readingTimeMinutes: number;
  headings: DocHeading[];
};

export type DocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type DocCategory = {
  id: DocCategoryId;
  title: string;
  description: string;
  icon: string;
};

export type DocSearchResult = {
  kind: "doc" | "faq" | "help-topic" | "api" | "policy";
  id: string;
  title: string;
  snippet: string;
  href: string;
  score: number;
  citation?: string;
};
