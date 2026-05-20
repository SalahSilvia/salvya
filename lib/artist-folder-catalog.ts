import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
/**
 * @deprecated MIGRATION / IMPORT ONLY — folder catalog is not merged into live storefront.
 * Use admin **Sync folders → Supabase** and published `salvya_products` rows.
 */
import { orderHoodieImages } from "@/lib/shop-data";
import { artistFolderRootCandidates } from "@/lib/salvya-paths";

import type { ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";
import {
  resolvePublicCatalogHoodieFilePath,
  resolvePublicCatalogTshirtFilePath,
} from "@/lib/media/catalog-public-disk";
export { ARTIST_FOLDER_CATALOG_SLUGS, isArtistFolderCatalogSlug, type ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";

/** Max folder-backed hoodie / tee rows per artist in carousels (UI). Catalog sync scans higher. */
export const ARTIST_FOLDER_CATALOG_MAX = 24;

/** Full filesystem scan for admin catalog → Supabase sync. */
export const ARTIST_FOLDER_CATALOG_SYNC_MAX = 500;

const ROOT_FOLDERS: Record<ArtistFolderCatalogSlug, readonly string[]> = {
  elgrandetoto: ["Elgrandetoto", "ElGrandeToto"],
  babygang: ["BabyGang", "babygang"],
  inkonnu: ["Inkonnu", "InKonnu"],
} as const;

export function isSafeArtistFolderOrFileName(name: string): boolean {
  if (!name || name.length > 180) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\") || name.includes("\0")) {
    return false;
  }
  return true;
}

export function resolveArtistCatalogRoot(slug: ArtistFolderCatalogSlug): string | null {
  const folders = ROOT_FOLDERS[slug];
  const candidates: string[] = [];
  for (const dir of folders) {
    candidates.push(...artistFolderRootCandidates(dir));
  }
  for (const p of candidates) {
    try {
      if (existsSync(p) && statSync(p).isDirectory()) return p;
    } catch {
      continue;
    }
  }
  return null;
}

function listImageFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    return [];
  }
}

export type ArtistFolderHoodieItem = {
  folder: string;
  title: string;
  orderedFiles: string[];
};

export function getArtistHoodieItemFolders(
  slug: ArtistFolderCatalogSlug,
  max = ARTIST_FOLDER_CATALOG_MAX,
): string[] {
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return [];

  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const folders = entries
    .filter((e) => e.isDirectory() && isSafeArtistFolderOrFileName(e.name))
    .map((e) => e.name)
    .filter((name) => existsSync(join(root, name, "hoodie")))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return folders.slice(0, max);
}

export function getArtistFolderHoodieItem(slug: ArtistFolderCatalogSlug, folder: string): ArtistFolderHoodieItem | null {
  const root = resolveArtistCatalogRoot(slug);
  if (!root || !isSafeArtistFolderOrFileName(folder)) return null;
  const hoodieDir = join(root, folder, "hoodie");
  const raw = listImageFiles(hoodieDir);
  if (!raw.length) return null;
  const orderedFiles = orderHoodieImages(raw.map((file) => ({ file }))).map((x) => x.file);
  return { folder, title: folder, orderedFiles };
}

export function getArtistHoodieCarouselItems(
  slug: ArtistFolderCatalogSlug,
  max = ARTIST_FOLDER_CATALOG_MAX,
): ArtistFolderHoodieItem[] {
  const folders = getArtistHoodieItemFolders(slug, max);
  const out: ArtistFolderHoodieItem[] = [];
  for (const folder of folders) {
    const item = getArtistFolderHoodieItem(slug, folder);
    if (item) out.push(item);
  }
  return out;
}

const TSHIRT_SUBDIRS = ["tshirt", "Tshirt", "t-shirt", "T-shirt", "tshirts", "TShirt", "tee", "Tee"] as const;

export function resolveArtistTshirtDir(root: string, folder: string): string | null {
  for (const sub of TSHIRT_SUBDIRS) {
    const p = join(root, folder, sub);
    try {
      if (existsSync(p) && statSync(p).isDirectory()) return p;
    } catch {
      continue;
    }
  }
  return null;
}

export type ArtistFolderTshirtItem = {
  folder: string;
  title: string;
  orderedFiles: string[];
};

export function getArtistTshirtItemFolders(slug: ArtistFolderCatalogSlug, max = ARTIST_FOLDER_CATALOG_MAX): string[] {
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return [];

  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const folders = entries
    .filter((e) => e.isDirectory() && isSafeArtistFolderOrFileName(e.name))
    .map((e) => e.name)
    .filter((name) => {
      const d = resolveArtistTshirtDir(root, name);
      if (!d) return false;
      return listImageFiles(d).length > 0;
    })
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return folders.slice(0, max);
}

export function getArtistFolderTshirtItem(slug: ArtistFolderCatalogSlug, folder: string): ArtistFolderTshirtItem | null {
  const root = resolveArtistCatalogRoot(slug);
  if (!root || !isSafeArtistFolderOrFileName(folder)) return null;
  const tshirtDir = resolveArtistTshirtDir(root, folder);
  if (!tshirtDir) return null;
  const raw = listImageFiles(tshirtDir);
  if (!raw.length) return null;
  const orderedFiles = orderHoodieImages(raw.map((file) => ({ file }))).map((x) => x.file);
  return { folder, title: folder, orderedFiles };
}

export function getArtistTshirtCarouselItems(
  slug: ArtistFolderCatalogSlug,
  max = ARTIST_FOLDER_CATALOG_MAX,
): ArtistFolderTshirtItem[] {
  const folders = getArtistTshirtItemFolders(slug, max);
  const out: ArtistFolderTshirtItem[] = [];
  for (const folder of folders) {
    const item = getArtistFolderTshirtItem(slug, folder);
    if (item) out.push(item);
  }
  return out;
}

export function resolveArtistCatalogHoodieFilePath(
  slug: ArtistFolderCatalogSlug,
  folder: string,
  file: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(folder) || !isSafeArtistFolderOrFileName(file)) return null;
  const bundled = resolvePublicCatalogHoodieFilePath(slug, folder, file);
  if (bundled) return bundled;
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return null;
  const p = join(root, folder, "hoodie", file);
  return existsSync(p) ? p : null;
}

export function resolveArtistCatalogTshirtFilePath(
  slug: ArtistFolderCatalogSlug,
  folder: string,
  file: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(folder) || !isSafeArtistFolderOrFileName(file)) return null;
  const bundled = resolvePublicCatalogTshirtFilePath(slug, folder, file);
  if (bundled) return bundled;
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return null;
  const tshirtDir = resolveArtistTshirtDir(root, folder);
  if (!tshirtDir) return null;
  const p = join(tshirtDir, file);
  return existsSync(p) ? p : null;
}
