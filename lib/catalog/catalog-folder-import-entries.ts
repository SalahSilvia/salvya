import { listArtistFolderModelShotFiles } from "@/lib/artist-folder-model-shots";
import type { ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";
import { artistCatalogHoodieImageSrc, artistCatalogModelHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogModelTshirtImageSrc, artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import type { FolderImageEntry } from "@/lib/catalog/catalog-folder-colors";

export function folderHoodieImageEntries(
  artistSlug: ArtistFolderCatalogSlug,
  productFolder: string,
  flatFiles: string[],
): FolderImageEntry[] {
  const entries: FolderImageEntry[] = flatFiles.map((file) => ({
    filename: file,
    url: artistCatalogHoodieImageSrc(artistSlug, productFolder, file),
  }));

  for (const shot of listArtistFolderModelShotFiles(artistSlug, productFolder, "hoodie")) {
    entries.push({
      filename: shot.filename,
      url: artistCatalogModelHoodieImageSrc(artistSlug, productFolder, shot.relativePath),
    });
  }

  return entries;
}

export function folderTeeImageEntries(
  artistSlug: ArtistFolderCatalogSlug,
  productFolder: string,
  flatFiles: string[],
): FolderImageEntry[] {
  const entries: FolderImageEntry[] = flatFiles.map((file) => ({
    filename: file,
    url: artistCatalogTshirtImageSrc(artistSlug, productFolder, file),
  }));

  for (const shot of listArtistFolderModelShotFiles(artistSlug, productFolder, "tee")) {
    entries.push({
      filename: shot.filename,
      url: artistCatalogModelTshirtImageSrc(artistSlug, productFolder, shot.relativePath),
    });
  }

  return entries;
}
