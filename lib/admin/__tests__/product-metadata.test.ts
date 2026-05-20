import { describe, expect, it } from "vitest";
import { metadataFromPayload, metadataToDb, parseProductMetadata } from "@/lib/admin/product-metadata";

describe("product-metadata", () => {
  it("round-trips sizes and colors", () => {
    const meta = parseProductMetadata({
      sizes: ["s", "M", "m"],
      colors: [{ name: "Black", hex: "#111111", front: "https://cdn/black.jpg", back: "https://cdn/black-back.jpg" }],
      subtitle: "Tour drop",
    });
    expect(meta.sizes).toEqual(["S", "M"]);
    expect(meta.colors?.[0]?.name).toBe("Black");
    expect(meta.colors?.[0]?.front).toBe("https://cdn/black.jpg");
    const db = metadataToDb(meta);
    expect(db.sizes).toEqual(["S", "M"]);
  });

  it("reads flat payload fields", () => {
    const meta = metadataFromPayload({
      subtitle: "Limited",
      maxPerOrder: 2,
      preorder: true,
    });
    expect(meta.subtitle).toBe("Limited");
    expect(meta.maxPerOrder).toBe(2);
    expect(meta.preorder).toBe(true);
  });
});
