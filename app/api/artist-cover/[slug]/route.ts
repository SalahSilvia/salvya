import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { cwd } from "node:process";
import { artistFolderFileCandidates } from "@/lib/salvya-paths";

export const dynamic = "force-dynamic";

/** Parent folders next to `web/` (try in order) */
const SLUG_FOLDERS: Record<string, string[]> = {
  elgrandetoto: ["Elgrandetoto", "ElGrandeToto"],
  babygang: ["BabyGang", "babygang"],
  inkonnu: ["Inkonnu", "InKonnu"],
  tchubi: ["Tchubi", "Ttchubi"],
  "billie-eilish": ["Billie Eilish"],
  drake: ["Drake"],
  "the-weeknd": ["The Weeknd"],
};

const GENERIC_COVER_NAMES = ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp"];

/**
 * Filenames tried inside each folder (project-specific first, then generic `cover.*`).
 * Examples: `cover-elgrandetoto-picture.png`, `babygang cover image.jpg`
 */
const SLUG_COVER_FILENAMES: Record<string, string[]> = {
  elgrandetoto: ["cover-elgrandetoto-picture.png", ...GENERIC_COVER_NAMES],
  babygang: ["babygang cover image.jpg", ...GENERIC_COVER_NAMES],
  tchubi: [...GENERIC_COVER_NAMES],
  inkonnu: [...GENERIC_COVER_NAMES],
  "billie-eilish": ["cover  of billier.webp", ...GENERIC_COVER_NAMES],
  drake: ["cover of drake.webp", ...GENERIC_COVER_NAMES],
  "the-weeknd": ["cover.webp", ...GENERIC_COVER_NAMES],
};

function mimeType(filePath: string) {
  const e = extname(filePath).toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

function appendScannedPublicArtistCovers(slug: string, out: string[]): void {
  const add = (p: string) => {
    if (p && !out.includes(p)) out.push(p);
  };
  const dirs = [join(cwd(), "public", "media", "artists", slug), join(cwd(), "web", "public", "media", "artists", slug)];
  const imageRe = /\.(png|jpe?g|webp)$/i;
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    try {
      const names = readdirSync(dir).filter((n) => imageRe.test(n));
      names.sort((a, b) => {
        const ac = /^cover/i.test(a) ? 0 : 1;
        const bc = /^cover/i.test(b) ? 0 : 1;
        if (ac !== bc) return ac - bc;
        return a.localeCompare(b);
      });
      for (const name of names) add(join(dir, name));
    } catch {
      /* ignore unreadable dirs */
    }
  }
}

function collectCandidatePaths(slug: string): string[] {
  const out: string[] = [];
  const add = (p: string) => {
    if (p && !out.includes(p)) out.push(p);
  };

  const folders = SLUG_FOLDERS[slug];
  const names = SLUG_COVER_FILENAMES[slug];
  if (!folders || !names) return out;

  // Normalized copies from `npm run copy-profiles` → `public/.../cover.{png|jpg|…}`
  for (const name of GENERIC_COVER_NAMES) {
    add(join(cwd(), "public", "media", "artists", slug, name));
    add(join(cwd(), "web", "public", "media", "artists", slug, name));
  }

  for (const folder of folders) {
    for (const name of names) {
      for (const p of artistFolderFileCandidates(folder, name)) add(p);
    }
  }

  appendScannedPublicArtistCovers(slug, out);

  return out;
}

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  if (!SLUG_FOLDERS[slug]) {
    return new Response("Not found", { status: 404 });
  }

  for (const filePath of collectCandidatePaths(slug)) {
    if (!existsSync(filePath)) continue;
    try {
      const body = readFileSync(filePath);
      return new Response(body, {
        headers: {
          "Content-Type": mimeType(filePath),
          "Cache-Control": "public, max-age=120, stale-while-revalidate=86400",
        },
      });
    } catch {
      continue;
    }
  }

  return new Response(null, { status: 404 });
}
