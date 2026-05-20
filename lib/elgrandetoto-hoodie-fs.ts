/**
 * ElGrandeToto folder-backed hoodies — implemented via {@link ./artist-folder-catalog}.
 * Other artists (BabyGang, Inkonnu) use the same shapes from `artist-folder-catalog`.
 */
import {
  ARTIST_FOLDER_CATALOG_MAX,
  getArtistFolderHoodieItem,
  getArtistHoodieCarouselItems,
  getArtistHoodieItemFolders,
  isSafeArtistFolderOrFileName,
  resolveArtistCatalogRoot,
  type ArtistFolderCatalogSlug,
  type ArtistFolderHoodieItem,
} from "@/lib/artist-folder-catalog";

export const ELGRANDETOTO_HOODIE_CAROUSEL_MAX = ARTIST_FOLDER_CATALOG_MAX;

const ELGT = "elgrandetoto" as const satisfies ArtistFolderCatalogSlug;

export type ElgrandetotoFolderHoodieItem = ArtistFolderHoodieItem;

export function resolveElgrandetotoRoot(): string | null {
  return resolveArtistCatalogRoot(ELGT);
}

export const isSafeElgtFolderOrFileName = isSafeArtistFolderOrFileName;

export function getElgrandetotoHoodieItemFolders(max = ARTIST_FOLDER_CATALOG_MAX): string[] {
  return getArtistHoodieItemFolders(ELGT, max);
}

export function getElgrandetotoFolderHoodieItem(folder: string): ElgrandetotoFolderHoodieItem | null {
  return getArtistFolderHoodieItem(ELGT, folder);
}

export function getElgrandetotoHoodieCarouselItems(max = ARTIST_FOLDER_CATALOG_MAX): ElgrandetotoFolderHoodieItem[] {
  return getArtistHoodieCarouselItems(ELGT, max);
}
