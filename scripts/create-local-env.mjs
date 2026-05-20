import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const dest = join(webRoot, "salvya.local.env");
const template = join(webRoot, "salvya.local.env.template");

if (existsSync(dest)) {
  process.exit(0);
}

if (!existsSync(template)) {
  console.warn("create-local-env: missing salvya.local.env.template");
  process.exit(0);
}

copyFileSync(template, dest);
console.log("Created salvya.local.env — add your PayPal / Supabase keys there (file is gitignored), then restart npm run dev.");
