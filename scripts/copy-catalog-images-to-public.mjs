#!/usr/bin/env node
/**
 * Copies artist folder catalog images into public/media/catalog for Vercel static serving.
 * No-op when ../artists is missing on the build machine.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const salvyaRoot = join(webRoot, "..");
const artistsRoot = join(salvyaRoot, "artists");
const pubCatalog = join(webRoot, "public", "media", "catalog");

const SLUGS = ["elgrandetoto", "babygang", "inkonnu"];
const ROOT_FOLDERS = {
  elgrandetoto: ["Elgrandetoto", "ElGrandeToto"],
  babygang: ["BabyGang", "babygang"],
  inkonnu: ["Inkonnu", "InKonnu"],
};

const TSHIRT_SUBDIRS = ["tshirt", "Tshirt", "t-shirt", "T-shirt", "tshirts", "TShirt", "tee", "Tee"];
const HOODIE_MODEL = /models?\s*shooting\s*hoodies?/i;
const TEE_MODEL = /models?\s*shooting\s*t-?shirts?/i;

function safeName(name) {
  if (!name || name.length > 180) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\") || name.includes("\0")) return false;
  return true;
}

function resolveRoot(slug) {
  const folders = ROOT_FOLDERS[slug] ?? [];
  for (const dir of folders) {
    for (const base of [join(artistsRoot, dir), join(salvyaRoot, dir)]) {
      try {
        if (existsSync(base) && statSync(base).isDirectory()) return base;
      } catch {
        /* skip */
      }
    }
  }
  return null;
}

function listImages(dir) {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    return [];
  }
}

function copyTo(dest, src) {
  if (!existsSync(src)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  return true;
}

function walkModelDir(modelDir, slug, folder, kindKey) {
  let n = 0;
  const stack = [{ rel: "", abs: modelDir }];
  while (stack.length) {
    const { rel, abs } = stack.pop();
    let entries;
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!safeName(e.name)) continue;
      const nextAbs = join(abs, e.name);
      if (e.isDirectory()) {
        const nextRel = rel ? `${rel}/${e.name}` : e.name;
        stack.push({ rel: nextRel, abs: nextAbs });
        continue;
      }
      if (!/\.(png|jpe?g|webp)$/i.test(e.name)) continue;
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      const dest = join(pubCatalog, slug, folder, kindKey, ...relPath.split("/"));
      if (copyTo(dest, nextAbs)) n++;
    }
  }
  return n;
}

function processSlug(slug) {
  const root = resolveRoot(slug);
  if (!root) {
    console.warn(`copy-catalog: skip ${slug} (no artist folder)`);
    return 0;
  }

  let copied = 0;
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return 0;
  }

  for (const e of entries) {
    if (!e.isDirectory() || !safeName(e.name)) continue;
    const folder = e.name;
    const productPath = join(root, folder);

    const hoodieDir = join(productPath, "hoodie");
    for (const file of listImages(hoodieDir)) {
      const dest = join(pubCatalog, slug, folder, "hoodie", file);
      if (copyTo(dest, join(hoodieDir, file))) copied++;
    }

    for (const sub of TSHIRT_SUBDIRS) {
      const teeDir = join(productPath, sub);
      try {
        if (!existsSync(teeDir) || !statSync(teeDir).isDirectory()) continue;
      } catch {
        continue;
      }
      for (const file of listImages(teeDir)) {
        const dest = join(pubCatalog, slug, folder, "tshirt", file);
        if (copyTo(dest, join(teeDir, file))) copied++;
      }
      break;
    }

    let subentries;
    try {
      subentries = readdirSync(productPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const se of subentries) {
      if (!se.isDirectory() || !safeName(se.name)) continue;
      const subPath = join(productPath, se.name);
      if (HOODIE_MODEL.test(se.name)) copied += walkModelDir(subPath, slug, folder, "model-hoodie");
      if (TEE_MODEL.test(se.name)) copied += walkModelDir(subPath, slug, folder, "model-tee");
    }
  }

  return copied;
}

if (!existsSync(artistsRoot)) {
  console.log("copy-catalog: skip (no artists/ directory)");
  process.exit(0);
}

let total = 0;
for (const slug of SLUGS) {
  total += processSlug(slug);
}
console.log(`copy-catalog: ${total} files → public/media/catalog`);
