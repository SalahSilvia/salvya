/**
 * Pure auth / push coordination for account sync (testable without React).
 * The hook mirrors this state in refs.
 */

export type PendingPush = {
  userId: string;
  generation: number;
  revision: number;
};

export type PushClaim = {
  userId: string;
  generation: number;
  revision: number;
  tabIds: Set<string>;
};

export class SyncCoordinator {
  generation = 0;
  userId: string | null = null;
  authTransitionInFlight = false;

  pendingDebounce: PendingPush | null = null;
  pendingElection: PendingPush | null = null;
  pushClaim: PushClaim | null = null;

  /** Monotonic push attempts — invalidated on auth change. */
  pushEpoch = 0;

  beginAuthTransition(nextUserId: string | null): number {
    this.generation += 1;
    this.pushEpoch += 1;
    this.userId = nextUserId;
    this.authTransitionInFlight = true;
    this.cancelPendingPush();
    return this.generation;
  }

  endAuthTransition(): void {
    this.authTransitionInFlight = false;
  }

  cancelPendingPush(): void {
    this.pendingDebounce = null;
    this.pendingElection = null;
    this.pushClaim = null;
  }

  scheduleDebounce(userId: string, generation: number, revision: number): PendingPush | null {
    if (!this.canSchedulePush(userId, generation)) return null;
    const pending: PendingPush = { userId, generation, revision };
    this.pendingDebounce = pending;
    return pending;
  }

  debounceReady(pending: PendingPush): boolean {
    return (
      this.pendingDebounce === pending &&
      this.canSchedulePush(pending.userId, pending.generation)
    );
  }

  beginPushElection(userId: string, generation: number, revision: number, tabId: string): PendingPush | null {
    if (!this.canRunPush(userId, generation, revision)) return null;
    const pending: PendingPush = { userId, generation, revision };
    this.pendingElection = pending;
    this.pushClaim = { userId, generation, revision, tabIds: new Set([tabId]) };
    return pending;
  }

  recordPushClaim(msg: { userKey: string; localRevision: number; tabId: string }): void {
    if (msg.userKey === "guest") return;
    const userId = msg.userKey;
    const claim = this.pushClaim;
    if (this.authTransitionInFlight) return;
    if (!claim || claim.userId !== userId) {
      if (msg.localRevision >= (claim?.revision ?? 0)) {
        this.pushClaim = {
          userId,
          generation: this.generation,
          revision: msg.localRevision,
          tabIds: new Set([msg.tabId]),
        };
      }
      return;
    }
    if (claim.revision !== msg.localRevision) return;
    claim.tabIds.add(msg.tabId);
  }

  electionWinner(pending: PendingPush, tabId: string): string | null {
    if (this.pendingElection !== pending) return null;
    if (!this.canRunPush(pending.userId, pending.generation, pending.revision)) return null;
    const claim = this.pushClaim;
    if (!claim || claim.revision !== pending.revision) return null;
    if (claim.userId !== pending.userId) return null;
    if (claim.generation !== pending.generation) return null;
    return [...claim.tabIds].sort()[0] ?? tabId;
  }

  finishElection(pending: PendingPush): void {
    if (this.pendingElection === pending) {
      this.pendingElection = null;
      this.pushClaim = null;
    }
  }

  canApplyAsync(generation: number, userId: string | null): boolean {
    return generation === this.generation && this.userId === userId;
  }

  canSchedulePush(userId: string, generation: number): boolean {
    if (this.authTransitionInFlight) return false;
    if (generation !== this.generation) return false;
    if (this.userId !== userId) return false;
    if (!userId) return false;
    return true;
  }

  canRunPush(userId: string, generation: number, revision: number): boolean {
    return this.canSchedulePush(userId, generation);
  }

  shouldApplyPushResult(
    generation: number,
    userId: string,
    revision: number,
    pushEpochAtStart: number,
  ): boolean {
    if (pushEpochAtStart !== this.pushEpoch) return false;
    return this.canApplyAsync(generation, userId);
  }
}
