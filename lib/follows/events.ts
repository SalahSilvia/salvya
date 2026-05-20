import { LEGACY_FOLLOWS_KEY } from "@/lib/follows/local-follows";
import { ARTIST_FOLLOWS_CHANGED_EVENT } from "@/lib/member/artist-follows-storage";

export function dispatchArtistFollowsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ARTIST_FOLLOWS_CHANGED_EVENT));
}

export function subscribeArtistFollows(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (
      e.key.startsWith("salvya-follows-") ||
      e.key === LEGACY_FOLLOWS_KEY ||
      e.key === "salvya-artist-favorites"
    ) {
      onChange();
    }
  };
  window.addEventListener(ARTIST_FOLLOWS_CHANGED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ARTIST_FOLLOWS_CHANGED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
