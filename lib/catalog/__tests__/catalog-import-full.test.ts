import { describe, expect, it } from "vitest";
import { collectCatalogImportRows, previewCatalogImport } from "@/lib/catalog/catalog-import";

describe("full catalog import", () => {
  it("collects folder products with images and color metadata", () => {
    const preview = previewCatalogImport();
    const rows = collectCatalogImportRows();

    expect(preview.total).toBe(rows.length);
    expect(rows.length).toBeGreaterThan(0);

    const withColors = rows.filter((r) => {
      const colors = (r.metadata as { colors?: unknown[] }).colors;
      return Array.isArray(colors) && colors.length > 0;
    });
    expect(withColors.length).toBeGreaterThan(0);

    const withModels = rows.filter((r) => {
      const colors = (r.metadata as { colors?: { models?: string[] }[] }).colors;
      return colors?.some((c) => (c.models?.length ?? 0) > 0);
    });
    expect(withModels.length).toBeGreaterThan(0);
  });
});
