"use client";

import { StorefrontProductCarousel } from "@/components/shop/StorefrontProductCarousel";
import { ShopEditorsRack } from "@/components/shop/ShopEditorsRack";
import type { ShopSectionsPayload } from "@/lib/shop/build-shop-sections";
import type { StorefrontCarouselItem } from "@/lib/catalog/storefront-product";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = ShopSectionsPayload;

function SectionHeader({
  kicker,
  title,
  subtitle,
  id,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  id: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease }}
      className="mb-4 px-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7ea3ff]/90">{kicker}</p>
      <h2 id={id} className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      {subtitle ? <p className="mt-1 text-[13px] text-white/42">{subtitle}</p> : null}
    </motion.div>
  );
}

function CarouselSection({
  id,
  kicker,
  title,
  subtitle,
  items,
  label,
}: {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  items: StorefrontCarouselItem[];
  label: string;
}) {
  if (!items.length) return null;
  return (
    <section className="relative border-t border-white/[0.06] py-8" aria-labelledby={id}>
      <SectionHeader kicker={kicker} title={title} subtitle={subtitle} id={id} />
      <div className="relative -mx-5">
        <StorefrontProductCarousel items={items} sectionLabel={label} />
      </div>
    </section>
  );
}

export function ShopItemSections({ limitedDrops, sellingFast, editorsPicks, newArrivals }: Props) {
  const hasContent = limitedDrops.length || sellingFast.length || editorsPicks.length || newArrivals.length;

  if (!hasContent) return null;

  return (
    <div className="border-t border-white/[0.06] bg-[#050508] pb-2 pt-8">
      <CarouselSection
        id="shop-limited"
        kicker="Drops"
        title="Limited heat"
        subtitle="Small runs — when they're gone, they're gone."
        items={limitedDrops}
        label="limited"
      />

      <CarouselSection
        id="shop-new"
        kicker="Just in"
        title="New arrivals"
        subtitle="Latest pieces added to the rack."
        items={newArrivals}
        label="new"
      />

      {editorsPicks.length >= 1 ? <ShopEditorsRack items={editorsPicks} /> : null}

      <CarouselSection
        id="shop-fast"
        kicker="Stock"
        title="Moving fast"
        subtitle="Pieces with heat on them — don't sleep."
        items={sellingFast}
        label="fast"
      />
    </div>
  );
}
