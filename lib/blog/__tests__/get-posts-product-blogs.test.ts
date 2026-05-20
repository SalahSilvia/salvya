import { describe, expect, it } from "vitest";
import { isProductModelBlogPost } from "@/lib/blog/get-posts";

describe("isProductModelBlogPost", () => {
  it("matches generated product editorials by slug", () => {
    expect(
      isProductModelBlogPost({
        slug: "elgrandetoto-simple-salgoat-hoodie-on-model-style-guide",
        tags: [],
      }),
    ).toBe(true);
  });

  it("rejects general SEO articles", () => {
    expect(
      isProductModelBlogPost({
        slug: "eu-streetwear-shipping-guide-hoodies-tees",
        tags: ["shipping"],
      }),
    ).toBe(false);
  });
});
