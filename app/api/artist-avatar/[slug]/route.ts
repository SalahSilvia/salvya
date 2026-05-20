import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { cwd } from "node:process";
import { artistFolderFileCandidates } from "@/lib/salvya-paths";

export const dynamic = "force-dynamic";

/** [folder next to `web/`, filename] — same layout as your Desktop/Salvya project */
const SLUG_SOURCES: Record<string, [string, string][]> = {
  elgrandetoto: [
    ["Elgrandetoto", "profile.png"],
    ["ElGrandeToto", "profile.png"],
  ],
  babygang: [
    ["BabyGang", "babygang-profile.png"],
    ["babygang", "babygang-profile.png"],
  ],
  inkonnu: [
    ["Inkonnu", "inkonnu-profile.png"],
    ["InKonnu", "inkonnu-profile.png"],
  ],
  tchubi: [
    ["Tchubi", "tchubi-profile.png"],
    ["Ttchubi", "tchubi-profile.png"],
    ["Tchubi", "profile.png"],
  ],
  "billie-eilish": [["Billie Eilish", "billie Eillish profile.webp"]],
  drake: [["Drake", "profile drake].webp"]],
  "the-weeknd": [["The Weeknd", "profile the weekend.webp"]],
};

function mimeType(filePath: string) {
  const e = extname(filePath).toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

function collectCandidatePaths(slug: string): string[] {
  const out: string[] = [];
  const add = (p: string) => {
    if (p && !out.includes(p)) out.push(p);
  };

  const bundledProfileNames = ["profile.webp", "profile.jpg", "profile.jpeg", "profile.png"] as const;
  for (const name of bundledProfileNames) {
    add(join(cwd(), "public", "media", "artists", slug, name));
    add(join(cwd(), "web", "public", "media", "artists", slug, name));
  }

  const variants = SLUG_SOURCES[slug];
  if (!variants) return out;

  for (const [dir, file] of variants) {
    for (const p of artistFolderFileCandidates(dir, file)) add(p);
  }

  return out;
}

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  if (!SLUG_SOURCES[slug]) {
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
