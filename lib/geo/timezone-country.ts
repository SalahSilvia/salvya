import { normalizeCountryCode } from "@/lib/geo/country-map";

/** IANA timezone → ISO country (high-confidence home regions only). */
const TZ_TO_COUNTRY: Record<string, string> = {
  "Africa/Casablanca": "MA",
  "Africa/Ceuta": "MA",
  "Europe/Madrid": "ES",
  "Europe/Paris": "FR",
  "Europe/London": "GB",
  "Europe/Rome": "IT",
  "Europe/Berlin": "DE",
  "Europe/Amsterdam": "NL",
  "Europe/Zurich": "CH",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
};

export function countryFromTimezone(timezone: string | null | undefined): string | null {
  if (!timezone || typeof timezone !== "string") return null;
  const tz = timezone.trim();
  if (!tz) return null;

  const direct = TZ_TO_COUNTRY[tz];
  if (direct) return direct;

  return null;
}

export function isMoroccoTimezone(timezone: string | null | undefined): boolean {
  return countryFromTimezone(timezone) === "MA";
}
