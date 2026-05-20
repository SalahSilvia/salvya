import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
/** Repo root: folder that contains `web/`, `artists/`, and `Blogs/` */
const salvyaRoot = join(webRoot, "..");
const artistsRoot = join(salvyaRoot, "artists");
const pub = join(webRoot, "public", "media", "artists");

function artistAssetSources(folder, file) {
  return [join(artistsRoot, folder, file), join(salvyaRoot, folder, file)];
}

function copyOne(src, dest) {
  if (!existsSync(src)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log("ok:", dest);
  return true;
}

function copyFirstExisting(sources, dest) {
  for (const src of sources) {
    if (copyOne(src, dest)) return true;
  }
  return false;
}

/** Each slug gets `public/media/artists/{slug}/profile.png` for Next.js. */
const artists = [
  {
    slug: "elgrandetoto",
    sources: [
      ...artistAssetSources("Elgrandetoto", "profile.png"),
      ...artistAssetSources("ElGrandeToto", "profile.png"),
    ],
  },
  {
    slug: "babygang",
    sources: [
      ...artistAssetSources("BabyGang", "babygang-profile.png"),
      ...artistAssetSources("babygang", "babygang-profile.png"),
    ],
  },
  {
    slug: "inkonnu",
    sources: [
      ...artistAssetSources("Inkonnu", "inkonnu-profile.png"),
      ...artistAssetSources("InKonnu", "inkonnu-profile.png"),
    ],
  },
  {
    slug: "tchubi",
    sources: [
      ...artistAssetSources("Tchubi", "tchubi-profile.png"),
      ...artistAssetSources("Ttchubi", "tchubi-profile.png"),
      ...artistAssetSources("Tchubi", "profile.png"),
    ],
  },
];

for (const { slug, sources } of artists) {
  const dest = join(pub, slug, "profile.png");
  if (!copyFirstExisting(sources, dest)) {
    console.warn("skip (missing any of):", sources.join(" | "));
  }
}

const GENERIC_COVER = ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp"];

/** Order matches `app/api/artist-cover/[slug]/route.ts` */
const coverBySlug = [
  {
    slug: "elgrandetoto",
    folders: ["Elgrandetoto", "ElGrandeToto"],
    files: ["cover-elgrandetoto-picture.png", ...GENERIC_COVER],
  },
  {
    slug: "babygang",
    folders: ["BabyGang", "babygang"],
    files: ["babygang cover image.jpg", ...GENERIC_COVER],
  },
  { slug: "inkonnu", folders: ["Inkonnu", "InKonnu"], files: [...GENERIC_COVER] },
  { slug: "tchubi", folders: ["Tchubi", "Ttchubi"], files: [...GENERIC_COVER] },
];

for (const { slug, folders, files } of coverBySlug) {
  let copied = false;
  for (const folder of folders) {
    for (const file of files) {
      const sources = artistAssetSources(folder, file);
      const src = sources.find((p) => existsSync(p));
      if (!src) continue;
      const ext = extname(src).toLowerCase() || ".png";
      const dest = join(pub, slug, `cover${ext}`);
      if (copyOne(src, dest)) {
        copied = true;
        break;
      }
    }
    if (copied) break;
  }
  if (!copied) console.warn("skip cover for:", slug);
}
