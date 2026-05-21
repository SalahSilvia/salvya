/**
 * Inline SSR hint so the document root reflects pricing region before React hydrates.
 * Reduces MAD/EUR flash when cookies already say Morocco.
 */
export function GeoSSRRegionBridge({
  country,
  currency,
}: {
  country: string;
  currency: string;
}) {
  const safeCountry = country.replace(/'/g, "");
  const safeCurrency = currency.replace(/'/g, "");
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.dataset.salvyaCountry='${safeCountry}';document.documentElement.dataset.salvyaCurrency='${safeCurrency}';`,
      }}
    />
  );
}
