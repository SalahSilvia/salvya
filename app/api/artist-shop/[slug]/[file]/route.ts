import { readFileSync } from "node:fs";
import {
  ARTIST_SHOP_SLUG_FOLDERS,
  artistShopFileMimeType,
  isSafeArtistShopFilename,
  resolveArtistShopFilePath,
} from "@/lib/catalog/artist-shop-file";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file: rawFile } = await ctx.params;
  const file = decodeURIComponent(rawFile);

  if (!ARTIST_SHOP_SLUG_FOLDERS[slug] || !isSafeArtistShopFilename(file)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = resolveArtistShopFilePath(slug, file);
  if (!filePath) {
    return new Response(null, { status: 404 });
  }

  try {
    const body = readFileSync(filePath);
    return new Response(body, {
      headers: {
        "Content-Type": artistShopFileMimeType(filePath),
        "Cache-Control": "public, max-age=120, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
