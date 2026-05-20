export function artistCatalogTshirtImageSrc(artistSlug: string, folder: string, file: string): string {
  return `/api/artist-catalog-tshirt/${encodeURIComponent(artistSlug)}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

/** Model shooting folder — `ModelsShooting Tshirt(s)` under each product folder. */
export function artistCatalogModelTshirtImageSrc(
  artistSlug: string,
  folder: string,
  relativeFile: string,
): string {
  return `/api/artist-catalog-model-tee/${encodeURIComponent(artistSlug)}/${encodeURIComponent(folder)}/${encodeURIComponent(relativeFile)}`;
}

export function elgrandetotoTshirtImageSrc(folder: string, file: string): string {
  return artistCatalogTshirtImageSrc("elgrandetoto", folder, file);
}
