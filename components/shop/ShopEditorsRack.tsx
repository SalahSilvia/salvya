"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { StorefrontCarouselItem } from "@/lib/catalog/storefront-product";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  items: StorefrontCarouselItem[];
};

export function ShopEditorsRack({ items }: Props) {
  if (!items.length) return null;

  const featured = items[0]!;
  const rest = items.slice(1, 4);

  return (
    <section className="relative border-t border-white/[0.06] py-10" aria-labelledby="shop-editors">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(45,107,255,0.14),transparent)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease }}
        className="relative mb-6 flex items-end justify-between gap-4 px-5"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7ea3ff]/90">Curated</p>
          <h2 id="shop-editors" className="mt-1 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Editor&apos;s rack
          </h2>
          <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-white/45">
            Styled on-model — how the pieces sit on body, not on a hanger.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 sm:inline">
          {items.length} looks
        </span>
      </motion.div>

      <div className="space-y-3 px-5">
        <EditorFeatureCard item={featured} index="01" />
        {rest.length > 0 ? (
          <div className={`grid gap-3 ${rest.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {rest.map((item, i) => (
              <EditorTileCard key={item.id} item={item} index={String(i + 2).padStart(2, "0")} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EditorFeatureCard({ item, index }: { item: StorefrontCarouselItem; index: string }) {
  const price = item.priceLabel.split(" · ")[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease }}
    >
      <Link
        href={item.href}
        className="group relative block overflow-hidden rounded-[1.25rem] border border-white/[0.1] bg-[#0a0a10] shadow-[0_28px_80px_-40px_rgba(45,107,255,0.45)]"
      >
        <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[21/10]">
          {item.modelImageUrl ? (
            <img
              src={item.modelImageUrl}
              alt=""
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full bg-white/[0.04]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/40 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 font-mono text-[11px] font-medium tracking-widest text-white/35">
            {index}
          </span>
          <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
            On model
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9eb6ff]">
              {item.kind === "tshirt" ? "Tee" : "Hoodie"} · featured look
            </p>
            <h3 className="mt-1.5 text-lg font-semibold leading-tight tracking-[-0.03em] text-white sm:text-xl">
              {item.title}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-white ring-1 ring-white/15">
                {price}
              </span>
              <span className="ml-auto text-[12px] font-semibold text-white/70 transition-colors group-hover:text-white">
                Shop the look →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EditorTileCard({ item, index }: { item: StorefrontCarouselItem; index: string }) {
  const price = item.priceLabel.split(" · ")[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease }}
    >
      <Link
        href={item.href}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a10]"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {item.modelImageUrl ? (
            <img
              src={item.modelImageUrl}
              alt=""
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <span className="absolute left-2.5 top-2.5 font-mono text-[10px] text-white/30">{index}</span>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-white">{item.title}</p>
            <p className="mt-1 text-[11px] font-medium text-[#9eb6ff]">{price}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
