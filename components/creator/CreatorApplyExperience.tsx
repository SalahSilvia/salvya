"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CreatorApplyForm } from "@/components/creator/CreatorApplyForm";

const BENEFITS = [
  { title: "Earn on every sale", body: "Commission on attributed orders through your creator code." },
  { title: "Premium merch drops", body: "Launch capsules with Salvya production and fulfillment." },
  { title: "One account", body: "Keep shopping as a customer — creator tools unlock after approval." },
] as const;

export function CreatorApplyExperience() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-dvh overflow-hidden bg-[#07040c] text-white"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(192,132,252,0.22),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(236,72,153,0.12),transparent_50%),radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(139,92,246,0.15),transparent_45%)]"
        animate={reduceMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/80">Salvya Creators</p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[2.35rem]">
            Build your creator studio
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
            Apply once with your Instagram presence. After review, unlock your dashboard, creator code, and studio tools.
          </p>
        </motion.header>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm"
            >
              <p className="text-[13px] font-semibold text-white/90">{b.title}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{b.body}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="text-lg font-semibold tracking-tight">Application</h2>
          <p className="mt-1 text-[14px] text-white/45">We typically review within 2–4 business days.</p>
          <div className="mt-6">
            <CreatorApplyForm />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
