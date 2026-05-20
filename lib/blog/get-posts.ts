import { rowToBlogPost, type BlogPost, type SalvyaBlogRow } from "@/lib/blog/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

const PUBLIC_SELECT =
  "id, slug, title, subtitle, excerpt, body_md, cover_image, author_name, author_role, tags, status, featured, read_time_minutes, seo_title, seo_description, published_at, created_at, updated_at";

const PRODUCT_MODEL_SLUG_SUFFIX = "-on-model-style-guide";

/** Editorials generated from catalog on-model photography (one post per piece). */
export function isProductModelBlogPost(post: Pick<BlogPost, "slug" | "tags">): boolean {
  if (post.slug.includes(PRODUCT_MODEL_SLUG_SUFFIX)) return true;
  return post.tags.includes("on-model") && post.tags.includes("product");
}

export async function getPublishedBlogPosts(limit = 50): Promise<BlogPost[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("salvya_blog_posts")
    .select(PUBLIC_SELECT)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return [];
    return [];
  }

  return (data as SalvyaBlogRow[]).map(rowToBlogPost);
}

/** Home / shop journal — only item on-model stories, newest first. */
export async function getPublishedProductModelBlogPosts(limit = 10): Promise<BlogPost[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("salvya_blog_posts")
    .select(PUBLIC_SELECT)
    .eq("status", "published")
    .ilike("slug", `%${PRODUCT_MODEL_SLUG_SUFFIX}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!error && data?.length) {
    return (data as SalvyaBlogRow[]).map(rowToBlogPost);
  }

  const fallback = await getPublishedBlogPosts(limit * 4);
  return fallback.filter(isProductModelBlogPost).slice(0, limit);
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = slug.trim().toLowerCase();
  const client = getSupabasePublicServerClient();
  if (!client) return null;

  const { data, error } = await client
    .from("salvya_blog_posts")
    .select(PUBLIC_SELECT)
    .eq("slug", normalized)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return rowToBlogPost(data as SalvyaBlogRow);
}

export async function getRelatedBlogPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await getPublishedBlogPosts(limit + 5);
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
