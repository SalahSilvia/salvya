import {
  ARTIST_FOLDER_CATALOG_MAX,
  getArtistFolderTshirtItem,
  getArtistTshirtCarouselItems,
  getArtistTshirtItemFolders,
  resolveArtistTshirtDir,
  type ArtistFolderCatalogSlug,
  type ArtistFolderTshirtItem,
} from "@/lib/artist-folder-catalog";

const ELGT = "elgrandetoto" as const satisfies ArtistFolderCatalogSlug;

export type ElgrandetotoFolderTshirtItem = ArtistFolderTshirtItem;

export { resolveArtistTshirtDir };

export function getElgrandetotoTshirtItemFolders(max = ARTIST_FOLDER_CATALOG_MAX): string[] {
  return getArtistTshirtItemFolders(ELGT, max);
}

export function getElgrandetotoFolderTshirtItem(folder: string): ElgrandetotoFolderTshirtItem | null {
  return getArtistFolderTshirtItem(ELGT, folder);
}

export function getElgrandetotoTshirtCarouselItems(max = ARTIST_FOLDER_CATALOG_MAX): ElgrandetotoFolderTshirtItem[] {
  return getArtistTshirtCarouselItems(ELGT, max);
}
