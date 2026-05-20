/**
 * Edge-safe entry — no node:fs import at module scope (instrumentation / middleware must not pull fs).
 */

let loaded = false;

function canLoadFromDisk(): boolean {
  return process.env.NEXT_RUNTIME !== "edge";
}

function loadImplModule(): typeof import("./load-local-env.impl") | null {
  const ids = ["./load-local-env.impl", "./load-local-env.impl.js", "./load-local-env.impl.ts"];
  for (const id of ids) {
    try {
      // Lazy require keeps node:fs out of Edge bundles.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(id) as typeof import("./load-local-env.impl");
    } catch {
      /* try next resolution */
    }
  }
  return null;
}

export function ensureLocalEnvLoaded(): void {
  if (loaded || !canLoadFromDisk()) return;
  loaded = true;
  loadImplModule()?.loadLocalEnvFilesSync();
}

export function isResendApiKeyPresent(): boolean {
  ensureLocalEnvLoaded();
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
