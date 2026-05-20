import { describe, expect, it } from "vitest";
import { hydrateColorVariants } from "@/lib/admin/product-color-variants";

describe("hydrateColorVariants models per color", () => {
  it("assigns legacy model urls to matching colorway", () => {
    const colors = hydrateColorVariants(
      [
        { id: "black", name: "Black", front: "https://cdn/b-front.jpg", back: "https://cdn/b-back.jpg" },
        { id: "white", name: "White", front: "https://cdn/w-front.jpg", back: "https://cdn/w-back.jpg" },
      ],
      [
        "https://cdn/b-front.jpg",
        "https://cdn/b-back.jpg",
        "https://cdn/model-black-1.jpg",
        "https://cdn/model-white-1.jpg",
      ],
    );
    expect(colors[0]?.models).toEqual(["https://cdn/model-black-1.jpg"]);
    expect(colors[1]?.models).toEqual(["https://cdn/model-white-1.jpg"]);
  });
});
