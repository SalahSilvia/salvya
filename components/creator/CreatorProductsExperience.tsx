"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { PromoteSuccessModal } from "@/components/creator/PromoteSuccessModal";
import { CreatorProductsHero } from "@/components/creator/products/CreatorProductsHero";
import { CreatorProductCard } from "@/components/creator/products/CreatorProductCard";
import { creatorEyebrow } from "@/lib/theme/creator-accent";

type Props = {
  products: StorefrontProductWithVariants[];
  promotedProductIds: string[];
};

type Filter = "all" | "promoted" | "available";

export function CreatorProductsExperience({ products, promotedProductIds }: Props) {
  const reduceMotion = useReducedMotion();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<CreatorProductLinkWithProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const promotedSet = useMemo(() => new Set(promotedProductIds), [promotedProductIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "promoted" && !promotedSet.has(p.id)) return false;
      if (filter === "available" && promotedSet.has(p.id)) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.artistSlug.toLowerCase().includes(needle)
      );
    });
  }, [products, q, filter, promotedSet]);

  async function promote(productId: string) {
    setBusyId(productId);
    setError(null);
    try {
      const res = await fetch("/api/creator/product-links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const body = (await res.json()) as { ok?: boolean; link?: CreatorProductLinkWithProduct; error?: string };
      if (!res.ok || !body.ok || !body.link) throw new Error(body.error ?? "Could not promote product");
      setSuccessLink(body.link);
      setModalOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Promote failed");
    } finally {
      setBusyId(null);
    }
  }

  const fade = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <motion.div className="space-y-8 pb-6" {...fade} transition={{ duration: 0.35 }}>
      <CreatorProductsHero
        query={q}
        onQueryChange={setQ}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={products.length}
        promotedCount={promotedProductIds.length}
        visibleCount={filtered.length}
      />

      {error ? (
        <p
          className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/50 to-rose-900/20 px-4 py-3 text-[13px] text-rose-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-violet-500/25 bg-violet-500/[0.04] px-6 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 text-violet-200 ring-1 ring-white/10">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
              <path
                d="M6 7h12M6 12h12M6 17h8M4 4h16v16H4V4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-5 text-[16px] font-semibold text-white/85">No products match</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-white/42">
            {filter !== "all" || q.trim()
              ? "Try clearing filters or search with a different keyword."
              : "The catalog is empty right now — check back when new drops go live."}
          </p>
          {filter !== "all" || q.trim() ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
              className="mt-6 text-[13px] font-semibold text-fuchsia-300/90 hover:text-fuchsia-200"
            >
              Reset filters
            </button>
          ) : null}
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <p className={creatorEyebrow}>Catalog grid</p>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/35 to-transparent" />
            <span className="text-[12px] tabular-nums text-white/35">{filtered.length} items</span>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, i) => (
              <CreatorProductCard
                key={product.id}
                product={product}
                index={i}
                isPromoted={promotedSet.has(product.id)}
                busy={busyId === product.id}
                onPromote={() => void promote(product.id)}
              />
            ))}
          </ul>
        </section>
      )}

      <PromoteSuccessModal open={modalOpen} link={successLink} onClose={() => setModalOpen(false)} />
    </motion.div>
  );
}
