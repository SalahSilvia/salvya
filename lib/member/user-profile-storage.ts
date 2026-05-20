/**
 * Extended profile fields (local-first). Merge with Supabase `user` on the client.
 * Sync to cloud later — keep shape stable for API mapping.
 */
export const USER_PROFILE_STORAGE_PREFIX = "salvya-user-profile-v1:";

export const PROFILE_EXTENSION_CHANGED = "salvya-profile-extension-changed";

export type SalvyaUserProfileExtension = {
  /** Supabase user id */
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  phone: string;
  country: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  /** First persisted profile moment or auth signup — ISO */
  createdAtIso?: string;
};

const defaultExtension = (userId: string): SalvyaUserProfileExtension => ({
  userId,
  displayName: "",
  username: "",
  bio: "",
  phone: "",
  country: "",
  avatarUrl: null,
  coverUrl: null,
});

function storageKey(userId: string) {
  return `${USER_PROFILE_STORAGE_PREFIX}${userId}`;
}

function isExtension(x: unknown): x is SalvyaUserProfileExtension {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.userId === "string" &&
    typeof o.displayName === "string" &&
    typeof o.username === "string" &&
    typeof o.bio === "string" &&
    (typeof o.phone === "string" || o.phone === undefined) &&
    (typeof o.country === "string" || o.country === undefined) &&
    (o.avatarUrl === null || typeof o.avatarUrl === "string") &&
    (o.coverUrl === null || typeof o.coverUrl === "string") &&
    (o.createdAtIso === undefined || typeof o.createdAtIso === "string")
  );
}

export function readProfileExtension(userId: string): SalvyaUserProfileExtension {
  if (typeof window === "undefined") return defaultExtension(userId);
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return defaultExtension(userId);
    const parsed = JSON.parse(raw) as unknown;
    if (!isExtension(parsed) || parsed.userId !== userId) return defaultExtension(userId);
    return {
      ...defaultExtension(userId),
      ...parsed,
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      country: typeof parsed.country === "string" ? parsed.country : "",
    };
  } catch {
    return defaultExtension(userId);
  }
}

export function writeProfileExtension(userId: string, next: SalvyaUserProfileExtension): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify({ ...next, userId }));
    window.dispatchEvent(new Event(PROFILE_EXTENSION_CHANGED));
  } catch {
    /* quota */
  }
}

export function dispatchProfileExtensionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_EXTENSION_CHANGED));
}

/** Resize image file to max dimension & JPEG quality to stay under localStorage pressure. */
export function fileToResizedDataUrl(
  file: File,
  opts: { maxEdge: number; quality: number; mime?: "image/jpeg" | "image/webp" },
): Promise<string> {
  const { maxEdge, quality, mime = "image/jpeg" } = opts;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxEdge / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL(mime, quality));
      } catch {
        reject(new Error("encode"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}
