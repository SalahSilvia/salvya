import { describe, expect, it } from "vitest";
import { normalizeSalvyaRole, roleSatisfies } from "@/lib/auth/roles";

describe("normalizeSalvyaRole", () => {
  it("maps legacy creator to influencer", () => {
    expect(normalizeSalvyaRole("creator")).toBe("influencer");
  });

  it("rejects unknown values", () => {
    expect(normalizeSalvyaRole("superuser")).toBeNull();
  });
});

describe("roleSatisfies", () => {
  it("allows admin on influencer routes when influencer is allowed", () => {
    expect(roleSatisfies("admin", ["influencer", "admin"])).toBe(true);
  });

  it("blocks customer from admin routes", () => {
    expect(roleSatisfies("customer", ["admin"])).toBe(false);
  });

  it("god_admin inherits admin and influencer access", () => {
    expect(roleSatisfies("god_admin", ["admin"])).toBe(true);
    expect(roleSatisfies("god_admin", ["influencer"])).toBe(true);
    expect(roleSatisfies("god_admin", ["god_admin"])).toBe(true);
    expect(roleSatisfies("god_admin", ["customer"])).toBe(true);
  });

  it("normalizes god aliases", () => {
    expect(normalizeSalvyaRole("god")).toBe("god_admin");
  });
});
