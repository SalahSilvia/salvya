import type { SalvyaDomain } from "@/lib/mfe/types";

/**
 * Lazy domain entrypoints — each import() becomes its own webpack/async chunk.
 * Route layouts call these; do not import creator/admin modules from store code.
 */
export async function loadDomain(domain: SalvyaDomain) {
  switch (domain) {
    case "store":
      return import("@/domains/store");
    case "creator":
      return import("@/domains/creator");
    case "admin":
      return import("@/domains/admin");
    default: {
      const _exhaustive: never = domain;
      return _exhaustive;
    }
  }
}

export async function loadStoreDomain() {
  return loadDomain("store");
}

export async function loadCreatorDomain() {
  return loadDomain("creator");
}

export async function loadAdminDomain() {
  return loadDomain("admin");
}
