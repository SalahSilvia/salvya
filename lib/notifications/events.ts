export const NOTIFICATIONS_CHANGED_EVENT = "salvya-notifications-changed";

export function dispatchNotificationsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function subscribeNotifications(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (
      e.key.startsWith("salvya-notifications-") ||
      e.key.startsWith("salvya-in-app-notifications-") ||
      e.key.startsWith("salvya-notification-prefs-")
    ) {
      onChange();
    }
  };
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
