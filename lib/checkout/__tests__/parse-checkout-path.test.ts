import { describe, expect, it } from "vitest";
import {
  checkoutDetailsPathFromPathname,
  parseProductCheckoutPath,
} from "@/lib/checkout/parse-checkout-path";

describe("parseProductCheckoutPath", () => {
  it("parses locale-prefixed hoodie checkout paths", () => {
    expect(
      parseProductCheckoutPath("/it/artist/elgrandetoto/item/egttoto/checkout/payment"),
    ).toEqual({
      artistSlug: "elgrandetoto",
      itemSlug: "egttoto",
      productKind: "hoodie",
    });
  });

  it("parses non-locale tshirt confirm paths", () => {
    expect(parseProductCheckoutPath("/artist/foo/tshirt/bar/checkout/confirm")).toEqual({
      artistSlug: "foo",
      itemSlug: "bar",
      productKind: "tshirt",
    });
  });

  it("returns null for unrelated paths", () => {
    expect(parseProductCheckoutPath("/it/shop")).toBeNull();
    expect(parseProductCheckoutPath(null)).toBeNull();
  });
});

describe("checkoutDetailsPathFromPathname", () => {
  it("strips payment suffix while keeping locale", () => {
    expect(
      checkoutDetailsPathFromPathname("/it/artist/elgrandetoto/item/egttoto/checkout/payment"),
    ).toBe("/it/artist/elgrandetoto/item/egttoto/checkout");
  });
});
