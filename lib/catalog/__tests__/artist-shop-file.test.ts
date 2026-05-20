import { describe, expect, it } from "vitest";
import {
  artistShopUrlResolvesOnDisk,
  isSafeArtistShopFilename,
} from "@/lib/catalog/artist-shop-file";

describe("artist-shop-file", () => {
  it("rejects unsafe filenames", () => {
    expect(isSafeArtistShopFilename("../etc/passwd")).toBe(false);
    expect(isSafeArtistShopFilename("stage-hoodie-back.jpg")).toBe(true);
  });

  it("reports missing legacy sample URLs as not on disk", () => {
    expect(artistShopUrlResolvesOnDisk("/api/artist-shop/babygang/stage-hoodie-back.jpg")).toBe(false);
    expect(artistShopUrlResolvesOnDisk("/api/artist-shop/tchubi/quiet-hoodie-back.png")).toBe(false);
  });
});
