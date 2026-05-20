import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { localizedAbsoluteUrl } from "@/lib/seo/site";

describe("SEO locale", () => {
  it("builds locale-prefixed canonical URLs", () => {
    const meta = buildPageMetadata({
      title: "Shop",
      path: "/shop",
      locale: "fr",
    });
    expect(meta.alternates?.canonical).toBe(localizedAbsoluteUrl("/shop", "fr"));
  });

  it("emits hreflang for all supported locales", () => {
    const meta = buildPageMetadata({ title: "Shop", path: "/shop", locale: "en" });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(languages.en).toContain("/en/shop");
    expect(languages.fr).toContain("/fr/shop");
    expect(languages["x-default"]).toContain("/en/shop");
  });
});
