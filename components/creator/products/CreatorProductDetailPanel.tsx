"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { PromoteSuccessModal } from "@/components/creator/PromoteSuccessModal";
import { creatorCardSurface, creatorCtaButton, creatorCtaGhost, creatorEyebrow } from "@/lib/theme/creator-accent";

type Props = {
  productId: string;
  initialLink: CreatorProductLinkWithProduct | null;
};

export function CreatorProductDetailPanel({ productId, initialLink }: Props) {
  const reduceMotion = useReducedMotion();
  const [link, setLink] = useState<CreatorProductLinkWithProduct | null>(initialLink);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function promote() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/creator/product-links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const body = (await res.json()) as { ok?: boolean; link?: CreatorProductLinkWithProduct; error?: string };
      if (!res.ok || !body.ok || !body.link) throw new Error(body.error ?? "Failed");
      setLink(body.link);
      setModalOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create link");
    } finally {
      setBusy(false);
    }
  }

  async function copyTracking() {
    if (!link?.tracking_code) return;
    try {
      await navigator.clipboard.writeText(link.tracking_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-8 rounded-2xl p-6 sm:p-7 ${creatorCardSurface}`}
      >
        <p className={creatorEyebrow}>Your promo link</p>
        <h2 className="mt-2 text-lg font-semibold text-white/92">Attribution & performance</h2>

        {link ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatBox label="Clicks" value={link.clicks_count} accent="violet" />
            <StatBox label="Orders" value={link.orders_count} accent="fuchsia" />
            <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4 sm:col-span-1">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-white/35">Tracking</dt>
              <dd className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[14px] font-semibold text-fuchsia-100">
                  {link.tracking_code}
                </span>
                <button
                  type="button"
                  onClick={() => void copyTracking()}
                  className="shrink-0 rounded-lg border border-white/12 bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-6 text-[14px] text-white/45">
            Promote this product to generate your first trackable link and start earning commission.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => void promote()}
            className={`min-h-11 flex-1 rounded-xl text-[14px] font-semibold text-white disabled:opacity-60 ${creatorCtaButton}`}
          >
            {busy ? "Working…" : link ? "Refresh promo link" : "Promote this product"}
          </button>
          {link ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`min-h-11 rounded-xl px-5 text-[14px] font-semibold ${creatorCtaGhost}`}
            >
              Share link
            </button>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-[13px] text-rose-200">{error}</p> : null}
      </motion.section>

      <PromoteSuccessModal
        open={modalOpen}
        link={link}
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "violet" | "fuchsia";
}) {
  const ring =
    accent === "violet"
      ? "border-violet-500/25 bg-violet-500/10"
      : "border-fuchsia-500/25 bg-fuchsia-500/10";

  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-white/35">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</dd>
    </div>
  );
}
