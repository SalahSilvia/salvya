import { describe, expect, it } from "vitest";
import {
  apiCatalogUrlToPublicMediaPath,
  normalizeProductImageUrl,
} from "@/lib/media/product-image-url-core";

describe("apiCatalogUrlToPublicMediaPath", () => {
  it("rewrites hoodie API paths to public media", () => {
    expect(
      apiCatalogUrlToPublicMediaPath(
        "/api/artist-catalog-hoodie/elgrandetoto/My%20Folder/front.png",
      ),
    ).toBe("/media/catalog/elgrandetoto/My%20Folder/hoodie/front.png");
  });

  it("rewrites model hoodie paths with nested segments", () => {
    expect(
      apiCatalogUrlToPublicMediaPath(
        "/api/artist-catalog-model-hoodie/elgrandetoto/folder/models%20shooting%20hoodies/lady.png",
      ),
    ).toBe(
      "/media/catalog/elgrandetoto/folder/model-hoodie/models%20shooting%20hoodies/lady.png",
    );
  });
});

describe("normalizeProductImageUrl", () => {
  it("strips localhost origin from stored URLs", () => {
    expect(normalizeProductImageUrl("http://localhost:3000/api/artist-catalog-hoodie/a/b/c.png")).toBe(
      "/media/catalog/a/b/hoodie/c.png",
    );
  });

  it("passes through Supabase public storage URLs", () => {
    const url =
      "https://xyz.supabase.co/storage/v1/object/public/products/hoodie.png";
    expect(normalizeProductImageUrl(url)).toBe(url);
  });
});
