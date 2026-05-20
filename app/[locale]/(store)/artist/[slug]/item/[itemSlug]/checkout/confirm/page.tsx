import type { Metadata } from "next";
import { getStorefrontArtistBySlug } from "@/lib/artists/get-artists";
import { notFound } from "next/navigation";
import { ProductCheckoutConfirmPage } from "@/components/shop/ProductCheckoutConfirmPage";
import { resolveHoodieCheckoutProduct } from "@/lib/catalog/resolve-checkout-product";
import { parsePreviewSelection, serializePreviewSelection } from "@/lib/shop-preview-selection";

type Props = {
  params: Promise<{ slug: string; itemSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, itemSlug } = await params;
  const sp = await searchParams;
  const artist = await getStorefrontArtistBySlug(slug);
  if (!artist || artist.statusTag === "COMING SOON") return { title: "Confirm — Salvya" };

  const recap = parsePreviewSelection(sp);
  const product = await resolveHoodieCheckoutProduct(slug, itemSlug, recap);
  if (product) {
    return { title: `Confirm · ${product.displayTitle} — Salvya` };
  }

  return { title: "Confirm — Salvya" };
}

export default async function HoodieItemCheckoutConfirmPage({ params, searchParams }: Props) {
  const { slug, itemSlug } = await params;
  const sp = await searchParams;
  const artist = await getStorefrontArtistBySlug(slug);

  if (!artist || artist.statusTag === "COMING SOON") {
    notFound();
  }

  const recap = parsePreviewSelection(sp);
  const product = await resolveHoodieCheckoutProduct(slug, itemSlug, recap);
  if (!product) {
    notFound();
  }

  const previewQueryString = serializePreviewSelection({
    ...recap,
    variantId: product.variantId,
  });
  const returnHref = `/artist/${slug}/item/${itemSlug}`;

  return (
    <ProductCheckoutConfirmPage
      artistName={artist.name}
      displayTitle={product.displayTitle}
      priceLabel={product.priceLabel}
      productKind={product.productKind}
      kindLabel={product.kindLabel}
      soldOut={product.soldOut}
      returnHref={returnHref}
      recapQty={recap.qty}
      recapSize={recap.size}
      recapColorLabel={recap.colorLabel}
      productImageSrc={product.productImageSrc}
      previewQueryString={previewQueryString}
      variantId={product.variantId}
    />
  );
}
