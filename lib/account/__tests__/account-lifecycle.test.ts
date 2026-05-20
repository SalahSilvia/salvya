import { describe, expect, it } from "vitest";
import {
  DEACTIVATE_CONFIRM_PHRASE,
  DELETE_CONFIRM_PHRASE,
} from "@/lib/account/account-status";
import { validateAccountLifecycleRequest } from "@/lib/account/account-lifecycle";

describe("validateAccountLifecycleRequest", () => {
  it("accepts delete when phrase and acknowledgement match", () => {
    const r = validateAccountLifecycleRequest("delete", DELETE_CONFIRM_PHRASE, true);
    expect(r).toEqual({ ok: true, action: "delete" });
  });

  it("accepts deactivate when phrase and acknowledgement match", () => {
    const r = validateAccountLifecycleRequest("deactivate", DEACTIVATE_CONFIRM_PHRASE, true);
    expect(r).toEqual({ ok: true, action: "deactivate" });
  });

  it("rejects wrong phrase", () => {
    const r = validateAccountLifecycleRequest("delete", "wrong", true);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("confirmation_mismatch");
  });

  it("requires acknowledgement", () => {
    const r = validateAccountLifecycleRequest("delete", DELETE_CONFIRM_PHRASE, false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("acknowledgement_required");
  });
});
