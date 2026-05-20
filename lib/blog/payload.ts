import { estimateReadTimeMinutes } from "@/lib/blog/read-time";
import { isValidBlogSlug, slugifyBlogTitle } from "@/lib/blog/slug";
import { parseBlogStatus, type BlogPostStatus, type SalvyaBlogRow } from "@/lib/blog/types";

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean)
      .slice(0, 12);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  return [];
}

export function sanitizeBlogPayload(
  body: Record<string, unknown>,
  opts: { mode: "create" | "update"; existingSlug?: string },
): { ok: true; row: Omit<SalvyaBlogRow, "id" | "created_at" | "updated_at"> } | { ok: false; error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { ok: false, error: "Title is required." };

  let slug =
    opts.mode === "update" && opts.existingSlug
      ? opts.existingSlug
      : typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : slugifyBlogTitle(title);

  slug = slug.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  if (!isValidBlogSlug(slug)) {
    return { ok: false, error: "Slug must be 2–80 characters (letters, numbers, hyphens)." };
  }

  const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim().slice(0, 300) : "";
  const excerpt =
    typeof body.excerpt === "string"
      ? body.excerpt.trim().slice(0, 500)
      : typeof body.subtitle === "string"
        ? body.subtitle.trim().slice(0, 280)
        : "";
  const bodyMd = typeof body.bodyMd === "string" ? body.bodyMd : typeof body.body_md === "string" ? body.body_md : "";
  const status = parseBlogStatus(body.status);
  if (!bodyMd.trim() && status === "published") {
    return { ok: false, error: "Post body is required to publish." };
  }

  const coverImage =
    typeof body.coverImage === "string"
      ? body.coverImage.trim()
      : typeof body.cover_image === "string"
        ? body.cover_image.trim()
        : "";
  if (!coverImage && status === "published") {
    return { ok: false, error: "Cover image is required to publish (upload or paste URL)." };
  }

  const authorName =
    typeof body.authorName === "string"
      ? body.authorName.trim().slice(0, 80)
      : typeof body.author_name === "string"
        ? body.author_name.trim().slice(0, 80)
        : "Salvya";
  const authorRole =
    typeof body.authorRole === "string"
      ? body.authorRole.trim().slice(0, 80)
      : typeof body.author_role === "string"
        ? body.author_role.trim().slice(0, 80)
        : "";

  const featured = body.featured === true;
  const tags = parseTags(body.tags);

  const readTimeMinutes =
    typeof body.readTimeMinutes === "number" && Number.isFinite(body.readTimeMinutes)
      ? Math.max(1, Math.min(120, Math.floor(body.readTimeMinutes)))
      : estimateReadTimeMinutes(bodyMd);

  const seoTitle =
    typeof body.seoTitle === "string"
      ? body.seoTitle.trim().slice(0, 120)
      : typeof body.seo_title === "string"
        ? body.seo_title.trim().slice(0, 120)
        : title.slice(0, 120);
  const seoDescription =
    typeof body.seoDescription === "string"
      ? body.seoDescription.trim().slice(0, 320)
      : typeof body.seo_description === "string"
        ? body.seo_description.trim().slice(0, 320)
        : excerpt.slice(0, 320);

  let publishedAt: string | null = null;
  const pubRaw = body.publishedAt ?? body.published_at;
  if (typeof pubRaw === "string" && pubRaw.trim()) {
    const d = new Date(pubRaw);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }

  if (status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }
  if (status !== "published") {
    publishedAt = status === "draft" ? publishedAt : publishedAt;
  }

  return {
    ok: true,
    row: {
      slug,
      title,
      subtitle,
      excerpt: excerpt || title.slice(0, 200),
      body_md: bodyMd,
      cover_image: coverImage,
      author_name: authorName || "Salvya",
      author_role: authorRole,
      tags,
      status,
      featured,
      read_time_minutes: readTimeMinutes,
      seo_title: seoTitle || title,
      seo_description: seoDescription || excerpt,
      published_at: publishedAt,
    },
  };
}

export function statusLabel(status: BlogPostStatus): string {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}
