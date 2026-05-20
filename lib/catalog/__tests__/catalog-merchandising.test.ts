import { describe, expect, it } from "vitest";
import { catalogImportRowFixture } from "@/lib/catalog/__tests__/catalog-test-fixtures";
import { buildCatalogMerchandising } from "@/lib/catalog/catalog-merchandising-defaults";
import { enrichCatalogImportRow } from "@/lib/catalog/catalog-smart-enrich";

describe("catalog-merchandising", () => {
  it("fills SKU, compare-at, sizes, shipping, care, and SEO", () => {
    const row = catalogImportRowFixture({
      importKey: "babygang|tee|art-is-not-a-crime-ii",
      artistSlug: "babygang",
      slug: "art-is-not-a-crime-ii-tee",
      title: "T-shirt oversize .. Art Is Not A Crime II",
      priceCents: 1750,
      metadata: { folderName: "Art Is Not A Crime II", colors: [{ name: "Black", id: "black" }] },
    });

    const merch = buildCatalogMerchandising(row, "Art Is Not A Crime II", [{ name: "Black", id: "black" }]);
    expect(merch.metadata.sku).toMatch(/^\d{13}$/);
    expect(merch.metadata.compareAtCents).toBe(5900);
    expect(merch.metadata.sizes).toEqual(["XS", "S", "M", "L", "XL", "2XL"]);
    expect(merch.metadata.material).toContain("cotton");
    expect(merch.metadata.sizeFit).toContain("Oversized");
    expect(merch.metadata.shippingNote).toContain("3–5 business days");
    expect(merch.metadata.careInstructions).toContain("Machine wash");
    expect(merch.metadata.maxPerOrder).toBe(2);
    expect(merch.metadata.metaTitle).toContain("Art Is Not A Crime II");
    expect(merch.metadata.metaDescription).toContain("BabyGang");
    expect(merch.description).toContain("BabyGang");
  });

  it("sets Limited badge for limited-drop artists", () => {
    const row = catalogImportRowFixture({
      importKey: "babygang|hoodie|test",
      source: "folder_hoodie",
      category: "hoodie",
      artistSlug: "babygang",
      slug: "test",
      title: "Hoodie oversize .. Test",
      priceCents: 2500,
      isLimitedDrop: true,
      metadata: { folderName: "Test" },
    });
    const enriched = enrichCatalogImportRow(row);
    expect(enriched.metadata.badge).toBe("Limited");
  });
});
