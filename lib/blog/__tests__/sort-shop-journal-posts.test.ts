import { describe, expect, it } from "vitest";
import { sortShopJournalPosts } from "@/lib/blog/sort-shop-journal-posts";
import type { BlogPost } from "@/lib/blog/types";

function post(slug: string, publishedAt: string): BlogPost {
  return {
    id: slug,
    slug,
    title: slug,
    subtitle: "",
    excerpt: "",
    bodyMd: "",
    coverImage: "",
    authorName: "",
    authorRole: "",
    tags: [],
    status: "published",
    featured: false,
    readTimeMinutes: 3,
    seoTitle: "",
    seoDescription: "",
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
  };
}

describe("sortShopJournalPosts", () => {
  it("puts Salgoata before Simple Salgoat", () => {
    const sorted = sortShopJournalPosts([
      post("elgrandetoto-simple-salgoat-hoodie-on-model-style-guide", "2026-05-19T10:00:00Z"),
      post("elgrandetoto-salgoata-hoodie-on-model-style-guide", "2026-05-01T10:00:00Z"),
    ]);
    expect(sorted[0]!.slug).toContain("salgoata");
    expect(sorted[1]!.slug).toContain("simple-salgoat");
  });

  it("deprioritizes spotlight slug when provided", () => {
    const sorted = sortShopJournalPosts(
      [
        post("elgrandetoto-richsalgoat-tee-tee-on-model-style-guide", "2026-05-19T10:00:00Z"),
        post("elgrandetoto-salgoata-tee-tee-on-model-style-guide", "2026-05-18T10:00:00Z"),
      ],
      { deprioritizeInSlug: ["salgoata-tee"] },
    );
    expect(sorted[0]!.slug).toContain("richsalgoat");
  });
});
