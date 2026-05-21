import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const salvyaRoot = join(webRoot, "..");

const SOURCES = [
  join(salvyaRoot, "favicon-png.png"),
  join(webRoot, "public", "favicon.png"),
];

function copyFirst(src, dest) {
  if (!existsSync(src)) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log("ok:", dest);
  return true;
}

const source = SOURCES.find((p) => existsSync(p));
if (!source) {
  console.warn("skip favicon: place favicon-png.png at Salvya repo root (next to web/)");
  process.exit(0);
}

const targets = [
  join(webRoot, "public", "favicon.png"),
  join(webRoot, "app", "icon.png"),
  join(webRoot, "app", "apple-icon.png"),
];

for (const dest of targets) {
  copyFirst(source, dest);
}
