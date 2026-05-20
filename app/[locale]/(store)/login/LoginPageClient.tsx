"use client";

import Link from "next/link";
import { useId, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthDaylight } from "@/components/auth/AuthDaylight";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { formatSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { clearAfterSignupLoginHint, hasAfterSignupLoginHint, SALVYA_LOGIN_PREFILL_EMAIL_KEY, setConfirmEmailNotice } from "@/lib/auth/post-auth-notice";
import { loginHref, registerHref, safeNextPath } from "@/lib/auth/login-href";
import { fetchSessionRole } from "@/lib/auth/fetch-session-role";
import { resolvePostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { isAccountDeactivated } from "@/lib/account/account-status";

const ease = [0.22, 1, 0.36, 1] as const;

function EyeToggleIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" width={18} height={18} aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.5a2.5 2.5 0 003 3M9.88 5.09A10.4 10.4 0 0112 5c4.42 0 8.17 2.84 9.5 7-.33 1.03-.78 2-1.32 2.88M6.36 6.36C4.62 7.88 3.27 9.95 2.5 12c1.33 4.16 5.08 7 9.5 7 1.06 0 2.08-.18 3.02-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" width={18} height={18} aria-hidden>
      <path
        d="M12 5c-4.42 0-8.17 2.84-9.5 7 1.33 4.16 5.08 7 9.5 7s8.17-2.84 9.5-7c-1.33-4.16-5.08-7-9.5-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

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
    <li className="flex gap-3 text-[15px] leading-snug text-neutral-700">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </li>
  );
}

