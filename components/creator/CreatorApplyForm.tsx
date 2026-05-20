"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CREATOR_APPLICATION_STATUS_PATH } from "@/lib/creator/apply-navigation";
import { CREATOR_NICHES } from "@/lib/creator/types";
import { creatorCtaButton } from "@/lib/theme/creator-accent";

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition placeholder:text-zinc-500 focus:border-fuchsia-400/35 focus:bg-white/[0.06] focus:ring-2 focus:ring-fuchsia-500/20";

const selectClass =
  "mt-2 w-full cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none focus:border-fuchsia-400/35 focus:ring-2 focus:ring-fuchsia-500/20 [&>option]:bg-zinc-900";

const NICHE_LABELS: Record<(typeof CREATOR_NICHES)[number], string> = {
  fashion: "Fashion",
  tech: "Tech",
  beauty: "Beauty",
  fitness: "Fitness",
  lifestyle: "Lifestyle",
  gaming: "Gaming",
  other: "Other",
};

function SubmitSpinner() {
  return (
    <span className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-white"
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  );
}

export function CreatorApplyForm() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const fullNameId = useId();
  const countryId = useId();
  const usernameId = useId();
  const linkId = useId();
  const followersId = useId();
  const nicheId = useId();
  const messageId = useId();

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim(),
      instagramUsername: String(fd.get("instagramUsername") ?? "").trim(),
      instagramLink: String(fd.get("instagramLink") ?? "").trim(),
      followersCount: Number(fd.get("followersCount")),
      niche: String(fd.get("niche") ?? ""),
      message: String(fd.get("message") ?? "").trim() || null,
    };

    setBusy(true);
    try {
      const res = await fetch("/api/creator/application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setFormError(body?.error ?? "Could not submit your application.");
        setBusy(false);
        return;
      }
      router.push(CREATOR_APPLICATION_STATUS_PATH);
      router.refresh();
    } catch {
      setFormError("Network error. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.25rem] border border-white/[0.1] bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
      >
        <div>
          <label htmlFor={fullNameId} className="text-[12px] font-semibold text-zinc-400">
            Full name <span className="text-fuchsia-300/90">*</span>
          </label>
          <input id={fullNameId} name="fullName" required className={inputClass} placeholder="Your legal name" />
        </div>

        <div className="mt-5">
          <label htmlFor={countryId} className="text-[12px] font-semibold text-zinc-400">
            Country <span className="text-fuchsia-300/90">*</span>
          </label>
          <input id={countryId} name="country" required className={inputClass} placeholder="Morocco, France, …" />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <label htmlFor={usernameId} className="text-[12px] font-semibold text-zinc-400">
              Instagram username <span className="text-fuchsia-300/90">*</span>
            </label>
            <input id={usernameId} name="instagramUsername" required className={inputClass} placeholder="@yourhandle" />
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
            <label htmlFor={followersId} className="text-[12px] font-semibold text-zinc-400">
              Followers <span className="text-fuchsia-300/90">*</span>
            </label>
            <input
              id={followersId}
              name="followersCount"
              type="number"
              min={0}
              required
              className={inputClass}
              placeholder="25000"
            />
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5"
        >
          <label htmlFor={linkId} className="text-[12px] font-semibold text-zinc-400">
            Instagram profile link <span className="text-fuchsia-300/90">*</span>
          </label>
          <input
            id={linkId}
            name="instagramLink"
            type="url"
            required
            className={inputClass}
            placeholder="https://instagram.com/you"
          />
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5"
        >
          <label htmlFor={nicheId} className="text-[12px] font-semibold text-zinc-400">
            Niche <span className="text-fuchsia-300/90">*</span>
          </label>
          <select id={nicheId} name="niche" required className={selectClass} defaultValue="">
            <option value="" disabled>
              Select your niche
            </option>
            {CREATOR_NICHES.map((n) => (
              <option key={n} value={n}>
                {NICHE_LABELS[n]}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-5"
        >
          <label htmlFor={messageId} className="text-[12px] font-semibold text-zinc-400">
            Message <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <textarea
            id={messageId}
            name="message"
            rows={4}
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Tell us about your audience and what you want to create with Salvya."
          />
        </motion.div>
      </motion.div>

      {formError ? (
        <p className="rounded-2xl border border-rose-500/25 bg-rose-950/35 px-4 py-3 text-[13px] text-rose-100/95" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white disabled:opacity-60 ${creatorCtaButton}`}
      >
        {busy && !reduceMotion ? <SubmitSpinner /> : null}
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
