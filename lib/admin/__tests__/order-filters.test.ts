import { describe, expect, it } from "vitest";
import { sinceIsoForRange, parseOrderDateRange } from "@/lib/admin/order-filters";

describe("order-filters", () => {
  it("parses date range", () => {
    expect(parseOrderDateRange("7d")).toBe("7d");
    expect(parseOrderDateRange(null)).toBe("all");
  });

  it("returns since iso for bounded ranges", () => {
    const since = sinceIsoForRange("7d");
    expect(since).toBeTruthy();
    expect(sinceIsoForRange("all")).toBeNull();
  });
});
