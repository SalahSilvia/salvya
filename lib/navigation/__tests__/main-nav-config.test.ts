import { describe, expect, it } from "vitest";
import { mainNavTabsForRole } from "@/lib/navigation/main-nav-config";
import { storefrontLogoHref } from "@/lib/navigation/storefront-logo";

describe("mainNavTabsForRole", () => {
  it("omits home for guests", () => {
    const mobile = mainNavTabsForRole(null, "mobile");
    expect(mobile.map((t) => t.id)).toEqual(["shop", "bag", "search", "menu"]);
  });

  it("keeps home for signed-in customers", () => {
    const mobile = mainNavTabsForRole("customer", "mobile");
    expect(mobile.map((t) => t.id)).toContain("home");
  });
});

describe("storefrontLogoHref", () => {
  it("sends guests to shop and customers to home", () => {
    expect(storefrontLogoHref(null)).toBe("/shop");
    expect(storefrontLogoHref("customer")).toBe("/");
  });
});
