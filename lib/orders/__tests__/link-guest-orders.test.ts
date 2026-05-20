import { describe, expect, it, vi } from "vitest";
import { linkGuestOrdersToUser } from "@/lib/orders/link-guest-orders";

describe("linkGuestOrdersToUser", () => {
  it("returns empty when email invalid", async () => {
    const service = { from: vi.fn() } as unknown as Parameters<typeof linkGuestOrdersToUser>[0];
    const result = await linkGuestOrdersToUser(service, "user-1", "not-an-email");
    expect(result.linkedCount).toBe(0);
    expect(result.orderIds).toEqual([]);
  });

  it("updates only guest rows matching email", async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [{ id: "o1" }, { id: "o2" }], error: null }),
    };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: "o1" }, { id: "o2" }], error: null }),
    };
    const from = vi
      .fn()
      .mockReturnValueOnce(selectChain)
      .mockReturnValueOnce(updateChain);

    const service = { from } as unknown as Parameters<typeof linkGuestOrdersToUser>[0];
    const result = await linkGuestOrdersToUser(service, "user-1", "fan@example.com");
    expect(result.linkedCount).toBe(2);
    expect(result.orderIds).toEqual(["o1", "o2"]);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1" }),
    );
  });
});
