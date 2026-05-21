import { describe, expect, it } from "vitest";
import {
  deriveVariantUrls,
  isOptimizedVariantUrl,
  pickDisplayUrl,
} from "@/lib/media/image-optimization/variant-urls";

describe("variant-urls", () => {
  const medium =
    "https://xyz.supabase.co/storage/v1/object/public/product-images/artist/item-abc-medium.webp?v=1";

  it("detects optimized URLs", () => {
    expect(isOptimizedVariantUrl(medium)).toBe(true);
    expect(isOptimizedVariantUrl("https://x.com/a.jpg")).toBe(false);
  });

  it("derives all variant siblings", () => {
    const v = deriveVariantUrls(medium);
    expect(v?.small).toContain("-small.webp");
    expect(v?.large).toContain("-large.webp");
    expect(v?.thumb).toContain("-thumb.webp");
  });

  it("picks context-appropriate URL", () => {
    const v = deriveVariantUrls(medium)!;
    expect(pickDisplayUrl(medium, v, "thumb")).toContain("-thumb.webp");
    expect(pickDisplayUrl(medium, v, "hero")).toContain("-large.webp");
  });
});
