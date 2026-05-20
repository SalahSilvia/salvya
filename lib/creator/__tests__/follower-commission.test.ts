import { describe, expect, it } from "vitest";
import {
  commissionMinorForItems,
  perItemCommissionDh,
  resolveFollowerCommissionTier,
} from "@/lib/creator/follower-commission";

describe("follower commission tiers", () => {
  it("maps follower bands to DH per item", () => {
    expect(perItemCommissionDh(0)).toBe(7);
    expect(perItemCommissionDh(19_999)).toBe(7);
    expect(perItemCommissionDh(20_000)).toBe(10);
    expect(perItemCommissionDh(49_999)).toBe(10);
    expect(perItemCommissionDh(50_000)).toBe(15);
    expect(perItemCommissionDh(99_999)).toBe(15);
    expect(perItemCommissionDh(100_000)).toBe(20);
    expect(perItemCommissionDh(299_999)).toBe(20);
    expect(perItemCommissionDh(300_000)).toBe(25);
    expect(perItemCommissionDh(1_000_000)).toBe(25);
  });

  it("multiplies by item count in minor units", () => {
    expect(commissionMinorForItems(25_000, 3)).toBe(10 * 100 * 3);
  });

  it("returns tier labels", () => {
    expect(resolveFollowerCommissionTier(45_000).followerRangeLabel).toBe("20,000 – 49,999");
  });
});
