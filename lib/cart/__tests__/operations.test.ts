import { describe, expect, it } from "vitest";
import { addLineToCart } from "@/lib/cart/operations";
import type { AddCartLineInput } from "@/lib/cart/types";

const baseInput: AddCartLineInput = {
  artistSlug: "artist",
  artistName: "Artist",
  itemSlug: "hoodie-1",
  productKind: "hoodie",
  displayTitle: "Hoodie",
  priceLabel: "€45",
  colorId: "black",
  colorLabel: "Black",
  size: "M",
  qty: 1,
  giftNote: "",
  checkoutHref: "/artist/artist/item/hoodie-1/checkout",
};

describe("addLineToCart", () => {
  it("merges quantity for the same variant by default", () => {
    const once = addLineToCart([], baseInput);
    expect(once).toHaveLength(1);
    expect(once[0]?.qty).toBe(1);

    const twice = addLineToCart(once, { ...baseInput, qty: 1 });
    expect(twice).toHaveLength(1);
    expect(twice[0]?.qty).toBe(2);
  });

  it("appends a new line per add when separateLine is true", () => {
    const first = addLineToCart([], { ...baseInput, separateLine: true });
    const second = addLineToCart(first, { ...baseInput, size: "L", separateLine: true });

    expect(second).toHaveLength(2);
    expect(second[0]?.size).toBe("L");
    expect(second[1]?.size).toBe("M");
    expect(second[0]?.qty).toBe(1);
    expect(second[1]?.qty).toBe(1);
  });

  it("does not merge separate adds of the same size and color", () => {
    const first = addLineToCart([], { ...baseInput, separateLine: true });
    const second = addLineToCart(first, { ...baseInput, separateLine: true });

    expect(second).toHaveLength(2);
    expect(second.every((l) => l.qty === 1)).toBe(true);
  });
});
