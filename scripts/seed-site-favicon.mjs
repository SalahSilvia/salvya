#!/usr/bin/env node
/**
 * Upload Salvya favicon to Supabase Storage and save public URL in store_settings.platform.
 *
 * Usage: npm run favicon:seed
 * Requires salvya.local.env (or .env.local) with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const salvyaRoot = join(webRoot, "..");
const STORAGE_PATH = "site/favicon.png";
const BUCKET = "brand-assets";

function loadEnv() {
  const paths = [join(webRoot, "salvya.local.env"), join(webRoot, ".env.local")];
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

function resolveFaviconFile() {
  const candidates = [
    join(salvyaRoot, "favicon-png.png"),
    join(webRoot, "public", "favicon.png"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const filePath = resolveFaviconFile();
if (!filePath) {
  console.error("favicon not found — add favicon-png.png at Salvya repo root");
  process.exit(1);
}

const bytes = readFileSync(filePath);
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: uploadError } = await supabase.storage.from(BUCKET).upload(STORAGE_PATH, bytes, {
  contentType: "image/png",
  upsert: true,
  cacheControl: "public, max-age=31536000, immutable",
});

if (uploadError) {
  console.error("Upload failed:", uploadError.message);
  console.error("Apply migration 20250521100000_brand_assets_storage.sql in Supabase first.");
  process.exit(1);
}

const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(STORAGE_PATH);
const faviconUrl = publicData.publicUrl;

const { data: existing } = await supabase.from("store_settings").select("value").eq("key", "platform").maybeSingle();
const platform =
  existing?.value && typeof existing.value === "object"
    ? { ...existing.value, faviconUrl }
    : {
        storeName: "Salvya",
        defaultLocale: "en",
        currency: "EUR",
        supportEmail: "support@salvyastore.com",
        publicSiteUrl: "https://www.salvyastore.com",
        maintenanceMode: false,
        maintenanceBanner: "We are performing scheduled maintenance. Check back shortly.",
        faviconUrl,
      };

const { error: upsertError } = await supabase
  .from("store_settings")
  .upsert({ key: "platform", value: platform }, { onConflict: "key" });

if (upsertError) {
  console.error("store_settings upsert failed:", upsertError.message);
  process.exit(1);
}

console.log("Favicon uploaded:", faviconUrl);
console.log("store_settings.platform.faviconUrl updated.");
