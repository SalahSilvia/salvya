import { describe, expect, it } from "vitest";
import { mergeNotifications } from "@/lib/notifications/merge";
import type { InAppNotificationV1 } from "@/lib/notifications/types";

const base = (overrides: Partial<InAppNotificationV1>): InAppNotificationV1 => ({
  v: 1,
  id: "n1",
  kind: "account",
  title: "Test",
  body: "Body",
  createdAt: "2026-05-14T10:00:00.000Z",
  read: false,
  ...overrides,
});

describe("mergeNotifications", () => {
  it("keeps read=true when local marked read before remote reload", () => {
    const remote = [base({ id: "seed-account-inbox", read: false })];
    const local = [base({ id: "seed-account-inbox", read: true })];
    const merged = mergeNotifications(remote, local);
    expect(merged.find((n) => n.id === "seed-account-inbox")?.read).toBe(true);
  });
});
