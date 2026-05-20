"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { creatorCtaButton } from "@/lib/theme/creator-accent";

type Props = {
  open: boolean;
  link: CreatorProductLinkWithProduct | null;
  onClose: () => void;
};

export function PromoteSuccessModal({ open, link, onClose }: Props) {
  const reduceMotion = useReducedMotion();
  const [copyState, setCopyState] = useState<"idle" | "link" | "code">("idle");

  async function copy(text: string, kind: "link" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(kind);
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("idle");
    }
  }

  return (
    <AnimatePresence>
      {open && link ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="promote-success-title"
            className="w-full max-w-md rounded-[1.35rem] border border-white/[0.12] bg-[#0c0814]/95 p-6 shadow-2xl backdrop-blur-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">Ready to share</p>
            <h2 id="promote-success-title" className="mt-2 text-xl font-semibold tracking-tight">
              {link.product?.title ?? "Product"} promoted
            </h2>
            <p className="mt-2 text-[14px] text-white/50">Your tracking link is live. Share it with your audience.</p>

            <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Tracking code</p>
              <p className="mt-1 font-mono text-lg font-bold text-fuchsia-200">{link.tracking_code}</p>
            </div>

            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Share URL</p>
              <p className="mt-1 break-all font-mono text-[13px] text-white/80">{link.shareUrl}</p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void copy(link.shareUrl, "link")}
                className={`min-h-11 flex-1 rounded-xl text-[14px] font-semibold text-white ${creatorCtaButton}`}
              >
                {copyState === "link" ? "Copied link" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => void copy(link.creator_code, "code")}
                className="min-h-11 flex-1 rounded-xl border border-white/15 bg-white/[0.06] text-[14px] font-semibold text-white/85 hover:bg-white/10"
              >
                {copyState === "code" ? "Copied code" : "Copy promo code"}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-[13px] font-semibold text-white/45 hover:text-white/70"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
