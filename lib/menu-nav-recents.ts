import { artists } from "@/lib/site-data";

const STORAGE_KEY = "salvya-nav-recents-v1";
const MAX = 8;

function safeParse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.startsWith("/")) : [];
  } catch {
    return [];
  }
}

/** Skip noisy or non-page paths */
function shouldRecord(pathname: string): boolean {
  if (!pathname || pathname.length > 200) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/auth/callback") return false;
  return true;
}

export function recordNavPath(pathname: string): void {
  if (typeof window === "undefined" || !shouldRecord(pathname)) return;
  const prev = safeParse(window.localStorage.getItem(STORAGE_KEY));
  const next = [pathname, ...prev.filter((p) => p !== pathname)].slice(0, MAX);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function readNavRecents(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

const STATIC_LABELS: Record<string, string> = {
  "/": "Shop home",
  "/about": "Our story",
  "/preview-bag": "Your bag",
  "/track-order": "Track order",
  "/size-guide": "Size guide",
  "/help-center": "Help center",
  "/login": "Sign in",
  "/register": "Create account",
  "/account/profile": "Profile",
  "/account/settings": "Settings",
  "/creator": "Creator hub",
  "/creator/dashboard": "Creator dashboard",
  "/creator/apply": "Apply as creator",
  "/terms": "Terms",
  "/terms/account": "Account terms",
  "/terms/creator": "Creator programme terms",
  "/shipping": "Shipping",
  "/payment": "Payment",
  "/returns": "Returns",
  "/cookies": "Cookies",
  "/cookies/settings": "Cookie settings",
  "/blog": "Blogs",
  "/blogs": "Blogs",
};

export function labelForRecentPath(path: string): string {
  const base = path.split("?")[0]?.split("#")[0] ?? path;
  if (STATIC_LABELS[base]) return STATIC_LABELS[base];
  const artist = /^\/artist\/([^/]+)/.exec(base);
  if (artist) {
    const slug = artist[1];
    const card = artists.find((a) => a.slug === slug);
    if (card) {
      if (base === `/artist/${slug}`) return `${card.name} shop`;
      return `${card.name} · Shop`;
    }
    return slug.replace(/-/g, " ");
  }
  const tail = base.split("/").filter(Boolean).pop();
  if (!tail) return base;
  return tail.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
