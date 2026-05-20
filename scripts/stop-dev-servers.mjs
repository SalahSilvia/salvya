#!/usr/bin/env node
/**
 * Stops Node processes running Next dev for this repo (prevents port 3000 + corrupt .next).
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..").replace(/\//g, "\\");

try {
  const raw = execSync(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = \'node.exe\'\\" | Where-Object { $_.CommandLine -match [regex]::Escape($env:SALVYA_WEB_ROOT) } | Select-Object -ExpandProperty ProcessId"',
    {
      encoding: "utf8",
      env: { ...process.env, SALVYA_WEB_ROOT: root },
    },
  );
  const pids = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
  if (!pids.length) {
    console.log("No Salvya dev Node processes found.");
    process.exit(0);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`stopped pid ${pid}`);
    } catch {
      /* already exited */
    }
  }
} catch {
  console.log("No Salvya dev Node processes found.");
}
