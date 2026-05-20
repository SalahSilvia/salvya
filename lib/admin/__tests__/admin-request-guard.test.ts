import { describe, expect, it } from "vitest";
import { assertAdminSameOrigin } from "@/lib/admin/admin-request-guard";

describe("assertAdminSameOrigin", () => {
  it("allows matching origin and host", () => {
    const req = new Request("https://salvya.com/api/admin/settings", {
      method: "PATCH",
      headers: { origin: "https://salvya.com", host: "salvya.com" },
    });
    expect(assertAdminSameOrigin(req as unknown as import("next/server").NextRequest).ok).toBe(true);
  });

  it("blocks mismatched origin", () => {
    const req = new Request("https://salvya.com/api/admin/settings", {
      method: "POST",
      headers: { origin: "https://evil.example", host: "salvya.com" },
    });
    const r = assertAdminSameOrigin(req as unknown as import("next/server").NextRequest);
    expect(r.ok).toBe(false);
  });
});
