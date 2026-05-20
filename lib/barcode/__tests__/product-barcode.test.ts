import { describe, expect, it } from "vitest";
import {
  barcodePngFileName,
  formatBarcodeDisplayText,
  resolveProductBarcodeValue,
} from "@/lib/barcode/product-barcode";
import { buildSalvyaGtin13 } from "@/lib/barcode/salvya-gtin";

describe("product-barcode", () => {
  it("resolves GTIN from product context", () => {
    const gtin = resolveProductBarcodeValue({
      sku: "SV-OLD",
      slug: "innocente-tee",
      artistSlug: "babygang",
      category: "tee",
    });
    expect(gtin).toHaveLength(13);
    expect(formatBarcodeDisplayText(gtin!)).toMatch(/ \d{6} \d{5} /);
  });

  it("uses stored GTIN when valid", () => {
    const stored = buildSalvyaGtin13({
      artistSlug: "inkonnu",
      category: "hoodie",
      slug: "test-hoodie",
    });
    expect(resolveProductBarcodeValue({ sku: stored })).toBe(stored);
  });

  it("builds numeric png filenames", () => {
    const gtin = buildSalvyaGtin13({
      artistSlug: "tchubi",
      category: "tee",
      slug: "x",
    });
    expect(barcodePngFileName({ sku: gtin })).toBe(`barcode-${gtin}.png`);
  });
});
