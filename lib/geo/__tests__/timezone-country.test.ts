import { describe, expect, it } from "vitest";
import { countryFromTimezone, isMoroccoTimezone } from "@/lib/geo/timezone-country";

describe("timezone-country", () => {
  it("maps Africa/Casablanca to Morocco", () => {
    expect(countryFromTimezone("Africa/Casablanca")).toBe("MA");
    expect(isMoroccoTimezone("Africa/Casablanca")).toBe(true);
  });
});
