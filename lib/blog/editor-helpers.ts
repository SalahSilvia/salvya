import { isValidBlogSlug } from "@/lib/blog/slug";
import type { BlogPostStatus } from "@/lib/blog/types";

export type BlogEditorForm = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  bodyMd: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  status: BlogPostStatus;
};

export type PublishCheck = { id: string; label: string; ok: boolean; hint?: string };

export function excerptFromMarkdown(bodyMd: string, max = 280): string {
  const plain = bodyMd
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  return plain.length <= max ? plain : `${plain.slice(0, max - 1)}…`;
}

export function getPublishChecks(form: BlogEditorForm, resolvedSlug: string): PublishCheck[] {
  const slugOk = isValidBlogSlug(resolvedSlug);
  return [
    {
      id: "title",
      label: "Title",
      ok: form.title.trim().length >= 3,
      hint: "At least 3 characters",
    },
    {
      id: "slug",
      label: "URL slug",
      ok: slugOk,
      hint: "Letters, numbers, hyphens (2–80 chars)",
    },
    {
      id: "body",
      label: "Article body",
      ok: form.bodyMd.trim().length >= 40,
      hint: "Write your story in Markdown",
    },
    {
      id: "cover",
      label: "Cover image",
      ok: Boolean(form.coverImage.trim()),
      hint: "Upload or paste a hero image",
    },
    {
      id: "excerpt",
      label: "Excerpt",
      ok: Boolean(form.excerpt.trim() || form.subtitle.trim()),
      hint: "Used on /blog index and link previews",
    },
  ];
}

export function canPublish(form: BlogEditorForm, resolvedSlug: string): boolean {
  return getPublishChecks(form, resolvedSlug).every((c) => c.ok);
}

export type BlogTemplate = {
  id: string;
  label: string;
  description: string;
  bodyMd: string;
  tags: string[];
  featured?: boolean;
};

/** Streetwear / SEO topic outlines — matches Salvya/Blogs folder content style. */
export const BLOG_TOPIC_TEMPLATES: BlogTemplate[] = [
  {
    id: "gen-z-hoodies",
    label: "Gen Z oversized hoodies",
    description: "Trend piece · hoodies & youth culture",
    tags: ["streetwear", "hoodies", "gen-z"],
    featured: true,
    bodyMd: `## Introduction

Why oversized hoodies became the uniform of a generation.

## Comfort as identity

How relaxed silhouettes express freedom and authenticity.

## The future of streetwear

What comes next for minimalist oversized fashion.

---

Explore premium oversized essentials at [Salvya](/shop).
`,
  },
  {
    id: "moroccan-streetwear",
    label: "Moroccan streetwear",
    description: "Culture · Morocco fashion movement",
    tags: ["morocco", "streetwear", "culture"],
    featured: true,
    bodyMd: `## A new generation

How Moroccan youth are defining style on their own terms.

## Local identity, global aesthetic

Blending heritage with minimalist oversized fashion.

## What's next

The rise of independent brands from Morocco to the world.
`,
  },
  {
    id: "style-oversized",
    label: "Style oversized fits",
    description: "How-to · proportions & layering",
    tags: ["styling", "guides", "oversized"],
    bodyMd: `## Start with proportions

Balance one oversized piece with cleaner basics.

## Neutral palettes

Why black, grey, and washed tones look more premium.

## Footwear matters

Anchoring relaxed silhouettes with the right shoes.
`,
  },
  {
    id: "minimal-wardrobe",
    label: "Minimalist wardrobe",
    description: "Capsule · streetwear essentials",
    tags: ["minimalism", "wardrobe", "essentials"],
    bodyMd: `## Fewer, better pieces

Building a wardrobe around quality oversized basics.

## The essential list

Hoodie, tee, cargos, sneakers — and nothing you don't wear.

## Timeless over trendy

Why minimal streetwear ages better than hype cycles.
`,
  },
];

export const BLOG_STARTER_TEMPLATES: BlogTemplate[] = [
  {
    id: "drop",
    label: "Drop story",
    description: "Limited run, dates, and CTA",
    tags: ["drops", "merch"],
    featured: true,
    bodyMd: `## The drop

What ships, when it goes live, and why fans should care.

### Details

- **Opens:** 
- **Closes:** 
- **Ship window:** 

> Quote from the artist or team — one line that sets the tone.

### Shop the drop

[Browse the collection](/shop)
`,
  },
  {
    id: "artist",
    label: "Artist feature",
    description: "Profile, process, and merch link",
    tags: ["artists", "behind-the-scenes"],
    bodyMd: `## Meet the artist

A short intro — sound, city, and what this chapter is about.

### On the merch

What we designed together and how it connects to the music.

### Listen

Embed or link your release here.

---

*Photography and art direction: Salvya*
`,
  },
  {
    id: "news",
    label: "News & update",
    description: "Short announcement",
    tags: ["news"],
    bodyMd: `## What's new

Lead with the news in one or two sentences.

### What this means for you

- Bullet one
- Bullet two

Questions? Reach us at support — we're here for the community.
`,
  },
];

export type MarkdownWrap =
  | "bold"
  | "italic"
  | "h2"
  | "h3"
  | "link"
  | "ul"
  | "quote"
  | "code";

export function wrapMarkdownSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  kind: MarkdownWrap,
): { next: string; cursor: number } {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);

  let wrapped = selected;
  let cursorOffset = 0;

  switch (kind) {
    case "bold":
      wrapped = `**${selected || "bold text"}**`;
      cursorOffset = selected ? wrapped.length : 2;
      break;
    case "italic":
      wrapped = `*${selected || "italic"}*`;
      cursorOffset = selected ? wrapped.length : 1;
      break;
    case "h2":
      wrapped = `## ${selected || "Heading"}`;
      cursorOffset = wrapped.length;
      break;
    case "h3":
      wrapped = `### ${selected || "Subheading"}`;
      cursorOffset = wrapped.length;
      break;
    case "link":
      wrapped = `[${selected || "link text"}](https://)`;
      cursorOffset = selected ? wrapped.length - 1 : wrapped.indexOf("https://") + 8;
      break;
    case "ul":
      wrapped = selected
        ? selected
            .split("\n")
            .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
            .join("\n")
        : "- First point\n- Second point";
      cursorOffset = wrapped.length;
      break;
    case "quote":
      wrapped = selected
        ? selected
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")
        : "> Pull quote or callout";
      cursorOffset = wrapped.length;
      break;
    case "code":
      wrapped = selected.includes("\n") ? `\`\`\`\n${selected || "code"}\n\`\`\`` : `\`${selected || "code"}\``;
      cursorOffset = wrapped.length;
      break;
    default:
      break;
  }

  const next = `${before}${wrapped}${after}`;
  const cursor = selectionStart + (selected ? wrapped.length : cursorOffset);
  return { next, cursor };
}
