import Link from "next/link";
import type { ReactNode } from "react";
import { ProductReviewsSection } from "@/components/shop/ProductReviewsSection";
import { SuggestedShopItemsCarousel } from "@/components/shop/SuggestedShopItemsCarousel";
import { LogisticsStepsCarousel } from "@/components/shop/pdp/LogisticsStepsCarousel";
import { PdpAccordion } from "@/components/shop/pdp/PdpAccordion";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import type { SuggestedShopItem } from "@/lib/discovery/product-suggestions";

type Props = {
  artistSlug: string;
  artistName: string;
  displayTitle: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  product: StorefrontProduct;
  suggestedItems?: SuggestedShopItem[];
  purchaseBlock?: ReactNode;
};

const SIZE_ROWS: { size: string; chest: string; length: string }[] = [
  { size: "XS", chest: "106 cm", length: "66 cm" },
  { size: "S", chest: "112 cm", length: "68 cm" },
  { size: "M", chest: "118 cm", length: "70 cm" },
  { size: "L", chest: "124 cm", length: "72 cm" },
  { size: "XL", chest: "130 cm", length: "74 cm" },
  { size: "2XL", chest: "136 cm", length: "76 cm" },
];

const LOGISTICS_STEPS = [
  { n: "1", title: "Lock details", body: "Size, color, and quantity stay grouped for one Salvya checkout." },
  { n: "2", title: "Pack & scan", body: "Pieces are folded, checked, and handed to the carrier with tracking." },
  { n: "3", title: "Track & support", body: "Email updates at handoff — same thread if anything needs a tweak." },
];

function SectionHead({ kicker, title, id }: { kicker: string; title: string; id: string }) {
  return (
    <div className="border-l-2 border-[#2D6BFF]/50 pl-4 sm:pl-5">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-white/36">{kicker}</p>
      <h3 id={id} className="mt-2 text-[1.125rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.25rem]">
        {title}
      </h3>
    </div>
  );
}

function fitBulletsFromProduct(product: StorefrontProduct): string[] {
  const lines: string[] = [];
  if (product.description?.trim()) {
    lines.push(product.description.trim());
  }
  if (product.material?.trim()) {
    lines.push(product.material.trim());
  }
  if (product.sizeFit?.trim()) {
    lines.push(product.sizeFit.trim());
  }
  if (lines.length > 0) return lines.slice(0, 5);

  return product.productKind === "hoodie"
    ? [
        "Heavy fleece, dropped shoulder, roomy hood — easy to layer.",
        "Ribbed cuffs and hem hold shape on a cold wash.",
        "Prints are checked so graphics stay clean on dark bases.",
      ]
    : [
        "Mid-weight cotton, relaxed torso — tuck or drape.",
        "Neck rib keeps its line after shows and laundry.",
        "Back-first photos match how the tee reads in a crowd.",
      ];
}

