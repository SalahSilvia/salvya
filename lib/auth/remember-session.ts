const STORAGE_KEY = "salvya:remember-session";

/** Default true — matches Supabase cookie persistence (stay signed in on this device). */
export function getRememberSessionPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export function setRememberSessionPreference(remember: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, remember ? "1" : "0");
  } catch {
    /* ignore */
  }
}
