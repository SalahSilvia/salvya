import { describe, expect, it } from "vitest";
import {
  allProductImageUrls,
  isLikelyModelShotUrl,
  slotsFromImageUrls,
  slotsFromStorefrontProduct,
  storefrontBackImageUrl,
  storefrontFrontImageUrl,
  storefrontModelImageUrl,
  storefrontShopCardImageUrl,
} from "@/lib/catalog/storefront-image-slots";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";

describe("storefront-image-slots", () => {
  it("detects model-shoot URLs from path segments", () => {
    expect(isLikelyModelShotUrl("/api/x/models%20shooting%20hoodies/lady-white.png")).toBe(true);
    expect(isLikelyModelShotUrl("/api/x/hoodie-back-black.png")).toBe(false);
  });

  it("classifies flat front and back by filename", () => {
    const urls = [
      "https://cdn/hoodie-front-back-black.png",
      "https://cdn/hoodie-back-black.png",
      "https://cdn/models%20shooting/model.png",
    ];
    const slots = slotsFromImageUrls(urls);
    expect(slots.back).toContain("front-back");
    expect(slots.front).toContain("hoodie-back-black");
    expect(slots.models[0]).toContain("model");
  });

  it("shop card uses back flat lay, not model or front", () => {
    const product = {
      id: "1",
      images: ["https://cdn/models%20shooting/model.png"],
      colors: [
        {
          id: "black",
          name: "Black",
          front: "https://cdn/hoodie-back-black.png",
          back: "https://cdn/hoodie-front-back-black.png",
        },
      ],
    } as unknown as StorefrontProduct;

    expect(allProductImageUrls(product)).toHaveLength(3);
    expect(storefrontBackImageUrl(product)).toContain("front-back");
    expect(storefrontFrontImageUrl(product)).toContain("hoodie-back-black");
    expect(storefrontModelImageUrl(product)).toContain("model");
    expect(storefrontShopCardImageUrl(product)).toContain("front-back");
    expect(storefrontShopCardImageUrl(product)).not.toContain("model");
  });
});
