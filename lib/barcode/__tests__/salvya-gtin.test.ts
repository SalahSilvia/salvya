import { describe, expect, it } from "vitest";
import {
  buildSalvyaGtin13,
  ean13CheckDigit,
  formatEan13Human,
  formatSalvyaSkuHuman,
  isValidGtin13,
  resolveSalvyaGtin13,
} from "@/lib/barcode/salvya-gtin";

describe("salvya-gtin", () => {
  it("builds stable 13-digit GTIN with valid check digit", () => {
    const a = buildSalvyaGtin13({
      artistSlug: "babygang",
      category: "tee",
      slug: "art-is-not-a-crime-ii-tee",
    });
    const b = buildSalvyaGtin13({
      artistSlug: "babygang",
      category: "tee",
      slug: "art-is-not-a-crime-ii-tee",
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(13);
    expect(isValidGtin13(a)).toBe(true);
    expect(a.startsWith("843701")).toBe(true);
  });

  it("formats human-readable EAN and SKU lines with spacing", () => {
    const gtin = buildSalvyaGtin13({
      artistSlug: "elgrandetoto",
      category: "hoodie",
      slug: "innocente",
    });
    expect(formatEan13Human(gtin)).toMatch(/^\d \d{6} \d{5} \d$/);
    expect(formatSalvyaSkuHuman(gtin)).toMatch(/^8437 · \d{3} · \d{5} · \d$/);
  });

  it("replaces legacy text SKU when artist and slug are known", () => {
    const gtin = resolveSalvyaGtin13({
      sku: "SV-BABYGANG-TEE-ARTISNOTACRIMEII",
      slug: "art-is-not-a-crime-ii-tee",
      artistSlug: "babygang",
      category: "tee",
    });
    expect(gtin).toHaveLength(13);
    expect(isValidGtin13(gtin!)).toBe(true);
  });

  it("computes EAN-13 check digit", () => {
    expect(ean13CheckDigit("400638133393")).toBe("1");
  });
});
