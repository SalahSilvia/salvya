import { LEGACY_LIKES_KEY } from "@/lib/likes/local-likes";
import { LIKES_CHANGED_EVENT } from "@/lib/member/likes-storage";

export function dispatchLikesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LIKES_CHANGED_EVENT));
}

export function subscribeLikes(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (
      e.key.startsWith("salvya-likes-") ||
      e.key === LEGACY_LIKES_KEY ||
      e.key === "salvya-liked-items-v1"
    ) {
      onChange();
    }
  };
  window.addEventListener(LIKES_CHANGED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LIKES_CHANGED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
