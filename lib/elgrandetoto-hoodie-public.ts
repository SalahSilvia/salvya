/** Safe for client components — no `node:fs`. */
export function artistCatalogHoodieImageSrc(artistSlug: string, folder: string, file: string): string {
  return `/api/artist-catalog-hoodie/${encodeURIComponent(artistSlug)}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

/** Model shooting folder — `ModelsShooting Hoodies` under each product folder. */
export function artistCatalogModelHoodieImageSrc(
  artistSlug: string,
  folder: string,
  relativeFile: string,
): string {
  return `/api/artist-catalog-model-hoodie/${encodeURIComponent(artistSlug)}/${encodeURIComponent(folder)}/${encodeURIComponent(relativeFile)}`;
}

export function elgrandetotoHoodieImageSrc(folder: string, file: string): string {
  return artistCatalogHoodieImageSrc("elgrandetoto", folder, file);
}
