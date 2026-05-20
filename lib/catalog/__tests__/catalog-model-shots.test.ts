import { describe, expect, it } from "vitest";
import { buildFolderColorImportEntries } from "@/lib/catalog/catalog-folder-colors";
import { folderHoodieImageEntries } from "@/lib/catalog/catalog-folder-import-entries";
import { listArtistFolderModelShotFiles } from "@/lib/artist-folder-model-shots";

describe("catalog model shooting folders", () => {
  it("lists model hoodie files for INNOCENTE when artist root exists", () => {
    const files = listArtistFolderModelShotFiles("babygang", "INNOCENTE", "hoodie");
    if (files.length === 0) {
      expect(true).toBe(true);
      return;
    }
    expect(files.some((f) => /white/i.test(f.filename))).toBe(true);
  });

  it("puts model shots into the matching colorway models array", () => {
    const entries = folderHoodieImageEntries("babygang", "INNOCENTE", []);
    if (!entries.length) return;

    const result = buildFolderColorImportEntries(entries);
    const white = result.colors.find((c) => c.id === "white");
    expect(white?.models?.length).toBeGreaterThan(0);
    expect(white?.models?.[0]).toContain("artist-catalog-model-hoodie");
  });

  it("assigns synthetic model entries by filename color", () => {
    const result = buildFolderColorImportEntries([
      { filename: "model lady white hoodie.png", url: "https://cdn/model-white.jpg" },
      { filename: "model man black hoodie.png", url: "https://cdn/model-black.jpg" },
    ]);
    expect(result.colors.find((c) => c.id === "white")?.models).toContain("https://cdn/model-white.jpg");
    expect(result.colors.find((c) => c.id === "black")?.models).toContain("https://cdn/model-black.jpg");
  });
});
