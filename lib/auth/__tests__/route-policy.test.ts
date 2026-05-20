import { describe, expect, it } from "vitest";
import { resolveRouteAccess, routeRequiresAuthentication } from "@/lib/auth/route-policy";

describe("resolveRouteAccess", () => {
  it("protects admin pages", () => {
    const access = resolveRouteAccess("/admin/orders");
    expect(access.kind).toBe("page");
    expect(access.roles).toEqual(["admin", "god_admin"]);
    expect(routeRequiresAuthentication(access)).toBe(true);
  });

  it("protects creator dashboard and apply flow", () => {
    expect(resolveRouteAccess("/creator/dashboard").roles).toContain("influencer");
    expect(resolveRouteAccess("/creator/apply").roles).toContain("customer");
    expect(resolveRouteAccess("/creator/application-status").roles).toContain("customer");
    expect(resolveRouteAccess("/creator/dashboard").roles).toContain("influencer");
    expect(resolveRouteAccess("/creator/wallet").roles).toContain("influencer");
    expect(resolveRouteAccess("/creator").kind).toBe("public");
  });

  it("protects admin API prefix", () => {
    const access = resolveRouteAccess("/api/admin/me");
    expect(access.kind).toBe("api");
    expect(access.roles).toEqual(["admin", "god_admin"]);
  });

  it("restricts god routes to god_admin only", () => {
    expect(resolveRouteAccess("/admin/god").roles).toEqual(["god_admin"]);
    expect(resolveRouteAccess("/api/admin/god/overview").roles).toEqual(["god_admin"]);
  });

  it("protects signed-in account sub-routes and profile API", () => {
    expect(resolveRouteAccess("/account/profile").kind).toBe("page");
    expect(resolveRouteAccess("/account/settings").roles).toContain("customer");
    expect(resolveRouteAccess("/api/me/profile").kind).toBe("api");
    expect(resolveRouteAccess("/account").kind).toBe("page");
    expect(resolveRouteAccess("/account").roles).toContain("customer");
  });

  it("leaves storefront and analytics collect APIs public", () => {
    expect(resolveRouteAccess("/shop").kind).toBe("public");
    expect(routeRequiresAuthentication(resolveRouteAccess("/"))).toBe(false);
    expect(resolveRouteAccess("/api/analytics/collect").kind).toBe("public");
    expect(resolveRouteAccess("/api/analytics/heartbeat").kind).toBe("public");
  });
});
