import { existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import type { ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";
import { isSafeArtistFolderOrFileName } from "@/lib/artist-folder-catalog";

function publicCatalogPath(...segments: string[]): string {
  return join(cwd(), "public", "media", "catalog", ...segments);
}

export function resolvePublicCatalogHoodieFilePath(
  slug: ArtistFolderCatalogSlug,
  folder: string,
  file: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(folder) || !isSafeArtistFolderOrFileName(file)) return null;
  const p = publicCatalogPath(slug, folder, "hoodie", file);
  return existsSync(p) ? p : null;
}

export function resolvePublicCatalogTshirtFilePath(
  slug: ArtistFolderCatalogSlug,
  folder: string,
  file: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(folder) || !isSafeArtistFolderOrFileName(file)) return null;
  const p = publicCatalogPath(slug, folder, "tshirt", file);
  return existsSync(p) ? p : null;
}

export function resolvePublicCatalogModelFilePath(
  slug: ArtistFolderCatalogSlug,
  folder: string,
  kind: "model-hoodie" | "model-tee",
  relativeFile: string,
): string | null {
  if (!isSafeArtistFolderOrFileName(folder)) return null;
  if (!relativeFile || relativeFile.includes("..")) return null;
  const parts = relativeFile.split(/[/\\]/);
  if (!parts.every((p) => isSafeArtistFolderOrFileName(p))) return null;
  const p = publicCatalogPath(slug, folder, kind, ...parts);
  return existsSync(p) ? p : null;
}
