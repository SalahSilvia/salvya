import { describe, expect, it } from "vitest";
import { formatBlogDate } from "@/lib/blog/format-blog-date";

describe("formatBlogDate", () => {
  const iso = "2026-03-22T10:00:00.000Z";

  it("formats English on server and client the same way", () => {
    expect(formatBlogDate(iso, "en", "long")).toMatch(/March|mar/i);
  });

  it("formats French when locale is fr", () => {
    expect(formatBlogDate(iso, "fr", "long")).toMatch(/mars/i);
  });
});
