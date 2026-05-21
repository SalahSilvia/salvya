import "server-only";

import { unstable_cache } from "next/cache";
import { loadStoreSettings } from "@/lib/admin/store-settings";
import { createServiceSupabase } from "@/lib/supabase/service";

export const FALLBACK_FAVICON_PATH = "/favicon.png";
export const BRAND_FAVICON_STORAGE_PATH = "site/favicon.png";

export type SiteBranding = {
  faviconUrl: string;
};

function normalizeFaviconUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("/") && !t.startsWith("//")) return t;
  try {
    const u = new URL(t);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {
    return null;
  }
  return null;
}

async function loadSiteBrandingUncached(): Promise<SiteBranding> {
  const service = createServiceSupabase();
  if (!service) {
    return { faviconUrl: FALLBACK_FAVICON_PATH };
  }
  try {
    const settings = await loadStoreSettings(service);
    const fromDb = normalizeFaviconUrl(settings.platform.faviconUrl);
    return { faviconUrl: fromDb ?? FALLBACK_FAVICON_PATH };
  } catch {
    return { faviconUrl: FALLBACK_FAVICON_PATH };
  }
}

export async function getSiteBranding(): Promise<SiteBranding> {
  return unstable_cache(loadSiteBrandingUncached, ["salvya-site-branding"], {
    revalidate: 300,
  })();
}

export async function getSiteFaviconUrl(): Promise<string> {
  const { faviconUrl } = await getSiteBranding();
  return faviconUrl;
}
