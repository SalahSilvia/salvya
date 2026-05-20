#!/usr/bin/env node
/**
 * Import Salvya/Blogs → salvya_blog_posts + blog-images storage
 * Usage: npm run blogs:sync
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const paths = [resolve(root, "salvya.local.env"), resolve(root, ".env.local")];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
    break;
  }
}

loadEnv();
process.env.SALVYA_REPO_ROOT = process.env.SALVYA_REPO_ROOT ?? resolve(root, "..");
process.env.RUN_BLOG_SYNC = "1";

execSync("npx vitest run lib/blog/__tests__/run-blog-sync.test.ts", {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
