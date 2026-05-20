#!/usr/bin/env node
/**
 * Checks that expected Supabase tables exist (service role).
 * Usage: npm run db:verify
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in salvya.local.env
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Core tables required for storefront + admin + creator launch */
const TABLES = [
  // Customer
  "customer_carts",
  "customer_likes",
  "customer_artist_follows",
  "product_reviews",
  "customer_notifications",
  "customer_orders",
  "customer_addresses",
  // Auth / RBAC
  "user_profiles",
  "admin_audit_log",
  // Catalog
  "salvya_products",
  "salvya_artists",
  "product_variants",
  "product_metrics",
  // Orders / payments
  "order_status_history",
  "payment_audit_logs",
  "abandoned_checkouts",
  // Ops
  "store_settings",
  "analytics_events",
  "analytics_sessions",
  "salvya_blog_posts",
  "salvya_influencer_applications",
  "email_send_log",
  // Creator programme
  "creator_applications",
  "creator_profiles",
  "creator_product_links",
  "creator_events",
  "creator_earnings",
  "creator_wallet_balance",
  "creator_notifications",
  "creator_leaderboard_weekly",
];

async function main() {
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in salvya.local.env");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  let ok = 0;
  let fail = 0;
  const missing = [];

  for (const table of TABLES) {
    const { error } = await sb.from(table).select("*", { head: true, count: "exact" }).limit(1);
    if (error) {
      console.log(`✗ ${table} — ${error.message}`);
      missing.push(table);
      fail++;
    } else {
      console.log(`✓ ${table}`);
      ok++;
    }
  }

  console.log(`\n${ok}/${TABLES.length} tables reachable.`);
  if (fail) {
    console.log("\nMissing tables — apply migrations:");
    console.log("  1. Supabase Dashboard → SQL Editor");
    console.log("  2. Paste and run: supabase/APPLY-ALL-MIGRATIONS.sql");
    console.log("  3. npm run db:verify");
    if (missing.length <= 8) {
      console.log("\nMissing:", missing.join(", "));
    }
    process.exit(1);
  }
  console.log("\nSchema looks ready for launch.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
