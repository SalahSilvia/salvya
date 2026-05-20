import { describe, expect, it } from "vitest";
import { resolveAdminDisplayName } from "@/lib/admin/admin-me";
import { DEFAULT_ADMIN_PREFERENCES } from "@/lib/admin/admin-preferences";

describe("resolveAdminDisplayName", () => {
  it("prefers admin preferences over auth metadata", () => {
    const name = resolveAdminDisplayName(
      { ...DEFAULT_ADMIN_PREFERENCES, displayName: "Salvya Ops" },
      { display_name: "OAuth Name", full_name: "OAuth Full" },
    );
    expect(name).toBe("Salvya Ops");
  });

  it("falls back to metadata when preferences name is empty", () => {
    expect(
      resolveAdminDisplayName(DEFAULT_ADMIN_PREFERENCES, {
        display_name: "OAuth Name",
        full_name: "OAuth Full",
      }),
    ).toBe("OAuth Name");
    expect(resolveAdminDisplayName(DEFAULT_ADMIN_PREFERENCES, { full_name: "OAuth Full" })).toBe("OAuth Full");
  });
});
