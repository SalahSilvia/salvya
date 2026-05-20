import { describe, expect, it } from "vitest";
import {
  collectBlogFolderImports,
  parseBlogSeoFile,
  listBlogImportFolders,
} from "@/lib/blog/blog-folder-import";
import { salvyaBlogsRoot } from "@/lib/salvya-paths";

describe("blog-folder-import", () => {
  it("parses SEO meta files", () => {
    const seo = parseBlogSeoFile(`SEO Title
Why Oversized Hoodies Became the Face of Gen Z Fashion | Salvya

Meta Description
Discover why oversized hoodies dominate Gen Z fashion in 2026.

Slug
/blog/why-oversized-hoodies-became-the-face-of-gen-z-fashion`);
    expect(seo.slug).toBe("why-oversized-hoodies-became-the-face-of-gen-z-fashion");
    expect(seo.seoTitle).toContain("Gen Z");
    expect(seo.metaDescription).toContain("2026");
  });

  it("finds blog folders on disk", () => {
    const folders = listBlogImportFolders(salvyaBlogsRoot());
    expect(folders.length).toBeGreaterThanOrEqual(18);
  });

  it("imports all posts with cover images", () => {
    const root = salvyaBlogsRoot();
    const folders = listBlogImportFolders(root);
    const missing = folders.filter((f) => !collectBlogFolderImports(root).some((r) => r.folderName === f));
    expect(missing, `failed folders: ${missing.join(", ")}`).toEqual([]);
    const rows = collectBlogFolderImports(root);
    expect(rows.length).toBe(folders.length);
    for (const row of rows) {
      expect(row.slug).toMatch(/^[a-z0-9-]+$/);
      expect(row.coverImagePath).toMatch(/\.(png|jpe?g|webp)$/i);
      expect(row.bodyMd.length).toBeGreaterThan(200);
      expect(row.readTimeMinutes).toBeGreaterThan(0);
    }
  });
});
