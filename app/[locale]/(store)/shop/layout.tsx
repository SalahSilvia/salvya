import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchPublishedProductsByArtist } from "@/lib/catalog/fetch-published-products";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { resolveSalvyaLocale } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("shop"), getLocale()]);
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/shop",
    locale,
    keywords: [
      "artist merch shop",
      "limited drops",
      "official hoodies",
      "graphic tees",
      "Salvya shop",
      "ElGrandeToto merch",
    ],
  });
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveSalvyaLocale(await getLocale());
  const products = await fetchPublishedProductsByArtist("elgrandetoto");

  const listItems = products
    .filter((p) => p.images.length > 0)
    .slice(0, 24)
    .map((p) => ({
      name: p.title,
      path: pdpPath(p),
      image: p.images[0] ?? null,
    }));

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Salvya Shop — Official artist merch",
            description:
              "Browse official artist hoodies, graphic tees, and limited drops with secure Salvya checkout.",
            path: "/shop",
            locale,
          }),
          ...(listItems.length
            ? [
                itemListJsonLd({
                  name: "Live merch on Salvya",
                  path: "/shop",
                  locale,
                  items: listItems,
                }),
              ]
            : []),
        ]}
      />
      {children}
    </>
  );
}
