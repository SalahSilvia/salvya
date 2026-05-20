import { describe, expect, it } from "vitest";
import { buildAdminProductMagicFill } from "@/lib/admin/product-magic-fill";

describe("product-magic-fill", () => {
  it("fills merchandising, GTIN SKU, sizes, and SEO for a hoodie", () => {
    const fill = buildAdminProductMagicFill({
      artistSlug: "babygang",
      category: "hoodie",
    });
    expect(fill.title).toContain("Hoodie oversize");
    expect(fill.sku).toMatch(/^\d{13}$/);
    expect(fill.sizes).toEqual(["XS", "S", "M", "L", "XL", "2XL"]);
    expect(fill.compareAtEuros).toBe("59");
    expect(fill.colors).toHaveLength(2);
    expect(fill.metaTitle).toBeTruthy();
    expect(fill.description).toContain("BabyGang");
  });

  it("keeps custom title and derives slug", () => {
    const fill = buildAdminProductMagicFill({
      title: "T-shirt oversize .. Art Is Not A Crime II",
      artistSlug: "babygang",
      category: "tee",
    });
    expect(fill.title).toBe("T-shirt oversize .. Art Is Not A Crime II");
    expect(fill.slug).toBe("t-shirt-oversize-art-is-not-a-crime-ii");
    expect(fill.priceEuros).toBe("28");
  });
});
