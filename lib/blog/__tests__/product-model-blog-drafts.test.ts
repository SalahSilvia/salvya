import { describe, expect, it } from "vitest";
import { collectProductModelBlogDrafts } from "@/lib/blog/generate-product-model-blog-folders";

describe("product-model-blog-drafts", () => {
  it("finds elgrandetoto pieces with model photography", () => {
    const drafts = collectProductModelBlogDrafts("elgrandetoto");
    expect(drafts.length).toBeGreaterThanOrEqual(9);
    for (const d of drafts) {
      expect(d.slug).toMatch(/^elgrandetoto-[a-z0-9-]+-(hoodie|tee)-on-model-style-guide$/);
      expect(d.coverSourcePath).toMatch(/\.(png|jpe?g|webp)$/i);
      expect(d.modelRelativePath.length).toBeGreaterThan(0);
    }
  });
});
