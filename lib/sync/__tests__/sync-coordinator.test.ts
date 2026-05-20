import { describe, expect, it, vi } from "vitest";
import { SyncCoordinator } from "@/lib/sync/sync-coordinator";

describe("SyncCoordinator auth stress", () => {
  it("cancels pending debounce on auth transition", () => {
    const c = new SyncCoordinator();
    c.userId = "user-a";
    c.generation = 1;
    c.authTransitionInFlight = false;

    const pending = c.scheduleDebounce("user-a", 1, 3);
    expect(pending).not.toBeNull();

    c.beginAuthTransition(null);
    expect(c.pendingDebounce).toBeNull();
    expect(c.debounceReady(pending!)).toBe(false);
  });

  it("blocks push election across auth boundaries", () => {
    const c = new SyncCoordinator();
    c.userId = "user-a";
    c.generation = 2;
    c.authTransitionInFlight = false;

    const pending = c.beginPushElection("user-a", 2, 5, "tab-1");
    expect(pending).not.toBeNull();

    c.beginAuthTransition("user-b");
    expect(c.canRunPush("user-a", 2, 5)).toBe(false);
    expect(c.electionWinner(pending!, "tab-1")).toBeNull();
  });

  it("invalidates push results after logout via pushEpoch", () => {
    const c = new SyncCoordinator();
    c.userId = "user-a";
    c.generation = 4;
    const epoch = c.pushEpoch;

    c.beginAuthTransition(null);
    expect(c.shouldApplyPushResult(4, "user-a", 1, epoch)).toBe(false);
  });

  it("defers schedule while auth transition in flight", () => {
    const c = new SyncCoordinator();
    c.userId = "user-a";
    c.generation = 1;
    c.beginAuthTransition("user-a");
    expect(c.scheduleDebounce("user-a", 1, 1)).toBeNull();
    c.endAuthTransition();
    expect(c.scheduleDebounce("user-a", c.generation, 2)).not.toBeNull();
  });

  it("rejects stale generation on hydrate apply", () => {
    const c = new SyncCoordinator();
    const gen = c.beginAuthTransition("user-x");
    c.endAuthTransition();
    expect(c.canApplyAsync(gen, "user-x")).toBe(true);
    c.beginAuthTransition(null);
    expect(c.canApplyAsync(gen, "user-x")).toBe(false);
  });
});

describe("SyncCoordinator race: rapid revision + sign-in", () => {
  it("keeps local revision guard on push apply", () => {
    const c = new SyncCoordinator();
    c.userId = "u1";
    c.generation = 1;
    const epoch = c.pushEpoch;
    expect(c.shouldApplyPushResult(1, "u1", 10, epoch)).toBe(true);
    expect(c.shouldApplyPushResult(1, "u1", 11, epoch)).toBe(true);
    c.beginAuthTransition("u2");
    expect(c.shouldApplyPushResult(1, "u1", 10, epoch)).toBe(false);
  });
});

describe("network drop simulation (coordinator + epoch)", () => {
  it("simulates delayed API after logout — result discarded", async () => {
    const c = new SyncCoordinator();
    c.userId = "user-delay";
    c.generation = 7;
    const epochAtPushStart = c.pushEpoch;

    const delayedResolve = vi.fn();
    const api = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
        delayedResolve();
      }, 30);
    });

    c.beginAuthTransition(null);
    await api;

    expect(delayedResolve).toHaveBeenCalled();
    expect(c.shouldApplyPushResult(7, "user-delay", 1, epochAtPushStart)).toBe(false);
    expect(c.userId).toBeNull();
  });
});
