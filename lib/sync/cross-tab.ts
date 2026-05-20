import { getTabId } from "@/lib/sync/tab-id";

export const SYNC_CHANNEL_VERSION = 1 as const;

export type CrossTabMessageType = "local-applied" | "remote-applied" | "push-claim";

export type CrossTabMessage = {
  v: typeof SYNC_CHANNEL_VERSION;
  resourceId: string;
  type: CrossTabMessageType;
  tabId: string;
  /** `guest` or Supabase user id. */
  userKey: string;
  localRevision: number;
  remoteUpdatedAt: string | null;
};

export type CrossTabBroadcast = Omit<CrossTabMessage, "v" | "resourceId" | "tabId">;

function channelName(resourceId: string): string {
  return `salvya-sync-v1:${resourceId}`;
}

export function userKeyFromId(userId: string | null): string {
  return userId ?? "guest";
}

export type ResourceCrossTab = {
  tabId: string;
  broadcast: (message: CrossTabBroadcast) => void;
  close: () => void;
};

export function createResourceCrossTab(
  resourceId: string,
  onMessage: (message: CrossTabMessage) => void,
): ResourceCrossTab {
  const tabId = getTabId();
  if (typeof window === "undefined") {
    return { tabId, broadcast: () => {}, close: () => {} };
  }

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(channelName(resourceId));
    channel.onmessage = (event: MessageEvent<CrossTabMessage>) => {
      const msg = event.data;
      if (!msg || msg.v !== SYNC_CHANNEL_VERSION || msg.resourceId !== resourceId) return;
      if (msg.tabId === tabId) return;
      onMessage(msg);
    };
  } catch {
    channel = null;
  }

  return {
    tabId,
    broadcast(payload: CrossTabBroadcast) {
      const full: CrossTabMessage = {
        v: SYNC_CHANNEL_VERSION,
        resourceId,
        tabId,
        ...payload,
      };
      channel?.postMessage(full);
    },
    close() {
      channel?.close();
      channel = null;
    },
  };
}

export function matchesStorageKey(key: string | null, prefixes: string[]): boolean {
  if (!key) return false;
  return prefixes.some((p) => key.startsWith(p) || key === p);
}

export function subscribeStorageKeys(
  prefixes: string[],
  onExternalChange: (key: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (!e.key || !matchesStorageKey(e.key, prefixes)) return;
    onExternalChange(e.key);
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
