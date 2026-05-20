import { describe, expect, it } from "vitest";
import { interpretSignUpResponse, isExistingEmailSignUpUser } from "@/lib/auth/signup-result";
import type { User } from "@supabase/supabase-js";

describe("isExistingEmailSignUpUser", () => {
  it("returns true when identities array is empty", () => {
    const user = { identities: [] } as unknown as User;
    expect(isExistingEmailSignUpUser(user)).toBe(true);
  });

  it("returns false when identities exist", () => {
    const user = { identities: [{ id: "x" }] } as unknown as User;
    expect(isExistingEmailSignUpUser(user)).toBe(false);
  });
});

describe("interpretSignUpResponse", () => {
  it("detects duplicate from auth error", () => {
    const outcome = interpretSignUpResponse({
      user: null,
      session: null,
      error: { message: "User already registered" } as never,
    });
    expect(outcome.kind).toBe("existing_email");
  });

  it("detects duplicate from empty identities", () => {
    const outcome = interpretSignUpResponse({
      user: { identities: [] } as unknown as User,
      session: null,
      error: null,
    });
    expect(outcome.kind).toBe("existing_email");
  });

  it("treats session as immediate account creation", () => {
    const outcome = interpretSignUpResponse({
      user: { identities: [{ id: "a" }] } as unknown as User,
      session: { access_token: "t" },
      error: null,
    });
    expect(outcome).toEqual({ kind: "created", needsEmailConfirmation: false });
  });

  it("treats user without session as email confirmation required", () => {
    const outcome = interpretSignUpResponse({
      user: { identities: [{ id: "a" }] } as unknown as User,
      session: null,
      error: null,
    });
    expect(outcome).toEqual({ kind: "created", needsEmailConfirmation: true });
  });
});
