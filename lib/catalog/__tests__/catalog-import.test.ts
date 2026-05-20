import { describe, expect, it } from "vitest";
import { folderNameToProductSlug, previewCatalogImport } from "@/lib/catalog/catalog-import";

describe("catalog-import", () => {
  it("slugifies folder names for PDP URLs", () => {
    expect(folderNameToProductSlug("Simple Salgoat", "hoodie")).toBe("simple-salgoat");
    expect(folderNameToProductSlug("Simple Salgoat", "tee")).toBe("simple-salgoat-tee");
    expect(folderNameToProductSlug("DROP_01", "hoodie")).toBe("drop-01");
  });

  it("preview reports structure", () => {
    const preview = previewCatalogImport();
    expect(preview.total).toBeGreaterThanOrEqual(0);
    expect(typeof preview.byArtist).toBe("object");
    expect(typeof preview.byCategory).toBe("object");
  });
});
