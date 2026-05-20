import { normalizeCountryCode } from "@/lib/geo/country-map";

type IpWhoResponse = {
  success?: boolean;
  country_code?: string;
};

/**
 * Resolve ISO country from public IP (used when edge geo headers are missing, e.g. local dev).
 * Fails open — returns null on error or private IPs.
 */
export async function lookupCountryFromIp(ip: string): Promise<string | null> {
  const trimmed = ip.trim();
  if (!trimmed || trimmed.length < 7) return null;

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(trimmed)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoResponse;
    if (!data.success) return null;
    return normalizeCountryCode(data.country_code ?? null);
  } catch {
    return null;
  }
}

/** Uses the requester's IP when no client IP is available (ipwho.is /). */
export async function lookupCountryFromRequester(): Promise<string | null> {
  try {
    const res = await fetch("https://ipwho.is/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoResponse;
    if (!data.success) return null;
    return normalizeCountryCode(data.country_code ?? null);
  } catch {
    return null;
  }
}
