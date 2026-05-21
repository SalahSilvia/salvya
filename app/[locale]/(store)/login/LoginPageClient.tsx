"use client";

import Link from "next/link";
import { useId, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDaylight } from "@/components/auth/AuthDaylight";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthOAuthLegal } from "@/components/auth/AuthOAuthLegal";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AuthToast } from "@/components/auth/AuthToast";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { RememberMeRow } from "@/components/auth/RememberMeRow";
import { useAuthToast } from "@/components/auth/useAuthToast";
import { signInWithGoogle } from "@/lib/auth/oauth";
import {
  getRememberSessionPreference,
  setRememberSessionPreference,
} from "@/lib/auth/remember-session";
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
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const reduceMotion = useReducedMotion();
  const { toast, showToast, dismissToast } = useAuthToast();
  const emailId = useId();
  const passwordId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const authDisabled = busy || oauthBusy;

  useEffect(() => {
    setRememberSession(getRememberSessionPreference());
  }, []);
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
      setBanner(t("supabaseServerNotConfigured"));
    } else if (auth === "missing_code") {
      setBanner(t("emailLinkIncomplete"));
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
      setInfoBanner(t("existingEmailBanner", { email: prefill }));
      return;
    }

    if (!hasAfterSignupLoginHint()) return;
    setInfoBanner(
      t("accountReadyBanner"),
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
      setResendOk(t("supabaseNotConfigured"));
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setResendOk(t("clientStartFailed"));
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
    setResendOk(t("resendCheckInbox"));
  }, [lastEmail]);

  const handleGoogleSignIn = useCallback(async () => {
    setBanner(null);
    setRememberSessionPreference(rememberSession);
    if (!isSupabaseConfigured()) {
      showToast(t("supabaseNotConfigured"), "error");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      showToast(t("clientStartFailed"), "error");
      return;
    }
    setOauthBusy(true);
    const result = await signInWithGoogle(supabase, { next: returnTo });
    setOauthBusy(false);
    if (!result.ok) {
      showToast(result.message, "error");
      setBanner(result.message);
    }
  }, [rememberSession, returnTo, showToast, t]);

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
      setBanner(t("supabaseEnvHint"));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setBanner(t("clientStartFailed"));
      return;
    }

    setRememberSessionPreference(rememberSession);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailTrim, password });
    setBusy(false);

    if (error) {
      const raw = error.message.toLowerCase();
      setShowResend(raw.includes("email not confirmed"));
      const msg = formatSupabaseAuthError(error.message);
      setBanner(msg);
      showToast(msg, "error");
      return;
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (!userErr && userData.user) {
      const meta = (userData.user.user_metadata ?? {}) as Record<string, unknown>;
      if (isAccountDeactivated(meta) || userData.user.banned_until) {
        await supabase.auth.signOut();
        setBanner(t("accountDeactivated"));
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
    showToast(t("signedInSuccess"), "success");
    router.replace(dest);
    router.refresh();
  }

  return (
    <AuthDaylight>
      <AuthToast toast={toast} onDismiss={dismissToast} />
      <AuthTopBar backHref="/" backLabel="Shop home" pill="Sign in" variant="day" />

      <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] xl:grid-cols-[minmax(0,1fr)_460px]">
        <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 backdrop-blur-[2px] lg:flex xl:p-14">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">{t("loginHeroKicker")}</p>
            <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
              {t("loginHeroTitle")}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{t("loginHeroBody")}</p>
            <ul className="mt-10 space-y-4">
              <CheckRow>{t("loginBullet1")}</CheckRow>
              <CheckRow>{t("loginBullet2")}</CheckRow>
              <CheckRow>{t("loginBullet3")}</CheckRow>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200/60 pt-8 text-[13px] text-neutral-500">
            <Link href="/help-center" prefetch={false} className="font-semibold text-blue-700 hover:text-blue-800">
              {t("helpCenter")}
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link href="/terms#recovery" prefetch={false} className="font-semibold text-neutral-700 hover:text-neutral-950">
              {t("accountRecoveryLink")}
            </Link>
          </div>
        </aside>

        <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
          <div className="lg:hidden">
            <p className="pt-6 text-[13px] leading-relaxed text-neutral-600">{t("loginMobileIntro")}</p>
          </div>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
            <AuthCard
              title={t("signIn")}
              subtitle={t("signInCardSubtitle")}
              footer={
                <>
                  <div className="text-center text-[14px] text-neutral-600">
                    {t("noAccount")}{" "}
                    <Link href={registerHref(returnTo)} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      {t("createAccount")}
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
                </>
              }
            >
              <GoogleAuthButton
                label={t("continueWithGoogle")}
                loading={oauthBusy}
                disabled={authDisabled}
                onClick={() => void handleGoogleSignIn()}
              />
              <AuthOAuthLegal />
              <AuthDivider label={t("orEmail")} />

              <form id="login-form" onSubmit={onSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor={emailId} className="text-[13px] font-semibold text-neutral-700">
                      {t("email")}
                    </label>
                    <input
                      ref={emailRef}
                      id={emailId}
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={passwordId} className="text-[13px] font-semibold text-neutral-700">
                        {t("password")}
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
                        {t("forgotPassword")}
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
                        placeholder={t("passwordPlaceholder")}
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
                            {tCommon("dismiss")}
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
                            {tCommon("dismiss")}
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <RememberMeRow
                    checked={rememberSession}
                    disabled={authDisabled}
                    onChange={setRememberSession}
                    label={t("rememberMe")}
                    hint={t("rememberMeHint")}
                  />

                  {showResend && lastEmail.trim() ? (
                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/80 px-4 py-3.5">
                      <p className="text-[13px] font-medium text-blue-950">Confirm your email to sign in.</p>
                      <button
                        type="button"
                        onClick={() => void resendConfirmation()}
                        disabled={resendBusy}
                        className="mt-2.5 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 text-[13px] font-semibold text-white transition-opacity hover:bg-blue-700 disabled:opacity-60"
                      >
                        {resendBusy ? t("sending") : t("resendConfirmation")}
                      </button>
                      {resendOk ? <p className="mt-2 text-[12px] leading-relaxed text-blue-900">{resendOk}</p> : null}
                    </div>
                  ) : null}

                  <AuthSubmitButton
                    label={t("signIn")}
                    loadingLabel={t("signingIn")}
                    busy={busy}
                    disabled={oauthBusy}
                  />
                </form>
            </AuthCard>
          </div>
        </div>
      </main>
    </AuthDaylight>
  );
}