export function ProductItemDetailSections({
  artistSlug,
  artistName,
  displayTitle,
  product,
  productKind,
  itemSlug,
  suggestedItems = [],
  purchaseBlock,
}: Props) {
  const sizeChartRows =
    product.sizes.length > 0
      ? SIZE_ROWS.filter((row) => product.sizes.includes(row.size))
      : SIZE_ROWS;

  const stockLabel = product.soldOut
    ? "Out of stock"
    : product.lowStock
      ? `Low stock — ${product.stock} left`
      : product.preorder
        ? "Pre-order"
        : "In stock";

  return (
    <div className="w-full border-t border-white/[0.07] bg-[#050508]">
      <div className="mx-auto max-w-3xl pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] py-14 sm:py-16">
        {purchaseBlock ? (
          <section className="border-b border-white/[0.06] pb-14 sm:pb-16" aria-label="Purchase options">
            {purchaseBlock}
          </section>
        ) : null}

        <section className="border-b border-white/[0.06] pb-14 sm:pb-16" aria-labelledby="fit-heading">
          <SectionHead kicker="Product" title="Fit & fabric" id="fit-heading" />
          <ul className="mt-8 max-w-xl space-y-4 text-[15px] leading-relaxed text-white/44 sm:text-[16px]">
            {fitBulletsFromProduct(product).map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#2D6BFF]" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-white/[0.06] py-14 sm:py-16" aria-labelledby="ship-heading">
          <SectionHead kicker="Logistics" title="From warehouse to door" id="ship-heading" />
          <LogisticsStepsCarousel steps={LOGISTICS_STEPS} />
        </section>

        <section className="border-b border-white/[0.06] py-14 sm:py-16" aria-labelledby="size-heading">
          <SectionHead kicker="Reference" title="Size chart (flat)" id="size-heading" />
          <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-white/38 sm:text-[14px]">
            Indicative for Salvya oversize patterns. The printed chart in your shipment always wins.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-black/25">
            <table className="w-full min-w-[280px] text-left text-[13px] sm:text-[14px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10px] font-semibold uppercase tracking-normal text-white/42">
                  <th className="px-4 py-3.5 sm:px-5">Size</th>
                  <th className="px-4 py-3.5 sm:px-5">Chest</th>
                  <th className="px-4 py-3.5 sm:px-5">Length</th>
                </tr>
              </thead>
              <tbody className="text-white/48">
                {sizeChartRows.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 1 ? "bg-white/[0.02]" : undefined}>
                    <td className="px-4 py-3 font-medium text-white/75 sm:px-5">{row.size}</td>
                    <td className="px-4 py-3 sm:px-5">{row.chest}</td>
                    <td className="px-4 py-3 sm:px-5">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 border-b border-white/[0.06] py-14 sm:py-16">
          <PdpAccordion kicker="Editorial" title="How to wear it" id="style-heading">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="text-[14px] font-semibold text-white/85">Layer for contrast</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/42">
                  A lighter base under dark graphics keeps the print legible in photos and under stage light.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="text-[14px] font-semibold text-white/85">Quiet accessories</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/42">
                  Let typography and volume do the talking — thin chains or one ring pair best with oversized cuts.
                </p>
              </div>
            </div>
          </PdpAccordion>

          <PdpAccordion kicker="FAQ" title="Good to know" id="faq-heading">
            <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.07] bg-black/20 px-1 sm:px-2">
              <details className="group px-4 py-4 sm:px-5 sm:py-5">
                <summary className="cursor-pointer list-none text-[14px] font-medium text-white/65 [&::-webkit-details-marker]:hidden">
                  Duties outside the EU?
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-white/40 sm:text-[14px]">
                  Taxes depend on destination. Salvya surfaces collected charges before you confirm payment.
                </p>
              </details>
              <details className="group px-4 py-4 sm:px-5 sm:py-5">
                <summary className="cursor-pointer list-none text-[14px] font-medium text-white/65 [&::-webkit-details-marker]:hidden">
                  Change delivery address after ordering?
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-white/40 sm:text-[14px]">
                  If the parcel has not left the hub, support can often reroute — reply on your confirmation thread as
                  early as you can.
                </p>
              </details>
              <details className="group px-4 py-4 sm:px-5 sm:py-5">
                <summary className="cursor-pointer list-none text-[14px] font-medium text-white/65 [&::-webkit-details-marker]:hidden">
                  Final spec on this page?
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-white/40 sm:text-[14px]">
                  Listing data comes from Salvya catalog — GSM, inks, or country of manufacture appear here when set in
                  the product record.
                </p>
              </details>
            </div>
          </PdpAccordion>

          <PdpAccordion kicker="Help" title="Talk to Salvya" id="support-heading">
            <p className="max-w-xl text-[15px] leading-relaxed text-white/44 sm:text-[16px]">
              Mention <span className="font-medium text-white/70">{displayTitle}</span> in your order thread so routing
              stays fast.
            </p>
          </PdpAccordion>
        </section>

        <section className="border-b border-white/[0.06] pb-14 sm:pb-16" aria-label="Comments">
          <ProductReviewsSection
            layout="embedded"
            artistSlug={artistSlug}
            itemSlug={itemSlug}
            productKind={productKind}
            displayTitle={displayTitle}
          />
        </section>

        <section className="border-b border-white/[0.06] pb-14 sm:pb-16" aria-labelledby="artist-heading">
          <SectionHead kicker="Artist" title="Continue in this shop" id="artist-heading" />
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/44 sm:text-[16px]">
            You are viewing <span className="font-medium text-white/72">{displayTitle}</span>. More hoodies, tees, and
            drops from {artistName} live on the shop home.
          </p>
          <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div className="flex items-center gap-5">
              <img
                src={`/api/artist-avatar/${artistSlug}`}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/[0.08] sm:h-[4.5rem] sm:w-[4.5rem]"
                decoding="async"
              />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-white/90">{artistName}</p>
                <p className="mt-1 text-[13px] text-white/40">Official Salvya capsule · {stockLabel}</p>
              </div>
            </div>
            <Link
              href={`/artist/${artistSlug}`}
              className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_10px_32px_-14px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_14px_36px_-12px_rgba(45,107,255,0.62)] sm:w-auto sm:min-w-[10rem] active:scale-[0.99]"
            >
              View shop
            </Link>
          </div>
          {suggestedItems.length > 0 ? (
            <div className="mt-10 border-t border-white/[0.06] pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">More from {artistName}</p>
              <p className="mt-1 text-[13px] text-white/42">Other pieces in this shop — swipe to browse.</p>
              <div className="mt-5">
                <SuggestedShopItemsCarousel items={suggestedItems} artistSlug={artistSlug} />
              </div>
            </div>
          ) : null}
        </section>

        <p className="text-center text-[12px] leading-relaxed text-white/28 sm:text-left">
          {product.soldOut
            ? "This piece is currently sold out — join the notify list above for the next drop."
            : "Prices and stock are loaded from Salvya catalog. On-fabric color can vary slightly from your display."}
        </p>
      </div>
    </div>
  );
}

