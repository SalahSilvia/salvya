const TAB_ID_KEY = "salvya-tab-id";

/** Stable id for this browser tab (sessionStorage). */
export function getTabId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      window.sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return `tab-fallback-${Date.now()}`;
  }
}
