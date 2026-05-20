import { describe, expect, it } from "vitest";
import { reconcileMoroccoParisHeuristic } from "@/lib/geo/morocco-heuristic";

describe("reconcileMoroccoParisHeuristic", () => {
  it("returns MA for Europe/Paris with Arabic accept-language", () => {
    const r = reconcileMoroccoParisHeuristic({
      timezone: "Europe/Paris",
      acceptLanguage: "ar,en-US;q=0.9",
      tzOffsetHeader: "-60",
      intlLocalesHeader: null,
    });
    expect(r?.country).toBe("MA");
    expect(r?.reason).toContain("Arabic");
  });

  it("returns MA for Europe/Paris with ar-MA intl locale", () => {
    const r = reconcileMoroccoParisHeuristic({
      timezone: "Europe/Paris",
      acceptLanguage: "en-US",
      tzOffsetHeader: null,
      intlLocalesHeader: "fr-FR,ar-MA",
    });
    expect(r?.country).toBe("MA");
  });

  it("returns null for Europe/Paris with en-US only", () => {
    const r = reconcileMoroccoParisHeuristic({
      timezone: "Europe/Paris",
      acceptLanguage: "en-US,en;q=0.9",
      tzOffsetHeader: "-120",
      intlLocalesHeader: "en-US",
    });
    expect(r).toBeNull();
  });
});
