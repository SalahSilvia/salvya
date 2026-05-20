import type { BlogPost } from "@/lib/blog/types";

/** Slug fragments for product blogs we want leading the shop journal strip. */
const PRIORITIZE_IN_SLUG = ["salgoata"] as const;

/** Default tail — often duplicates the piece-of-the-moment spotlight. */
const DEFAULT_DEPRIORITIZE_IN_SLUG = ["simple-salgoat"] as const;

function rankPost(slug: string, deprioritize: readonly string[]): number {
  const s = slug.toLowerCase();
  if (deprioritize.some((frag) => s.includes(frag))) return 2;
  if (PRIORITIZE_IN_SLUG.some((frag) => s.includes(frag))) return 0;
  return 1;
}

/**
 * Shop journal order: Salgoata (and similar) first, spotlight piece last among duplicates, then newest.
 */
export function sortShopJournalPosts(
  posts: BlogPost[],
  options?: { deprioritizeInSlug?: string[] },
): BlogPost[] {
  const deprioritize = options?.deprioritizeInSlug?.length
    ? options.deprioritizeInSlug
    : DEFAULT_DEPRIORITIZE_IN_SLUG;

  return [...posts].sort((a, b) => {
    const ra = rankPost(a.slug, deprioritize);
    const rb = rankPost(b.slug, deprioritize);
    if (ra !== rb) return ra - rb;

    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}
