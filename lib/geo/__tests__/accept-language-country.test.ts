import { describe, expect, it } from "vitest";
import { countryFromAcceptLanguage } from "@/lib/geo/accept-language-country";

describe("countryFromAcceptLanguage", () => {
  it("maps fr-MA to Morocco", () => {
    expect(countryFromAcceptLanguage("fr-MA,fr;q=0.9,en;q=0.8")).toBe("MA");
  });

  it("does not map bare fr to France", () => {
    expect(countryFromAcceptLanguage("fr,en;q=0.9")).toBeNull();
  });

  it("maps fr-FR to France", () => {
    expect(countryFromAcceptLanguage("fr-FR,en;q=0.9")).toBe("FR");
  });

  it("does not map en-US to United States", () => {
    expect(countryFromAcceptLanguage("en-US,en;q=0.9")).toBeNull();
  });
});
