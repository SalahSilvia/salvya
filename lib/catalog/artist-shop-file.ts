import "server-only";

import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { cwd } from "node:process";
import { artistFolderFileCandidates } from "@/lib/salvya-paths";

export const ARTIST_SHOP_SLUG_FOLDERS: Record<string, string[]> = {
  elgrandetoto: ["Elgrandetoto", "ElGrandeToto"],
  babygang: ["BabyGang", "babygang"],
  inkonnu: ["Inkonnu", "InKonnu"],
  tchubi: ["Tchubi", "Ttchubi"],
  "billie-eilish": ["Billie Eilish"],
  drake: ["Drake"],
  "the-weeknd": ["The Weeknd"],
};

const SHOP_SUBDIRS = ["shop", "Shop", "hoodies", "Hoodies"];

export function isSafeArtistShopFilename(name: string): boolean {
  if (!name || name.length > 220) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return false;
  return /^[\w.\- ()\[\]]+$/.test(name);
}

export function artistShopFileMimeType(filePath: string): string {
  const e = extname(filePath).toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

/** Candidate absolute paths for a flat shop asset (`artists/{Name}/shop/{file}`). */
export function artistShopFileCandidates(slug: string, file: string): string[] {
  const out: string[] = [];
  const add = (p: string) => {
    if (p && !out.includes(p)) out.push(p);
  };

  const folders = ARTIST_SHOP_SLUG_FOLDERS[slug];
  if (!folders || !isSafeArtistShopFilename(file)) return out;

  add(join(cwd(), "public", "media", "artists", slug, "shop", file));
  add(join(cwd(), "web", "public", "media", "artists", slug, "shop", file));

  for (const folder of folders) {
    for (const sub of SHOP_SUBDIRS) {
      for (const p of artistFolderFileCandidates(folder, sub, file)) add(p);
    }
    for (const p of artistFolderFileCandidates(folder, file)) add(p);
  }

  return out;
}

export function resolveArtistShopFilePath(slug: string, file: string): string | null {
  for (const filePath of artistShopFileCandidates(slug, file)) {
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

export function artistShopFileExists(slug: string, file: string): boolean {
  return resolveArtistShopFilePath(slug, file) !== null;
}

/** Parse `/api/artist-shop/{slug}/{file}` (or relative) and verify the file exists on disk. */
export function artistShopUrlResolvesOnDisk(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const pathOnly = trimmed.replace(/^https?:\/\/[^/]+/i, "");
  const m = pathOnly.match(/\/api\/artist-shop\/([^/]+)\/([^?#]+)/i);
  if (!m) return false;
  const slug = decodeURIComponent(m[1]!);
  const file = decodeURIComponent(m[2]!);
  return artistShopFileExists(slug, file);
}
