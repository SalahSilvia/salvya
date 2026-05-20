#!/usr/bin/env node
/**
 * Validates required production environment variables (run before go-live).
 * Usage: npm run validate:production-env
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SALVYA_CRON_SECRET",
  "CRON_SECRET",
];

const PAYPAL_REQUIRED = ["NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"];

const FORBIDDEN_PUBLIC = [
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SERVICE_ROLE_KEY",
];

function loadEnvFiles() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  for (const name of ["salvya.local.env", ".env.local", ".env"]) {
    const p = resolve(root, name);
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

function main() {
  loadEnvFiles();

  const missing = REQUIRED.filter((k) => !process.env[k]?.trim());
  const paypalMissing = PAYPAL_REQUIRED.filter((k) => !process.env[k]?.trim());
  const leaked = FORBIDDEN_PUBLIC.filter((k) => process.env[k]?.trim());

  const cron = process.env.SALVYA_CRON_SECRET?.trim();
  const cronAlt = process.env.CRON_SECRET?.trim();
  const cronMismatch = cron && cronAlt && cron !== cronAlt;

  let ok = true;

  if (missing.length) {
    console.error("Missing required env:", missing.join(", "));
    ok = false;
  } else {
    console.log("Required env: OK");
  }

  if (paypalMissing.length) {
    console.warn("PayPal not fully configured (needed for card checkout):", paypalMissing.join(", "));
  } else {
    const mode = (process.env.PAYPAL_MODE ?? process.env.PAYPAL_ENVIRONMENT ?? "sandbox").toLowerCase();
    if (mode !== "live" && mode !== "production") {
      console.warn("PayPal mode is sandbox — set PAYPAL_MODE=live for production payments");
    } else {
      console.log("PayPal: OK (live mode)");
    }
  }

  if (cronMismatch) {
    console.warn("SALVYA_CRON_SECRET and CRON_SECRET differ — set both to the same value for Vercel Cron");
  } else if (cron && cronAlt) {
    console.log("Cron secrets: OK (aligned)");
  }

  if (leaked.length) {
    console.error("Forbidden public env keys set:", leaked.join(", "));
    ok = false;
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("RESEND_API_KEY unset — transactional emails may fail");
  }

  process.exit(ok ? 0 : 1);
}

main();
