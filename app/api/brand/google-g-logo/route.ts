import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";

const FILENAME = "Google__G__logo.svg.webp";

/**
 * Serves the Google "G" mark for the login UI. Tries, in order:
 * 1. `web/public/media/Google__G__logo.svg.webp` (committed asset)
 * 2. `Salvya/Google__G__logo.svg.webp` when cwd is `web/` (one level up)
 * 3. `Google__G__logo.svg.webp` in cwd (if dev server cwd is repo root)
 */
function resolveGoogleGPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, "public", "media", FILENAME),
    join(cwd, "..", FILENAME),
    join(cwd, FILENAME),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function GET() {
  const filePath = resolveGoogleGPath();
  if (!filePath) {
    return new Response(
      "Not found. Add the file at web/public/media/Google__G__logo.svg.webp or place Google__G__logo.svg.webp next to the web/ folder.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const buf = readFileSync(filePath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Unreadable file", { status: 500 });
  }
}
