/** Morocco only: cash on delivery. Any other ISO code = PayPal only. */
export const CHECKOUT_COUNTRY_MOROCCO = "MA";

/** Legacy session value before per-country ISO list (treat as non-COD). */
export const CHECKOUT_COUNTRY_LEGACY_INTERNATIONAL = "INT";

/**
 * Europe (sovereign states commonly shipped to in the region) + United Kingdom + United States.
 * Excluded: Russia, Belarus (and other high-risk / restricted destinations you asked to omit).
 */
const EUROPE_COUNTRIES: { code: string; label: string }[] = [
  { code: "AD", label: "Andorra" },
  { code: "AL", label: "Albania" },
  { code: "AM", label: "Armenia" },
  { code: "AT", label: "Austria" },
  { code: "AZ", label: "Azerbaijan" },
  { code: "BA", label: "Bosnia and Herzegovina" },
  { code: "BE", label: "Belgium" },
  { code: "BG", label: "Bulgaria" },
  { code: "CH", label: "Switzerland" },
  { code: "CY", label: "Cyprus" },
  { code: "CZ", label: "Czechia" },
  { code: "DE", label: "Germany" },
  { code: "DK", label: "Denmark" },
  { code: "EE", label: "Estonia" },
  { code: "ES", label: "Spain" },
  { code: "FI", label: "Finland" },
  { code: "FR", label: "France" },
  { code: "GB", label: "United Kingdom" },
  { code: "GE", label: "Georgia" },
  { code: "GG", label: "Guernsey" },
  { code: "GR", label: "Greece" },
  { code: "HR", label: "Croatia" },
  { code: "HU", label: "Hungary" },
  { code: "IE", label: "Ireland" },
  { code: "IM", label: "Isle of Man" },
  { code: "IS", label: "Iceland" },
  { code: "IT", label: "Italy" },
  { code: "JE", label: "Jersey" },
  { code: "LI", label: "Liechtenstein" },
  { code: "LT", label: "Lithuania" },
  { code: "LU", label: "Luxembourg" },
  { code: "LV", label: "Latvia" },
  { code: "MC", label: "Monaco" },
  { code: "MD", label: "Moldova" },
  { code: "ME", label: "Montenegro" },
  { code: "MK", label: "North Macedonia" },
  { code: "MT", label: "Malta" },
  { code: "NL", label: "Netherlands" },
  { code: "NO", label: "Norway" },
  { code: "PL", label: "Poland" },
  { code: "PT", label: "Portugal" },
  { code: "RO", label: "Romania" },
  { code: "RS", label: "Serbia" },
  { code: "SE", label: "Sweden" },
  { code: "SI", label: "Slovenia" },
  { code: "SK", label: "Slovakia" },
  { code: "SM", label: "San Marino" },
  { code: "TR", label: "Turkey" },
  { code: "UA", label: "Ukraine" },
  { code: "VA", label: "Vatican City" },
  { code: "XK", label: "Kosovo" },
].sort((a, b) => a.label.localeCompare(b.label, "en"));

const USA_OPTION = { code: "US", label: "United States" } as const;

/** Morocco first (COD), then Europe + UK (A–Z), then United States. */
export const CHECKOUT_COUNTRY_OPTIONS = [
  { code: CHECKOUT_COUNTRY_MOROCCO, label: "Morocco" },
  ...EUROPE_COUNTRIES,
  USA_OPTION,
] as const;

const LABEL_BY_CODE = new Map<string, string>(
  CHECKOUT_COUNTRY_OPTIONS.map((o) => [o.code, o.label]),
);

export function checkoutCountryLabel(code: string): string {
  if (code === CHECKOUT_COUNTRY_LEGACY_INTERNATIONAL) return "International (legacy)";
  return LABEL_BY_CODE.get(code) ?? code;
}

export function isCashOnDeliveryAvailable(countryCode: string): boolean {
  return countryCode === CHECKOUT_COUNTRY_MOROCCO;
}

/** True if `code` is one of the selectable checkout country codes. */
export function isKnownCheckoutCountry(code: string): boolean {
  return LABEL_BY_CODE.has(code);
}