const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const reduceMotion = useReducedMotion();
  const emailId = useId();
  const passwordId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [lastEmail, setLastEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendOk, setResendOk] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const auth = searchParams.get("auth");
    const msg = searchParams.get("message");
    if (auth === "error" && msg) {
      setBanner(formatSupabaseAuthError(decodeURIComponent(msg)));
    } else if (auth === "not_configured") {
      setBanner("Supabase is not configured on the server. Add keys to salvya.local.env or .env.local.");
    } else if (auth === "missing_code") {
      setBanner("Email link was incomplete. Request a new sign-in or confirmation email.");
    }
  }, [searchParams]);

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const prefill = fromQuery?.trim() || null;
    if (prefill && prefill.includes("@")) {
      setEmail(prefill);
      requestAnimationFrame(() => {
        if (emailRef.current) emailRef.current.value = prefill;
      });
    }

    if (searchParams.get("existing") === "1" && prefill) {
      setInfoBanner(
        `An account already exists for ${prefill}. Sign in below — do not create another account with the same email.`,
      );
      return;
    }

    if (!hasAfterSignupLoginHint()) return;
    setInfoBanner(
      "Your account is ready. We sent a confirmation email if your project requires it. Sign in below with the password you chose.",
    );
    try {
      const pre = prefill || sessionStorage.getItem(SALVYA_LOGIN_PREFILL_EMAIL_KEY);
      if (!pre) return;
      requestAnimationFrame(() => {
        if (emailRef.current) emailRef.current.value = pre;
      });
    } catch {
      /* */
    }
  }, [searchParams]);

  const resendConfirmation = useCallback(async () => {
    const em = lastEmail.trim();
    if (!em) return;
    if (!isSupabaseConfigured()) {
      setResendOk("Supabase is not configured.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setResendOk("Could not start Supabase client.");
      return;
    }
    setResendBusy(true);
    setResendOk(null);
    const { error } = await supabase.auth.resend({ type: "signup", email: em });
    setResendBusy(false);
    if (error) {
      setResendOk(formatSupabaseAuthError(error.message));
      return;
    }
    setResendOk("Check your inbox — we sent another confirmation link.");
  }, [lastEmail]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setResendOk(null);
    setShowResend(false);
    const fd = new FormData(e.currentTarget);
    const emailTrim = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setEmail(emailTrim);
    setLastEmail(emailTrim);

    if (!isSupabaseConfigured()) {
      setBusy(true);
      await new Promise((r) => setTimeout(r, 400));
      setBusy(false);
      setBanner(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to salvya.local.env (see .env.example), restart dev, then try again.",
      );
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setBanner("Could not start Supabase client. Check your environment variables.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailTrim, password });
    setBusy(false);

    if (error) {
      const raw = error.message.toLowerCase();
      setShowResend(raw.includes("email not confirmed"));
      setBanner(formatSupabaseAuthError(error.message));
      return;
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (!userErr && userData.user) {
      const meta = (userData.user.user_metadata ?? {}) as Record<string, unknown>;
      if (isAccountDeactivated(meta) || userData.user.banned_until) {
        await supabase.auth.signOut();
        setBanner(
          "This account is deactivated. Contact Salvya support if you need access restored — we cannot sign you in until then.",
        );
        return;
      }
      if (!userData.user.email_confirmed_at) {
        setConfirmEmailNotice();
      }
    }

    setShowResend(false);

    const nextParam = searchParams.get("next");
    const role = await fetchSessionRole();
    const dest = resolvePostLoginRedirect(nextParam, role);
    router.replace(dest);
    router.refresh();
  }

  return (
    <AuthDaylight>
      <AuthTopBar backHref="/" backLabel="Shop home" pill="Sign in" variant="day" />

      <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] xl:grid-cols-[minmax(0,1fr)_460px]">
        <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 backdrop-blur-[2px] lg:flex xl:p-14">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">Salvya customers</p>
            <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
              One sign-in for your bag, orders, and artist shops.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              One account for every device. Sign in to sync your bag, likes, follows, notifications, and orders placed
              while logged in — Supabase backs more than sign-in alone. Checkout contact fields still use your browser
              session until saved addresses ship.
            </p>
            <ul className="mt-10 space-y-4">
              <CheckRow>Bag, likes, alerts, and order history on your profile when cloud sync is enabled.</CheckRow>
              <CheckRow>Secure access with email and password — recovery steps live in Help & terms.</CheckRow>
              <CheckRow>Selling as a creator? Use this account, then open creator tools from the menu.</CheckRow>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200/60 pt-8 text-[13px] text-neutral-500">
            <Link href="/help-center" prefetch={false} className="font-semibold text-blue-700 hover:text-blue-800">
              Help center
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link href="/terms#recovery" prefetch={false} className="font-semibold text-neutral-700 hover:text-neutral-950">
              Account recovery
            </Link>
          </div>
        </aside>

        <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
          <div className="lg:hidden">
            <p className="pt-6 text-[13px] leading-relaxed text-neutral-600">
              Sign in for the <span className="font-semibold text-neutral-800">member shell</span>, synced{" "}
              <span className="font-semibold text-neutral-800">bag &amp; likes</span>, and artist shops. Checkout contact
              details stay in your browser session until saved addresses ship.
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mx-auto w-full max-w-[400px]"
            >
              <div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-8 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-neutral-900/5 sm:p-9">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-11 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-4">
                    <SalvyaLogoImage
                      variant="dark"
                      alt="Salvya"
                      className="h-[22px] w-auto max-w-[9rem] object-contain object-left"
                      fallback="word"
                      fallbackClassName="text-lg font-bold tracking-tight text-neutral-900"
                    />
                  </div>
                  <h1 className="mt-6 text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-[1.85rem]">
                    Sign in
                  </h1>
                  <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
                    Enter the email and password for your Salvya account.
                  </p>
                </div>

                <form id="login-form" onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
                  <div>
                    <label htmlFor={emailId} className="text-[13px] font-semibold text-neutral-700">
                      Email
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

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={passwordId} className="text-[13px] font-semibold text-neutral-700">
                        Password
                      </label>
                      <Link
                        href={
                          email.trim().includes("@")
                            ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
                            : "/forgot-password"
                        }
                        prefetch={false}
                        className="text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-2">
                      <input
                        id={passwordId}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        minLength={6}
                        placeholder="Your password"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <EyeToggleIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {infoBanner ? (
                      <motion.div
                        key="info-banner"
                        role="status"
                        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease }}
                        className="rounded-xl border border-blue-200/90 bg-blue-50/95 px-4 py-3.5 shadow-sm"
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 shrink-0 text-blue-600" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                              <path d="M12 11v6M12 7h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity={0.35} />
                            </svg>
                          </span>
                          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-blue-950">{infoBanner}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setInfoBanner(null);
                              clearAfterSignupLoginHint();
                            }}
                            className="shrink-0 self-start rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-800/80 hover:bg-blue-100/80"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {banner ? (
                      <motion.div
                        key="banner"
                        role="status"
                        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease }}
                        className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3.5 shadow-sm"
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 shrink-0 text-amber-600" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                              <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity={0.35} />
                            </svg>
                          </span>
                          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-amber-950">{banner}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setBanner(null);
                              setShowResend(false);
                              setResendOk(null);
                            }}
                            className="shrink-0 self-start rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800/80 hover:bg-amber-100/80"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {showResend && lastEmail.trim() ? (
                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/80 px-4 py-3.5">
                      <p className="text-[13px] font-medium text-blue-950">Confirm your email to sign in.</p>
                      <button
                        type="button"
                        onClick={() => void resendConfirmation()}
                        disabled={resendBusy}
                        className="mt-2.5 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 text-[13px] font-semibold text-white transition-opacity hover:bg-blue-700 disabled:opacity-60"
                      >
                        {resendBusy ? "Sending…" : "Resend confirmation email"}
                      </button>
                      {resendOk ? <p className="mt-2 text-[12px] leading-relaxed text-blue-900">{resendOk}</p> : null}
                    </div>
                  ) : null}

                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
                    className="relative mt-1 flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-[box-shadow,background-color,opacity] hover:bg-blue-700 hover:shadow-[0_18px_40px_-10px_rgba(37,99,235,0.45)] disabled:pointer-events-none disabled:opacity-[0.65]"
                  >
                    <span className="relative flex items-center gap-2.5">
                      {busy && !reduceMotion ? <SubmitSpinner /> : null}
                      {busy ? "Signing in…" : "Sign in"}
                    </span>
                  </motion.button>
                </form>

                <div className="mt-8 text-center text-[14px] text-neutral-600">
                  New to Salvya?{" "}
                  <Link href={registerHref(returnTo)} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                    Create account
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
                  <p className="text-center text-[12px] leading-relaxed text-neutral-600">
                    <span className="font-medium text-neutral-800">Creators</span> — use the same login, then apply from{" "}
                    <Link href="/menu" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      Menu
                    </Link>
                    {" or "}
                    <Link href="/creator" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      Creator hub
                    </Link>
                    .
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
