import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BRAND_DIR = ["public", "brand"] as const;

export function resolveBrandAssetPath(filename: string): string | null {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, ...BRAND_DIR, filename),
    join(cwd, "public", "media", filename),
    join(cwd, "..", filename),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function serveBrandAsset(
  filename: string,
  contentType: string,
): Response {
  const filePath = resolveBrandAssetPath(filename);
  if (!filePath) {
    return new Response(`Brand asset missing: ${filename}`, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  try {
    const buf = readFileSync(filePath);
    return new Response(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Unreadable brand asset", { status: 500 });
  }
}
