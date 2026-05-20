import { compactJsonLd } from "@/lib/seo/json-ld";

type Props = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Renders schema.org JSON-LD (server-safe). */
export function JsonLd({ data }: Props) {
  const nodes = Array.isArray(data) ? data : [data];
  const cleaned = nodes.map((n) => compactJsonLd(n));

  if (cleaned.length === 1) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleaned[0]) }}
      />
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": cleaned.map((n) => {
            const { "@context": _c, ...rest } = n;
            return rest;
          }),
        }),
      }}
    />
  );
}
