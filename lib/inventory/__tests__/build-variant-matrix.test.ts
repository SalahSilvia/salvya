import { describe, expect, it } from "vitest";
import {
  buildVariantMatrixFromMetadata,
  distributeStockAcrossVariants,
  isPlaceholderVariantSet,
} from "@/lib/inventory/build-variant-matrix";

describe("buildVariantMatrixFromMetadata", () => {
  it("builds size × color grid from metadata", () => {
    const matrix = buildVariantMatrixFromMetadata({
      artistSlug: "elgrandetoto",
      productSlug: "egttoto",
      productStock: 12,
      metadata: {
        sizes: ["S", "M", "L"],
        colors: [
          { id: "black", name: "Black", hex: "#1a1a1a" },
          { id: "white", name: "White", hex: "#f5f5f0" },
        ],
      },
    });

    expect(matrix).toHaveLength(6);
    expect(matrix.some((v) => v.size === "M" && v.color === "black")).toBe(true);
    expect(matrix.some((v) => v.size === "L" && v.color === "white")).toBe(true);
    expect(matrix.reduce((n, v) => n + v.stock, 0)).toBe(12);
  });

  it("uses default sizes when metadata has colors only", () => {
    const matrix = buildVariantMatrixFromMetadata({
      artistSlug: "babygang",
      productSlug: "hoodie-one",
      productStock: 6,
      metadata: {
        colors: [{ id: "black", name: "Black" }],
      },
    });

    expect(matrix).toHaveLength(6);
    expect(new Set(matrix.map((v) => v.color))).toEqual(new Set(["black"]));
  });
});

describe("distributeStockAcrossVariants", () => {
  it("splits stock evenly with remainder", () => {
    expect(distributeStockAcrossVariants(12, 5)).toEqual([3, 3, 2, 2, 2]);
  });
});

describe("isPlaceholderVariantSet", () => {
  it("detects legacy single default variant", () => {
    expect(isPlaceholderVariantSet([{ size: null, color: "default" }])).toBe(true);
    expect(
      isPlaceholderVariantSet([
        { size: "M", color: "black" },
        { size: "L", color: "black" },
      ]),
    ).toBe(false);
  });
});
