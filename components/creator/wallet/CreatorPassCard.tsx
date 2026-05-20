"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatCreatorCodeDisplay } from "@/lib/creator/creator-card-url";

/** ISO/IEC 7810 ID-1 — standard payment card proportions (85.6 × 53.98 mm). */
const CARD_ASPECT = "85.6 / 53.98";

type Props = {
  displayName: string;
  creatorCode: string | null;
  memberSince?: string | null;
  loading?: boolean;
};

export function CreatorPassCard({ displayName, creatorCode, memberSince, loading }: Props) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeDisplay = creatorCode ? formatCreatorCodeDisplay(creatorCode) : "— — — —";
  const sinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : null;

  const copyCode = useCallback(
    async (e: MouseEvent) => {
      e.stopPropagation();
      if (!creatorCode) return;
      try {
        await navigator.clipboard.writeText(creatorCode);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
    },
    [creatorCode],
  );

  const toggleFlip = useCallback(() => {
    if (loading) return;
    setFlipped((f) => !f);
  }, [loading]);

  return (
    <motion.section
      className="mx-auto w-full max-w-[400px]"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        role="button"
        tabIndex={loading ? -1 : 0}
        onClick={toggleFlip}
        onKeyDown={(e: KeyboardEvent) => {
          if (loading) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFlip();
          }
        }}
        aria-label={flipped ? "Show card front" : "Show creator code on back of card"}
        aria-pressed={flipped}
        aria-disabled={loading}
        className={`group relative w-full text-left outline-none ${loading ? "cursor-wait opacity-70" : "cursor-pointer focus-visible:ring-2 focus-visible:ring-fuchsia-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07040c]"}`}
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative w-full"
          style={{ aspectRatio: CARD_ASPECT, transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Front */}
          <CardShell className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex h-full min-h-0 flex-col justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/40">Salvya</p>
                    <p className="text-[11px] font-medium text-white/65">Creator</p>
                  </div>
                  <span className="rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-fuchsia-200/85">
                    Pass
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2.5">
                  <div
                    aria-hidden
                    className="h-8 w-11 rounded-[5px] border border-amber-300/30 bg-gradient-to-br from-amber-200/55 via-amber-400/30 to-amber-800/35"
                  />
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/20" fill="none" aria-hidden>
                    <path
                      d="M4 12a4 4 0 018 0 4 4 0 018 0 4 4 0 018 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                    <div className="h-7 w-36 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/32">Cardholder</p>
                    <p className="mt-0.5 truncate text-[clamp(1rem,4vw,1.25rem)] font-semibold uppercase tracking-wide text-white">
                      {displayName}
                    </p>
                    {sinceLabel ? (
                      <p className="mt-1.5 text-[10px] text-white/35">Member since {sinceLabel}</p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </CardShell>

          {/* Back */}
          <CardShell
            className="absolute inset-0"
            variant="back"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div
                aria-hidden
                className="h-[22%] min-h-[2.25rem] shrink-0 bg-gradient-to-b from-[#1a1520] to-[#0d0b10] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              />
              <div className="flex flex-1 flex-col justify-center px-5 py-3 sm:px-6">
                {loading ? (
                  <div className="mx-auto h-8 w-32 animate-pulse rounded bg-white/10" />
                ) : (
                  <>
                    <p className="text-center text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">
                      Creator code
                    </p>
                    <p className="mt-2 text-center font-mono text-[clamp(1.35rem,6vw,1.75rem)] font-bold tracking-[0.22em] text-white">
                      {codeDisplay}
                    </p>
                    {creatorCode ? (
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => void copyCode(e)}
                          className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/15 px-3.5 py-1.5 text-[11px] font-semibold text-fuchsia-100/90 transition hover:bg-fuchsia-500/25"
                        >
                          {copied ? "Copied" : "Copy code"}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
              <p className="pb-4 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
                salvya.com
              </p>
            </div>
          </CardShell>
        </motion.div>
      </div>

      <p className="mt-3 text-center text-[12px] text-white/35">
        {flipped ? "Tap card to show front" : "Tap card to view your creator code"}
      </p>
    </motion.section>
  );
}

function CardShell({
  children,
  className = "",
  variant = "front",
  style,
}: {
  children: ReactNode;
  className?: string;
  variant?: "front" | "back";
  style?: CSSProperties;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] p-[1px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.05)] ${className}`}
      style={{
        ...style,
        background:
          variant === "back"
            ? "linear-gradient(145deg, rgba(80,70,100,0.5) 0%, rgba(30,25,40,0.9) 50%, rgba(20,18,28,1) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(139,92,246,0.4) 40%, rgba(236,72,153,0.15) 75%, rgba(255,255,255,0.08) 100%)",
      }}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-[13px] ${
          variant === "back" ? "bg-[#0f0d14]" : "bg-[#141018]"
        }`}
      >
        {variant === "front" ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,#322a45_0%,#16121f_42%,#0c0a12_100%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-fuchsia-500/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-[30%] top-0 h-full w-[55%] rotate-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(139,92,246,0.12),transparent)]"
          />
        )}
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}
