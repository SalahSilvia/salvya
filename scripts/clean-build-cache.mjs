#!/usr/bin/env node
/**
 * Removes Next.js / Turbopack / tooling caches that cause ENOENT manifest errors
 * and HMR corruption when multiple dev processes compete for .next writes.
 */
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const targets = [".next", "node_modules/.cache", ".turbo", ".vercel"];

for (const rel of targets) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    console.log(`skip (missing): ${rel}`);
    continue;
  }
  rmSync(abs, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  console.log(`removed: ${rel}`);
}

console.log("Build cache cleanup complete.");
