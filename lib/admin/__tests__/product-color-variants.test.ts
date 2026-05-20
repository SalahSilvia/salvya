import { describe, expect, it } from "vitest";
import {
  buildColorGalleryMap,
  colorToImageUrls,
  galleryUrlsForColorId,
  hydrateColorVariants,
  primaryProductImages,
} from "@/lib/admin/product-color-variants";
import { parseProductMetadata } from "@/lib/admin/product-metadata";

describe("product-color-variants", () => {
  it("hydrates missing color photos from legacy gallery", () => {
    const colors = hydrateColorVariants([{ name: "Black" }, { name: "White" }], [
      "https://cdn/front.jpg",
      "https://cdn/back.jpg",
    ]);
    expect(colors[0]?.front).toBe("https://cdn/front.jpg");
    expect(colors[1]?.front).toBe("https://cdn/front.jpg");
  });

  it("uses per-color images when present", () => {
    const colors = [
      { name: "Black", front: "https://cdn/black-front.jpg" },
      { name: "White", front: "https://cdn/white-front.jpg" },
    ];
    expect(primaryProductImages(colors, { front: null, back: null, models: [] })[0]).toBe(
      "https://cdn/black-front.jpg",
    );
    const map = buildColorGalleryMap(colors, []);
    expect(galleryUrlsForColorId("white", map, [])[0]).toBe("https://cdn/white-front.jpg");
  });

  it("parses color image fields from metadata", () => {
    const meta = parseProductMetadata({
      colors: [
        {
          name: "Bone",
          hex: "#f5f5f0",
          front: "https://cdn/bone-front.jpg",
          models: ["https://cdn/bone-model.jpg"],
        },
      ],
    });
    expect(colorToImageUrls(meta.colors![0]!)).toEqual([
      "https://cdn/bone-front.jpg",
      "https://cdn/bone-model.jpg",
    ]);
  });
});
