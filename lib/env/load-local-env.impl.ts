import fs from "node:fs";
import path from "node:path";

/** Same order as next.config — later files win when merging into the map. */
const OPTIONAL_ENV_FILES = [".env.example", ".env.exmp", "env.exmp", "salvya.local.env"] as const;

function parseEnvFileContents(text: string): Map<string, string> {
  const out = new Map<string, string>();
  const raw = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out.set(key, val);
  }
  return out;
}

function envSearchRoots(): string[] {
  const cwd = process.cwd();
  const roots = new Set<string>([cwd]);
  const webChild = path.join(cwd, "web");
  if (fs.existsSync(path.join(webChild, "package.json"))) roots.add(webChild);
  if (path.basename(cwd) === "web") {
    const parent = path.dirname(cwd);
    if (fs.existsSync(path.join(parent, "web", "package.json"))) roots.add(path.join(parent, "web"));
  }
  return [...roots];
}

/**
 * Reads salvya.local.env (and optional templates) into process.env.
 * Node-only — import from load-local-env.ts or next.config, not from Edge/instrumentation.
 */
export function loadLocalEnvFilesSync(): void {
  const snapshot = { ...process.env };
  const merged = new Map<string, string>();

  for (const root of envSearchRoots()) {
    for (const rel of OPTIONAL_ENV_FILES) {
      const filePath = path.join(root, rel);
      if (!fs.existsSync(filePath)) continue;
      try {
        const text = fs.readFileSync(filePath, "utf8");
        for (const [k, v] of parseEnvFileContents(text)) {
          if (v !== "") merged.set(k, v);
        }
      } catch {
        /* ignore read errors */
      }
    }
  }

  for (const [key, val] of merged) {
    const existing = snapshot[key];
    if (existing !== undefined && existing !== "") continue;
    process.env[key] = val;
  }
}
