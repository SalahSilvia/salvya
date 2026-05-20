import { artists } from "@/lib/site-data";

/** Display name for storefront UI when only `artistSlug` is on the card. */
export function storefrontArtistDisplayName(artistSlug: string): string {
  const normalized = artistSlug.trim().toLowerCase();
  const match = artists.find((a) => a.slug === normalized);
  if (match) return match.name;
  return normalized
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}
