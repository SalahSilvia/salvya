import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import {
  apiCatalogUrlToPublicMediaPath,
  normalizeProductImageUrl as normalizeProductImageUrlBase,
} from "@/lib/media/product-image-url-core";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

export {
  apiCatalogUrlToPublicMediaPath,
  normalizeProductImageList,
  normalizeProductImageUrl,
} from "@/lib/media/product-image-url-core";

export function publicMediaFileExists(publicPath: string): boolean {
  if (!publicPath.startsWith("/media/")) return false;
  const disk = join(cwd(), "public", publicPath.replace(/^\//, "").split("/").join("/"));
  return existsSync(disk);
}

/** Server-only: prefer `/media/*` only when the file exists on disk (local dev without copy). */
export function normalizeProductImageUrlForApi(raw: string | null | undefined): string | null {
  const base = normalizeProductImageUrlBase(raw);
  if (!base?.startsWith("/api/")) return base;
  const publicPath = apiCatalogUrlToPublicMediaPath(base);
  if (publicPath && (process.env.VERCEL === "1" || publicMediaFileExists(publicPath))) {
    return publicPath;
  }
  return base;
}

export function supabaseStorageHostname(): string | null {
  const base = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}
