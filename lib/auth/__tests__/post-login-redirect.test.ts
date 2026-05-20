import { describe, expect, it } from "vitest";
import { defaultHomeForRole, resolvePostLoginRedirect } from "@/lib/auth/post-login-redirect";

describe("post-login redirect", () => {
  it("defaults by DB role", () => {
    expect(defaultHomeForRole("god_admin")).toBe("/admin/god");
    expect(defaultHomeForRole("admin")).toBe("/admin");
    expect(defaultHomeForRole("influencer")).toBe("/creator/dashboard");
    expect(defaultHomeForRole("customer")).toBe("/");
  });

  it("honors safe public next", () => {
    expect(resolvePostLoginRedirect("/shop", "customer")).toBe("/shop");
  });

  it("denies next to protected route when role lacks access", () => {
    expect(resolvePostLoginRedirect("/admin", "customer")).toBe("/");
    expect(resolvePostLoginRedirect("/admin", "influencer")).toBe("/creator/dashboard");
  });

  it("allows next when role matches", () => {
    expect(resolvePostLoginRedirect("/admin", "admin")).toBe("/admin");
    expect(resolvePostLoginRedirect("/creator/dashboard", "influencer")).toBe("/creator/dashboard");
    expect(resolvePostLoginRedirect("/creator", "admin")).toBe("/admin");
    expect(resolvePostLoginRedirect("/creator/dashboard", "admin")).toBe("/creator/dashboard");
  });

  it("sends staff to their hub after sign-in from public pages", () => {
    expect(resolvePostLoginRedirect("/", "admin")).toBe("/admin");
    expect(resolvePostLoginRedirect("/shop", "admin")).toBe("/admin");
    expect(resolvePostLoginRedirect("/", "influencer")).toBe("/creator/dashboard");
    expect(resolvePostLoginRedirect("/search", "influencer")).toBe("/creator/dashboard");
  });

  it("allows staff to return to storefront account when requested", () => {
    expect(resolvePostLoginRedirect("/account/profile", "admin")).toBe("/account/profile");
    expect(resolvePostLoginRedirect("/account/settings", "god_admin")).toBe("/account/settings");
  });
});
