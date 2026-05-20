import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  isSafeArtistFolderOrFileName,
  resolveArtistCatalogRoot,
} from "@/lib/artist-folder-catalog";
import type { ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";

export type ModelShotKind = "hoodie" | "tee";

const HOODIE_MODEL_DIR = /models?\s*shooting\s*hoodies?/i;
const TEE_MODEL_DIR = /models?\s*shooting\s*t-?shirts?/i;

function isModelDirName(name: string, kind: ModelShotKind): boolean {
  return kind === "hoodie" ? HOODIE_MODEL_DIR.test(name) : TEE_MODEL_DIR.test(name);
}

export function resolveProductModelShotDir(
  catalogRoot: string,
  productFolder: string,
  kind: ModelShotKind,
): string | null {
  if (!isSafeArtistFolderOrFileName(productFolder)) return null;
  const productPath = join(catalogRoot, productFolder);

  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(productPath, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const e of entries) {
    if (!e.isDirectory() || !isSafeArtistFolderOrFileName(e.name)) continue;
    if (!isModelDirName(e.name, kind)) continue;
    const p = join(productPath, e.name);
    try {
      if (existsSync(p) && statSync(p).isDirectory()) return p;
    } catch {
      continue;
    }
  }
  return null;
}

export type ModelShotFile = {
  /** Basename used for black/white detection */
  filename: string;
  /** Path relative to the model folder (for API / disk resolve) */
  relativePath: string;
};

function listImagesInDir(dir: string, prefix = ""): ModelShotFile[] {
  const out: ModelShotFile[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const e of entries) {
    if (!isSafeArtistFolderOrFileName(e.name)) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const full = join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...listImagesInDir(full, rel));
      continue;
    }
    if (!/\.(png|jpe?g|webp)$/i.test(e.name)) continue;
    out.push({ filename: e.name, relativePath: rel });
  }

  return out;
}

export function listArtistFolderModelShotFiles(
  slug: ArtistFolderCatalogSlug,
  productFolder: string,
  kind: ModelShotKind,
): ModelShotFile[] {
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return [];
  const modelDir = resolveProductModelShotDir(root, productFolder, kind);
  if (!modelDir) return [];

  return listImagesInDir(modelDir).sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, undefined, { sensitivity: "base" }),
  );
}

export function resolveArtistCatalogModelHoodieFilePath(
  slug: ArtistFolderCatalogSlug,
  productFolder: string,
  relativeFile: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(productFolder) || !isSafeRelativeImagePath(relativeFile)) {
    return null;
  }
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return null;
  const modelDir = resolveProductModelShotDir(root, productFolder, "hoodie");
  if (!modelDir) return null;
  const p = join(modelDir, relativeFile);
  return existsSync(p) ? p : null;
}

export function resolveArtistCatalogModelTshirtFilePath(
  slug: ArtistFolderCatalogSlug,
  productFolder: string,
  relativeFile: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(productFolder) || !isSafeRelativeImagePath(relativeFile)) {
    return null;
  }
  const root = resolveArtistCatalogRoot(slug);
  if (!root) return null;
  const modelDir = resolveProductModelShotDir(root, productFolder, "tee");
  if (!modelDir) return null;
  const p = join(modelDir, relativeFile);
  return existsSync(p) ? p : null;
}

function isSafeRelativeImagePath(relative: string): boolean {
  if (!relative || relative.length > 220) return false;
  if (relative.includes("..") || relative.startsWith("/") || relative.startsWith("\\")) return false;
  const parts = relative.split(/[/\\]/);
  return parts.every((p) => isSafeArtistFolderOrFileName(p));
}
