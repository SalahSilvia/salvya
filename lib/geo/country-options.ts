import { geoProfileForCountry } from "@/lib/geo/country-map";

/** Countries shown in the menu regional picker (order matters). */
export const MENU_COUNTRY_CODES = ["MA", "FR", "GB", "IT", "ES", "US", "CH", "DE", "EU"] as const;

export type MenuCountryCode = (typeof MENU_COUNTRY_CODES)[number];

export function menuCountryOptions() {
  return MENU_COUNTRY_CODES.map((code) => {
    const profile = geoProfileForCountry(code);
    return {
      code,
      name: profile.countryName,
      flag: profile.flag,
      defaultCurrency: profile.currency,
      defaultLocale: profile.locale,
    };
  });
}
