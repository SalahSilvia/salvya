/** Slugs backed by folder trees next to `web/` — safe to import from client components (no `node:fs`). */
export const ARTIST_FOLDER_CATALOG_SLUGS = ["elgrandetoto", "babygang", "inkonnu"] as const;
export type ArtistFolderCatalogSlug = (typeof ARTIST_FOLDER_CATALOG_SLUGS)[number];

export function isArtistFolderCatalogSlug(s: string): s is ArtistFolderCatalogSlug {
  return (ARTIST_FOLDER_CATALOG_SLUGS as readonly string[]).includes(s);
}
