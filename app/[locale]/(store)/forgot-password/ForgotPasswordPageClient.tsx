"use client";

import Link from "next/link";
import { useId, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthDaylight } from "@/components/auth/AuthDaylight";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { loginHref, registerHref } from "@/lib/auth/login-href";
import { buildPasswordRecoveryRedirectTo } from "@/lib/auth/password-recovery-callback";
import { formatSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ease = [0.22, 1, 0.36, 1] as const;
const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15";

function SubmitSpinner() {
  return (
    <span className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-white"
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[14px] leading-snug text-neutral-700">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </li>
  );
}

export default function ForgotPasswordPageClient() {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const emailId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    const prefill = searchParams.get("email")?.trim();
    if (prefill && prefill.includes("@")) {
      setEmail(prefill);
      requestAnimationFrame(() => {
        emailRef.current?.focus();
      });
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter the email address you use to sign in to Salvya.");
      return;
    }
    if (!trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(
        "Sign-in is not configured on this environment. Add Supabase keys to salvya.local.env (see .env.example), restart the server, and try again.",
      );
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Could not connect to authentication. Check your environment variables.");
      return;
    }

    const redirectTo = buildPasswordRecoveryRedirectTo();
    if (!redirectTo) {
      setError("Could not build a secure reset link. Reload this page and try again.");
      return;
    }

    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
    setBusy(false);

    if (resetError) {
      setError(formatSupabaseAuthError(resetError.message));
      return;
    }

    setSentTo(trimmed);
    setSent(true);
  }

  async function resend() {
    if (!sentTo || busy) return;
    setEmail(sentTo);
    const form = document.getElementById("forgot-password-form") as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <AuthDaylight>
      <AuthTopBar backHref={loginHref("/")} backLabel="Sign in" pill="Reset password" variant="day" />

      <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] xl:grid-cols-[minmax(0,1fr)_460px]">
        <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 backdrop-blur-[2px] lg:flex xl:p-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="max-w-md"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">Account recovery</p>
            <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
              Get back into your Salvya account.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              We send a secure, single-use link to your inbox. Open it on this device to choose a new password — the link
              expires after a short time for your safety.
            </p>
            <ul className="mt-10 space-y-4">
              <CheckRow>Check spam or promotions if nothing arrives within a few minutes.</CheckRow>
              <CheckRow>Use the newest email if you requested more than one reset.</CheckRow>
              <CheckRow>Still stuck? Visit Help or create an account if you are new to Salvya.</CheckRow>
            </ul>
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200/60 pt-8 text-[13px] text-neutral-500"
          >
            <Link href="/help-center" prefetch={false} className="font-semibold text-blue-700 hover:text-blue-800">
              Help center
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link href={registerHref("/")} prefetch={false} className="font-semibold text-neutral-700 hover:text-neutral-950">
              Create account
            </Link>
          </motion.div>
        </aside>

        <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
          <motion.div className="lg:hidden">
            <p className="pt-6 text-[13px] leading-relaxed text-neutral-600">
              Enter your account email. We will send a link to set a new password.
            </p>
          </motion.div>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mx-auto w-full max-w-[400px]"
            >
              <div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-8 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-neutral-900/5 sm:p-9">
                <div className="flex flex-col items-center text-center">
                  <motion.div className="flex h-11 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-4">
                    <SalvyaLogoImage
                      variant="dark"
                      alt="Salvya"
                      className="h-[22px] w-auto max-w-[9rem] object-contain object-left"
                      fallback="word"
                      fallbackClassName="text-lg font-bold tracking-tight text-neutral-900"
                    />
                  </motion.div>
                  <h1 className="mt-6 text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-[1.85rem]">
                    Reset password
                  </h1>
                  <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
                    {sent
                      ? "If an account exists for that email, a reset link is on its way."
                      : "Use the same email you sign in with. We never tell outsiders whether an address is registered."}
                  </p>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {sent ? (
                    <motion.div
                      key="sent"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      className="mt-8 space-y-5"
                    >
                      <motion.div
                        role="status"
                        className="rounded-xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-4 text-left shadow-sm"
                      >
                        <p className="text-[13px] font-semibold text-emerald-950">Check your inbox</p>
                        <p className="mt-2 text-[13px] leading-relaxed text-emerald-900/90">
                          We sent instructions to{" "}
                          <span className="font-semibold text-emerald-950">{sentTo}</span>. Open the link to choose a new
                          password.
                        </p>
                        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[12px] leading-relaxed text-emerald-900/85">
                          <li>Open the email from Salvya (check spam).</li>
                          <li>Tap <strong className="font-semibold">Reset password</strong> in the message.</li>
                          <li>Pick a new password on the Salvya page that opens.</li>
                        </ol>
                      </motion.div>

                      <button
                        type="button"
                        onClick={() => void resend()}
                        disabled={busy}
                        className="w-full text-center text-[13px] font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50"
                      >
                        {busy ? "Sending again…" : "Did not get it? Send again"}
                      </button>

                      <Link
                        href={loginHref("/", sentTo)}
                        prefetch={false}
                        className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-colors hover:bg-blue-700"
                      >
                        Back to sign in
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSent(false);
                          setSentTo("");
                          setError(null);
                        }}
                        className="w-full text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
                      >
                        Use a different email
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      id="forgot-password-form"
                      onSubmit={onSubmit}
                      className="mt-8 space-y-5"
                      noValidate
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div>
                        <label htmlFor={emailId} className="text-[13px] font-semibold text-neutral-700">
                          Account email
                        </label>
                        <input
                          ref={emailRef}
                          id={emailId}
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      {error ? (
                        <p
                          role="alert"
                          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-950"
                        >
                          {error}
                        </p>
                      ) : null}

                      <motion.button
                        type="submit"
                        disabled={busy}
                        whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
                        className="relative mt-1 flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-[box-shadow,background-color,opacity] hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-[0.65]"
                      >
                        <span className="relative flex items-center gap-2.5">
                          {busy && !reduceMotion ? <SubmitSpinner /> : null}
                          {busy ? "Sending link…" : "Send reset link"}
                        </span>
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {!sent ? (
                  <div className="mt-8 text-center text-[14px] text-neutral-600">
                    Remembered it?{" "}
                    <Link href={loginHref("/")} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      Sign in
                    </Link>
                  </div>
                ) : null}

                <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
                  <p className="text-center text-[12px] leading-relaxed text-neutral-600">
                    No account yet?{" "}
                    <Link href={registerHref("/")} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      Create account
                    </Link>{" "}
                    instead of resetting a password.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </AuthDaylight>
  );
}
