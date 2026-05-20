import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";

const FILENAME = "SALVYA-LOGO-BLACK-VERSION.png";

/**
 * Serves the black Salvya mark for light UIs. Tries, in order:
 * 1. `web/public/media/SALVYA-LOGO-BLACK-VERSION.png`
 * 2. `Salvya/SALVYA-LOGO-BLACK-VERSION.png` when cwd is `web/` (parent folder)
 * 3. `SALVYA-LOGO-BLACK-VERSION.png` in cwd (repo root)
 */
function resolveLogoPath(): string | null {
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
  const filePath = resolveLogoPath();
  if (!filePath) {
    return new Response(
      `Not found. Place ${FILENAME} in web/public/media/ or next to the web/ folder (Salvya repo root).`,
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const buf = readFileSync(filePath);
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Unreadable file", { status: 500 });
  }
}
