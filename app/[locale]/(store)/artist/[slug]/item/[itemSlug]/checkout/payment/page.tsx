import type { Metadata } from "next";
import { getStorefrontArtistBySlug } from "@/lib/artists/get-artists";
import { notFound } from "next/navigation";
import { ProductCheckoutPaymentPage } from "@/components/shop/ProductCheckoutPaymentPage";
import { resolveHoodieCheckoutProduct } from "@/lib/catalog/resolve-checkout-product";
import { computePayPalCheckoutTotal } from "@/lib/paypal/checkout-amount";
import { parsePreviewSelection, serializePreviewSelection } from "@/lib/shop-preview-selection";

type Props = {
  params: Promise<{ slug: string; itemSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, itemSlug } = await params;
  const sp = await searchParams;
  const artist = await getStorefrontArtistBySlug(slug);
  if (!artist || artist.statusTag === "COMING SOON") return { title: "Payment — Salvya" };

  const recap = parsePreviewSelection(sp);
  const product = await resolveHoodieCheckoutProduct(slug, itemSlug, recap);
  if (product) {
    return { title: `Payment · ${product.displayTitle} — Salvya` };
  }

  return { title: "Payment — Salvya" };
}

export default async function HoodieItemCheckoutPaymentPage({ params, searchParams }: Props) {
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

  const serverPayPalAmount = computePayPalCheckoutTotal(product.priceLabel, recap.qty, 0, {
    priceCents: product.priceCents,
  });

  return (
    <ProductCheckoutPaymentPage
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
      priceCents={product.priceCents}
      serverPayPalAmount={serverPayPalAmount}
      variantId={product.variantId}
    />
  );
}
