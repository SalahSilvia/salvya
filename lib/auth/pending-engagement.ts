import type { LikedItemInput } from "@/lib/member/likes-storage";

export const PENDING_ENGAGEMENT_STORAGE_KEY = "salvya_pending_engagement_v1";

export type PendingEngagement =
  | { v: 1; kind: "like"; input: LikedItemInput }
  | { v: 1; kind: "follow"; slug: string; meta: { name: string; profileImage: string } };

export function readPendingEngagement(): PendingEngagement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_ENGAGEMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingEngagement;
    if (parsed?.v !== 1 || (parsed.kind !== "like" && parsed.kind !== "follow")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingEngagement(next: PendingEngagement): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_ENGAGEMENT_STORAGE_KEY, JSON.stringify(next));
}

export function clearPendingEngagement(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_ENGAGEMENT_STORAGE_KEY);
}
