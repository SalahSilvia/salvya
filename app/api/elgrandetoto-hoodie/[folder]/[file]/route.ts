import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { isSafeArtistFolderOrFileName, resolveArtistCatalogHoodieFilePath } from "@/lib/artist-folder-catalog";

export const dynamic = "force-dynamic";

function mimeType(filePath: string) {
  const e = extname(filePath).toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(_request: Request, ctx: { params: Promise<{ folder: string; file: string }> }) {
  const { folder: rawFolder, file: rawFile } = await ctx.params;
  const folder = decodeURIComponent(rawFolder);
  const file = decodeURIComponent(rawFile);

  if (!isSafeArtistFolderOrFileName(folder) || !isSafeArtistFolderOrFileName(file)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = resolveArtistCatalogHoodieFilePath("elgrandetoto", folder, file);
  if (!filePath || !existsSync(filePath)) {
    return new Response(null, { status: 404 });
  }

  try {
    const body = readFileSync(filePath);
    return new Response(body, {
      headers: {
        "Content-Type": mimeType(filePath),
        "Cache-Control": "public, max-age=120, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
