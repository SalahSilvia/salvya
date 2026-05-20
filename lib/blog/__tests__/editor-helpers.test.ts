import { describe, expect, it } from "vitest";
import { canPublish, excerptFromMarkdown, getPublishChecks, wrapMarkdownSelection } from "@/lib/blog/editor-helpers";

describe("editor-helpers", () => {
  it("builds excerpt from markdown", () => {
    const ex = excerptFromMarkdown("## Hello\n\nThis is **bold** and a [link](https://x.com).");
    expect(ex).toContain("Hello");
    expect(ex).toContain("bold");
    expect(ex).not.toContain("##");
  });

  it("wraps selection as bold", () => {
    const { next, cursor } = wrapMarkdownSelection("hello world", 6, 11, "bold");
    expect(next).toBe("hello **world**");
    expect(cursor).toBeGreaterThan(6);
  });

  it("publish checks require cover for publish", () => {
    const checks = getPublishChecks(
      {
        slug: "my-post",
        title: "My Post Title",
        subtitle: "",
        excerpt: "Short",
        bodyMd: "x".repeat(50),
        coverImage: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft",
      },
      "my-post",
    );
    expect(canPublish(
      {
        slug: "my-post",
        title: "My Post Title",
        subtitle: "",
        excerpt: "Short",
        bodyMd: "x".repeat(50),
        coverImage: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft",
      },
      "my-post",
    )).toBe(false);
    expect(checks.find((c) => c.id === "cover")?.ok).toBe(false);
  });
});
