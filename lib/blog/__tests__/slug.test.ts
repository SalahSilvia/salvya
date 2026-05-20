import { describe, expect, it } from "vitest";
import { isValidBlogSlug, slugifyBlogTitle } from "@/lib/blog/slug";

describe("blog slug", () => {
  it("slugifies titles", () => {
    expect(slugifyBlogTitle("Hello World!")).toBe("hello-world");
  });

  it("validates slug format", () => {
    expect(isValidBlogSlug("hello-world")).toBe(true);
    expect(isValidBlogSlug("a")).toBe(false);
  });
});
