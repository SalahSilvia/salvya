"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { encodeCreatorProductSlug } from "@/lib/creator/product-link-types";
import { CreatorLinkThumb } from "@/components/creator/links/CreatorLinkThumb";
import { creatorCardSurface, creatorCtaGhost } from "@/lib/theme/creator-accent";

type Props = {
  link: CreatorProductLinkWithProduct;
  index: number;
  copyField: "url" | "code" | null;
  onCopyUrl: () => void;
  onCopyCode: () => void;
};

export function CreatorLinkCard({ link, index, copyField, onCopyUrl, onCopyCode }: Props) {
  const reduceMotion = useReducedMotion();
  const title = link.product?.title ?? "Product";
  const created = new Date(link.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const detailSlug =
    link.product?.artistSlug && link.product?.slug
      ? encodeCreatorProductSlug(link.product.artistSlug, link.product.slug)
      : null;
  const conversion =
    link.clicks_count > 0 ? Math.round((link.orders_count / link.clicks_count) * 1000) / 10 : 0;

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.4 }}
      className={`overflow-hidden rounded-[1.25rem] ${creatorCardSurface} transition-shadow duration-300 hover:shadow-[0_28px_70px_-32px_rgba(139,92,246,0.4)]`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <CreatorLinkThumb product={link.product} title={title} className="size-20 sm:size-[5.5rem]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-emerald-400/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200/90">
                Live
              </span>
              {link.product?.artistSlug ? (
                <span className="text-[11px] font-medium text-white/35">{link.product.artistSlug}</span>
              ) : null}
            </div>
            {detailSlug ? (
              <Link
                href={`/creator/products/${detailSlug}`}
                className="mt-1 block truncate text-[16px] font-semibold text-white/92 transition-colors hover:text-fuchsia-200/90"
              >
                {title}
              </Link>
            ) : (
              <p className="mt-1 truncate text-[16px] font-semibold text-white/92">{title}</p>
            )}
            <button
              type="button"
              onClick={onCopyCode}
              className="mt-2 flex max-w-full items-center gap-2 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1.5 text-left transition-colors hover:border-fuchsia-400/35 hover:bg-fuchsia-500/15"
              title="Copy tracking code"
            >
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-fuchsia-300/60">Code</span>
              <span className="truncate font-mono text-[12px] text-fuchsia-100/90">{link.tracking_code}</span>
              <span className="shrink-0 text-[11px] font-semibold text-white/45">
                {copyField === "code" ? "Copied" : "Copy"}
              </span>
            </button>
            <p className="mt-2 text-[12px] text-white/38">Created {created}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:w-52 sm:shrink-0 sm:border-l sm:border-white/[0.06] sm:pl-5">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Clicks" value={link.clicks_count} />
            <MiniStat label="Orders" value={link.orders_count} highlight />
            <MiniStat label="Conv." valueLabel={`${conversion}%`} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-col">
            <button
              type="button"
              onClick={onCopyUrl}
              className={`min-h-10 w-full rounded-xl px-4 text-[13px] font-semibold ${
                copyField === "url"
                  ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                  : `border border-white/15 bg-gradient-to-b from-violet-500/25 to-fuchsia-500/20 text-white ring-1 ring-fuchsia-400/20 hover:from-violet-500/35 hover:to-fuchsia-500/28`
              }`}
            >
              {copyField === "url" ? "Link copied" : "Copy promo link"}
            </button>
            {detailSlug ? (
              <Link
                href={`/creator/products/${detailSlug}`}
                className={`inline-flex min-h-10 w-full items-center justify-center rounded-xl text-center text-[13px] font-semibold ${creatorCtaGhost}`}
              >
                View product
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function MiniStat({
  label,
  value,
  valueLabel,
  highlight,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-2 py-2 text-center ${
        highlight ? "border-violet-500/25 bg-violet-500/10" : "border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/32">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-white">{valueLabel ?? value ?? 0}</p>
    </div>
  );
}
