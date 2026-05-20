import { afterEach, describe, expect, it, vi } from "vitest";
import { syncRemoteRequest } from "@/lib/sync/remote-request";

describe("syncRemoteRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns auth failure without retry on 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ ok: false, error: { code: "unauthorized", message: "Unauthorized" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncRemoteRequest({ method: "GET", path: "/api/cart" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("auth");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries transient 503 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 503,
        ok: false,
        json: async () => ({ ok: false, error: { code: "supabase", message: "Unavailable" } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ ok: true, lines: [], updatedAt: "2025-01-01T00:00:00.000Z", synced: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncRemoteRequest<{ lines?: unknown }>({ method: "GET", path: "/api/cart" });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not throw on network failure — returns network reason", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncRemoteRequest({ method: "PUT", path: "/api/likes", body: { items: [] } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("network");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("parses legacy success bodies without ok flag", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ items: [], updatedAt: null, synced: true }),
      }),
    );

    const result = await syncRemoteRequest<{ items?: unknown }>({ method: "GET", path: "/api/likes" });
    expect(result.ok).toBe(true);
  });
});
