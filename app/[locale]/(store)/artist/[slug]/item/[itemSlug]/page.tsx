import type { Metadata } from "next";
import { getStorefrontArtistBySlug } from "@/lib/artists/get-artists";
import { notFound } from "next/navigation";
import { loadPublishedPdpProduct } from "@/lib/catalog/load-published-pdp";
import { kindLabelFromProduct } from "@/lib/catalog/storefront-product";
import { resolveStorefrontPriceLabels } from "@/lib/market/storefront-price";
import { likedItemInputFromStorefrontProduct } from "@/lib/member/likes-from-card";
import { getSuggestedProductsForPdp } from "@/lib/discovery/product-suggestions";
import { ProductDbPdp } from "@/components/shop/ProductDbPdp";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductPageMetadata } from "@/lib/seo/product-page";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ locale: string; slug: string; itemSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, itemSlug } = await params;
  const artist = await getStorefrontArtistBySlug(slug);
  if (!artist || artist.statusTag === "COMING SOON") {
    return buildPageMetadata({
      title: "Product",
      description: "Official artist merch on Salvya.",
      path: `/artist/${slug}/item/${itemSlug}`,
      locale,
    });
  }

  const product = await loadPublishedPdpProduct(slug, itemSlug, "hoodie");
  if (!product) {
    return buildPageMetadata({
      title: "Product unavailable",
      description: "This product is not available.",
      path: `/artist/${slug}/item/${itemSlug}`,
      locale,
      robots: { index: false, follow: false },
    });
  }

  return await buildProductPageMetadata(
    product,
    artist.name,
    {
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
    },
    locale,
  );
}

export default async function ArtistHoodieItemPage({ params }: Props) {
  const { locale, slug, itemSlug } = await params;
  const artist = await getStorefrontArtistBySlug(slug);

  if (!artist || artist.statusTag === "COMING SOON") {
    notFound();
  }

  const product = await loadPublishedPdpProduct(slug, itemSlug, "hoodie");
  if (!product) {
    notFound();
  }

  const { priceLabel, compareAtLabel } = await resolveStorefrontPriceLabels(product);
  const suggestedItems = await getSuggestedProductsForPdp(slug, { kind: "hoodie", itemSlug });
  const likedItemInput = likedItemInputFromStorefrontProduct(product, priceLabel);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, artist.name, locale),
          breadcrumbJsonLd(
            [
              { name: "Shop", path: "/shop" },
              { name: artist.name, path: `/artist/${slug}` },
              { name: product.title, path: `/artist/${slug}/item/${itemSlug}` },
            ],
            locale,
          ),
        ]}
      />
      <ProductDbPdp
        product={product}
        artistSlug={slug}
        itemSlug={itemSlug}
        artistName={artist.name}
        displayTitle={product.title}
        priceLabel={priceLabel}
        compareAtLabel={compareAtLabel}
        backHref={`/artist/${slug}`}
        checkoutHref={`/artist/${slug}/item/${itemSlug}/checkout`}
        kindLabel={kindLabelFromProduct(product)}
        productKind="hoodie"
        artistStatusTag={artist.statusTag}
        likedItemInput={likedItemInput}
        suggestedItems={suggestedItems}
      />
    </>
  );
}
