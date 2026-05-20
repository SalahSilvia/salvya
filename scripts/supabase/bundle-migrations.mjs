#!/usr/bin/env node
/**
 * Concatenates supabase/migrations/*.sql → supabase/APPLY-ALL-MIGRATIONS.sql
 * Usage: node scripts/supabase/bundle-migrations.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const migrationsDir = resolve(root, "supabase/migrations");
const outFile = resolve(root, "supabase/APPLY-ALL-MIGRATIONS.sql");
const logFile = resolve(root, "supabase/MIGRATIONS-LOG.txt");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b));

const header = `-- ================================================================================
-- SALVYA — APPLY ALL MIGRATIONS (single batch for Supabase SQL Editor)
-- Generated: ${new Date().toISOString()}
-- Files: ${files.length} migrations (oldest → newest)
--
-- HOW TO RUN (production launch):
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file and Run
--   3. On success, run supabase/PROMOTE-ADMIN.sql (edit your user id/email)
--   4. cd web && npm run db:verify
--
-- Re-generate after adding migrations:
--   npm run db:bundle
-- ================================================================================

`;

const parts = [header];
for (const file of files) {
  const body = readFileSync(resolve(migrationsDir, file), "utf8").trimEnd();
  parts.push(`\n\n-- ========== ${file} ==========\n\n`);
  parts.push(body);
  parts.push("\n");
}

writeFileSync(outFile, parts.join(""), "utf8");

const backlog = files
  .map((f) => `[PENDING] ${f.padEnd(52)} | | Run via APPLY-ALL-MIGRATIONS.sql`)
  .join("\n");

const log = `================================================================================
SALVYA — MIGRATIONS LOG (append only — newest at bottom)
================================================================================
When you run SQL in Supabase, add one line here so you never get confused.

Format:
  [APPLIED or PENDING] YYYYMMDDHHMMSS_filename.sql | date you ran it | notes

--------------------------------------------------------------------------------
BACKLOG (${files.length} files — apply in one batch: APPLY-ALL-MIGRATIONS.sql)
--------------------------------------------------------------------------------
${backlog}

--------------------------------------------------------------------------------
APPLIED (move ALL backlog lines here after a successful SQL Editor run)
--------------------------------------------------------------------------------
Example:
  [APPLIED] 20250515120000_customer_carts.sql | 2026-05-20 12:00 | APPLY-ALL batch success

(Add your lines below this line)

--------------------------------------------------------------------------------
`;

writeFileSync(logFile, log, "utf8");

console.log(`Bundled ${files.length} migrations → supabase/APPLY-ALL-MIGRATIONS.sql`);
console.log(`Updated supabase/MIGRATIONS-LOG.txt`);
