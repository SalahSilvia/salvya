import { describe, expect, it } from "vitest";
import { mergeProductImages, splitProductImages } from "@/lib/admin/product-images";

describe("product-images", () => {
  it("splits and merges gallery order front, back, models", () => {
    const urls = ["https://a/front.jpg", "https://a/back.jpg", "https://a/m1.jpg", "https://a/m2.jpg"];
    const slots = splitProductImages(urls);
    expect(slots.front).toBe(urls[0]);
    expect(slots.back).toBe(urls[1]);
    expect(slots.models).toEqual([urls[2], urls[3]]);
    expect(mergeProductImages(slots)).toEqual(urls);
  });

  it("omits empty slots when merging", () => {
    expect(mergeProductImages({ front: "https://a/f.jpg", back: null, models: [] })).toEqual(["https://a/f.jpg"]);
  });
});
