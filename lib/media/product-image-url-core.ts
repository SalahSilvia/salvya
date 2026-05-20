const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function encodePathSegments(segments: string[]): string {
  return segments.map((s) => encodeURIComponent(s)).join("/");
}

/**
 * Map legacy API catalog URLs to static paths under `public/media/` (bundled on Vercel).
 */
export function apiCatalogUrlToPublicMediaPath(url: string): string | null {
  const pathOnly = url.trim().replace(/^https?:\/\/[^/]+/i, "");
  const decoded = decodeURIComponent(pathOnly);

  let m = decoded.match(/^\/api\/artist-catalog-hoodie\/([^/]+)\/([^/]+)\/([^?#]+)/i);
  if (m) {
    return `/media/catalog/${encodePathSegments([m[1]!, m[2]!, "hoodie", m[3]!])}`;
  }

  m = decoded.match(/^\/api\/artist-catalog-tshirt\/([^/]+)\/([^/]+)\/([^?#]+)/i);
  if (m) {
    return `/media/catalog/${encodePathSegments([m[1]!, m[2]!, "tshirt", m[3]!])}`;
  }

  m = decoded.match(/^\/api\/artist-catalog-model-hoodie\/([^/]+)\/([^/]+)\/([^?#]+)/i);
  if (m) {
    const tail = decodeURIComponent(m[3]!).split("/").filter(Boolean);
    return `/media/catalog/${encodePathSegments([m[1]!, m[2]!, "model-hoodie", ...tail])}`;
  }

  m = decoded.match(/^\/api\/artist-catalog-model-tee\/([^/]+)\/([^/]+)\/([^?#]+)/i);
  if (m) {
    const tail = decodeURIComponent(m[3]!).split("/").filter(Boolean);
    return `/media/catalog/${encodePathSegments([m[1]!, m[2]!, "model-tee", ...tail])}`;
  }

  m = decoded.match(/^\/api\/artist-shop\/([^/]+)\/([^?#]+)/i);
  if (m) {
    return `/media/artists/${encodeURIComponent(m[1]!)}/shop/${encodeURIComponent(m[2]!)}`;
  }

  return null;
}

/** Strip localhost origins so production renders same-origin paths. */
export function stripLocalhostOrigin(raw: string): string {
  let u = raw.trim();
  if (u.startsWith("//")) u = `https:${u}`;
  try {
    if (u.startsWith("http://") || u.startsWith("https://")) {
      const parsed = new URL(u);
      if (LOCALHOST_HOSTS.has(parsed.hostname)) {
        return `${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    return u;
  }
  return u;
}

/**
 * Client- and server-safe URL normalization (no filesystem).
 * Rewrites `/api/artist-catalog-*` → `/media/catalog/*` for Vercel static assets.
 */
export function normalizeProductImageUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let u = stripLocalhostOrigin(raw.trim());

  try {
    if (u.startsWith("http://") || u.startsWith("https://")) {
      const parsed = new URL(u);
      if (parsed.pathname.includes("/storage/v1/object/public/")) return u;
      return u;
    }
  } catch {
    return null;
  }

  if (!u.startsWith("/")) return null;

  const publicPath = apiCatalogUrlToPublicMediaPath(u);
  return publicPath ?? u;
}

export function normalizeProductImageList(urls: string[] | null | undefined): string[] {
  if (!urls?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const n = normalizeProductImageUrl(raw);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}
