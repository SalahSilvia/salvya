import { artists } from "@/lib/site-data";

/** URL-safe artist slug (2–64 chars). */
export function isValidArtistSlugFormat(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (s.length < 2 || s.length > 64) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

const LEGACY_FILESYSTEM_SLUGS = new Set(artists.map((a) => a.slug));

export function isLegacyFilesystemArtistSlug(slug: string): boolean {
  return LEGACY_FILESYSTEM_SLUGS.has(slug.trim().toLowerCase());
}

export function isRemoteImageUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("https://") || u.startsWith("http://");
}
