import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreatorProductDetailClient } from "@/components/creator/CreatorProductDetailClient";
import { decodeCreatorProductSlug } from "@/lib/creator/product-link-types";
import { loadCreatorLinkForProduct, resolveProductForCreatorSlug } from "@/lib/creator/product-link-service";
import { resolveCreatorCardImageUrl } from "@/lib/catalog/creator-card-image";
import {
  kindLabelFromProduct,
  priceLabelForProduct,
} from "@/lib/catalog/storefront-product";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeCreatorProductSlug(slug);
  if (!decoded) return { title: "Product — Creators" };
  const product = await resolveProductForCreatorSlug(decoded.artistSlug, decoded.productSlug);
  return { title: product ? `${product.title} — Promote` : "Product — Creators" };
}

export default async function CreatorProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeCreatorProductSlug(slug);
  if (!decoded) notFound();

  const product = await resolveProductForCreatorSlug(decoded.artistSlug, decoded.productSlug);
  if (!product) notFound();

  const session = await getServerSalvyaUser();
  const service = createServiceSupabase();
  const existingLink =
    service && session ? await loadCreatorLinkForProduct(service, session.id, product.id) : null;

  const image = resolveCreatorCardImageUrl(product);

  return (
    <div className="mx-auto max-w-3xl space-y-2 pb-8">
      <Link
        href="/creator/products"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/45 transition-colors hover:text-fuchsia-200/90"
      >
        <span aria-hidden>←</span> Back to catalog
      </Link>

      <article className="overflow-hidden rounded-[1.5rem] border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-[#0a0612] to-[#07040c] shadow-[0_32px_80px_-40px_rgba(139,92,246,0.5)]">
        <div className="relative aspect-[16/10] bg-black/50">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" sizes="100vw" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">No image</div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08050e] via-transparent to-transparent"
          />
          <span className="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-md">
            {product.artistSlug}
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/65">
            {kindLabelFromProduct(product)}
          </p>
          <h1 className="mt-2 bg-gradient-to-br from-white to-white/70 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {product.title}
          </h1>
          <p className="mt-3 text-lg font-semibold text-emerald-200/90">{priceLabelForProduct(product)}</p>
          {product.category ? (
            <p className="mt-2 text-[13px] text-white/40">{product.category}</p>
          ) : null}
          {product.description ? (
            <p className="mt-5 line-clamp-8 text-[14px] leading-relaxed text-white/50">{product.description}</p>
          ) : null}
        </div>
      </article>

      <CreatorProductDetailClient productId={product.id} initialLink={existingLink} />
    </div>
  );
}
