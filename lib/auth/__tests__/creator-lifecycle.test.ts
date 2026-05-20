import { describe, expect, it } from "vitest";
import {
  canAccessCreatorDashboard,
  canStartCreatorOnboarding,
  resolveCreatorLifecycle,
} from "@/lib/auth/creator-lifecycle";

describe("creator-lifecycle", () => {
  it("maps customer + pending application to pending", () => {
    expect(resolveCreatorLifecycle("customer", "pending")).toBe("pending");
  });

  it("maps influencer role to active", () => {
    expect(resolveCreatorLifecycle("influencer", "approved")).toBe("active");
  });

  it("allows dashboard for influencer and admin", () => {
    expect(canAccessCreatorDashboard("influencer")).toBe(true);
    expect(canAccessCreatorDashboard("admin")).toBe(true);
    expect(canAccessCreatorDashboard("customer")).toBe(false);
  });

  it("allows onboarding for eligible customers", () => {
    expect(canStartCreatorOnboarding("customer", "none")).toBe(true);
    expect(canStartCreatorOnboarding("customer", "pending")).toBe(false);
  });
});
