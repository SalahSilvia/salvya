"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import {
  ReportAmbient,
  ReportCard,
  REPORT_EASE,
  reportFieldClass,
  ReportSectionTitle,
} from "@/components/report-problem/report-problem-ui";
import {
  REPORT_AREAS,
  REPORT_CATEGORIES,
  REPORT_IMPACT,
  type ReportAreaId,
  type ReportCategoryId,
  type ReportImpactId,
} from "@/lib/report-problem/report-problem-data";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ReportProblemPage() {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<ReportCategoryId>("bug");
  const [area, setArea] = useState<ReportAreaId>("other");
  const [impact, setImpact] = useState<ReportImpactId>("medium");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [emailPrefilled, setEmailPrefilled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (emailPrefilled) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { ok?: boolean; user?: { email?: string } } | null) => {
        const mail = data?.user?.email;
        if (mail) {
          setEmail(mail);
          setEmailPrefilled(true);
        }
      })
      .catch(() => undefined);
  }, [emailPrefilled]);

  const canSubmit = useMemo(() => description.trim().length >= 12 && status !== "submitting", [description, status]);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/report-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          area,
          impact,
          description: description.trim(),
          steps: steps.trim() || undefined,
          email: email.trim() || undefined,
          orderNumber: orderNumber.trim() || undefined,
          pageUrl: pageUrl || undefined,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          locale: typeof navigator !== "undefined" ? navigator.language : undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; referenceId?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not send your report. Try again or contact us.");
        setStatus("error");
        return;
      }
      setReferenceId(data.referenceId ?? null);
      setStatus("success");
    } catch {
      setError("Network error — check your connection and try again.");
      setStatus("error");
    }
  }, [area, canSubmit, category, description, email, impact, orderNumber, pageUrl, steps]);

  if (status === "success") {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
        <ReportAmbient />
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/90 px-5 pb-4 pt-[max(1.1rem,env(safe-area-inset-top))] backdrop-blur-2xl">
          <AccountBackButton fallbackHref="/menu" />
        </header>
        <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: REPORT_EASE }}
            className="w-full rounded-[1.25rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.12] to-transparent p-8"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 text-2xl">
              ✓
            </span>
            <h1 className="mt-5 text-[1.5rem] font-semibold tracking-[-0.04em]">Thank you</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-white/55">
              Your report helps us ship a better Salvya experience. We read every submission.
            </p>
            {referenceId ? (
              <p className="mt-4 inline-flex rounded-lg border border-white/[0.1] bg-black/30 px-3 py-1.5 font-mono text-[13px] text-[#9eb6ff]">
                {referenceId}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-2.5">
              <Link
                href="/menu"
                className="flex min-h-[48px] items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-slate-900"
              >
                Back to menu
              </Link>
              <Link
                href="/contact"
                className="flex min-h-[48px] items-center justify-center rounded-xl border border-white/[0.12] text-[15px] font-semibold text-white/85"
              >
                Contact support
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
      <ReportAmbient />

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/90 px-5 pb-4 pt-[max(1.1rem,env(safe-area-inset-top))] backdrop-blur-2xl sm:px-6">
        <AccountBackButton fallbackHref="/menu" />
        <motion.div
          className="relative mt-4 overflow-hidden rounded-[1.2rem] border border-white/[0.1] bg-gradient-to-br from-violet-500/[0.18] via-[#0a0a10]/90 to-[#050508] p-[1px]"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: REPORT_EASE }}
        >
          <div className="rounded-[1.15rem] bg-[#0a0a10]/85 px-4 py-4 backdrop-blur-sm sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/90">Feedback</p>
            <h1 className="mt-1 text-[clamp(1.45rem,5vw,1.65rem)] font-semibold tracking-[-0.04em]">Report a problem</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-white/48">
              Tell us what went wrong — bugs, checkout, delivery, or anything that felt off. We use your reports to
              improve the app for everyone.
            </p>
          </div>
        </motion.div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 space-y-6 px-5 py-6 pb-32 sm:px-6">
        <section className="space-y-3">
          <ReportSectionTitle>What happened?</ReportSectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-2xl border p-3 text-left transition-colors ${
                    active
                      ? "border-[#2D6BFF]/45 bg-[#2D6BFF]/15 ring-1 ring-[#2D6BFF]/25"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="block text-[13px] font-semibold text-white/90">{c.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/40">{c.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <ReportSectionTitle>Where on Salvya?</ReportSectionTitle>
          <div className="flex flex-wrap gap-2">
            {REPORT_AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setArea(a.id)}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                  area === a.id
                    ? "border-white bg-white text-slate-900"
                    : "border-white/[0.1] bg-white/[0.04] text-white/65 hover:text-white"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <ReportSectionTitle>How much did it block you?</ReportSectionTitle>
          <div className="flex gap-2">
            {REPORT_IMPACT.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setImpact(i.id)}
                className={`min-h-[44px] flex-1 rounded-xl border text-[13px] font-semibold transition-colors ${
                  impact === i.id ? `${i.tone} ring-1 ring-white/20` : "border-white/[0.08] bg-white/[0.03] text-white/50"
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </section>

        <ReportCard className="space-y-4 p-4">
          <div>
            <label htmlFor="report-desc" className="text-[13px] font-semibold text-white/80">
              Describe the problem <span className="text-rose-400/90">*</span>
            </label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={4000}
              placeholder="What did you expect? What happened instead?"
              className={`mt-2 ${reportFieldClass} min-h-[120px] resize-y`}
            />
            <p className="mt-1.5 text-[11px] text-white/35">{description.trim().length}/4000 · min 12 characters</p>
          </div>

          <div>
            <label htmlFor="report-steps" className="text-[13px] font-semibold text-white/80">
              Steps to reproduce <span className="font-normal text-white/35">(optional)</span>
            </label>
            <textarea
              id="report-steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="1. Open bag → 2. Tap checkout → …"
              className={`mt-2 ${reportFieldClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="report-email" className="text-[13px] font-semibold text-white/80">
                Email for follow-up
              </label>
              <input
                id="report-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`mt-2 ${reportFieldClass}`}
              />
            </div>
            <div>
              <label htmlFor="report-order" className="text-[13px] font-semibold text-white/80">
                Order number
              </label>
              <input
                id="report-order"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="SV-…"
                className={`mt-2 ${reportFieldClass}`}
              />
            </div>
          </div>
        </ReportCard>

        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-[13px] text-rose-100/90">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submit()}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2D6BFF] to-violet-600 text-[16px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(45,107,255,0.55)] transition-[transform,opacity] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.99]"
        >
          {status === "submitting" ? "Sending…" : "Send report"}
        </button>

        <p className="text-center text-[12px] leading-relaxed text-white/38">
          Urgent order issue?{" "}
          <Link href="/contact" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            Contact us
          </Link>{" "}
          for a faster reply on WhatsApp or email.
        </p>
      </main>
    </div>
  );
}
