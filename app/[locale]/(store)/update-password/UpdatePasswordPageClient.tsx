"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthDaylight } from "@/components/auth/AuthDaylight";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { SalvyaAuthSkeleton } from "@/components/skeleton";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { analyzePassword, strengthBarClass, strengthLabel } from "@/lib/auth/password-strength";
import { loginHref, safeNextPath } from "@/lib/auth/login-href";
import { formatSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ease = [0.22, 1, 0.36, 1] as const;
const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15";

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

function ReqRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-[12px] text-neutral-600">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          ok ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80" : "bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200/80"
        }`}
        aria-hidden
      >
        {ok ? "✓" : ""}
      </span>
      {children}
    </li>
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

export default function UpdatePasswordPageClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const pwdId = useId();
  const confirmId = useId();
  const returnTo = useMemo(() => safeNextPath(searchParams.get("next")) ?? "/", [searchParams]);

  const [hydrated, setHydrated] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const pwdAnalysis = useMemo(() => analyzePassword(password), [password]);
  const pwdLabel = strengthLabel(pwdAnalysis.passed, password.length);
  const pwdBar = strengthBarClass(pwdAnalysis.passed, password.length);
  const confirmOk = confirm.length > 0 && password === confirm;
  const confirmWarn = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 8 && confirmOk;

  const refreshSession = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setHasSession(false);
      setHydrated(true);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setHasSession(Boolean(data.session));
    setHydrated(true);
  }, []);

  useEffect(() => {
    void refreshSession();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setHasSession(Boolean(session));
        setHydrated(true);
      }
      if (event === "SIGNED_OUT") {
        setHasSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("passwordMinForm"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatchForm"));
      return;
    }
    if (pwdAnalysis.passed < 3) {
      setError(t("passwordStrongerRequired"));
      return;
    }
    if (!isSupabaseConfigured()) {
      setError(t("supabaseNotConfigured"));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(t("authConnectFailed"));
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(formatSupabaseAuthError(updateError.message));
      return;
    }

    setSaved(true);
  }

  function continueAfterSave() {
    router.replace(returnTo);
    router.refresh();
  }

  if (!hydrated) {
    return <SalvyaAuthSkeleton variant="password" />;
  }

  if (!hasSession) {
    return (
      <AuthDaylight>
        <AuthTopBar backHref={loginHref("/")} backLabel={t("signIn")} pill={t("resetPassword")} variant="day" />

        <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] xl:grid-cols-[minmax(0,1fr)_460px]">
          <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 lg:flex xl:p-14">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="max-w-md"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">{t("linkExpiredKicker")}</p>
              <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
                {t("linkExpiredTitle")}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{t("linkExpiredBody")}</p>
            </motion.div>
          </aside>

          <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
            <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease }}
                className="mx-auto w-full max-w-[400px]"
              >
                <div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-8 text-center shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] sm:p-9">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                      <path d="M10.3 4.7h3.4L20 20H4L10.3 4.7z" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h1 className="mt-5 text-[1.5rem] font-bold tracking-[-0.03em] text-neutral-950">{t("linkExpired")}</h1>
                  <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{t("linkExpiredPageBody")}</p>
                  <Link
                    href="/forgot-password"
                    prefetch={false}
                    className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-colors hover:bg-blue-700"
                  >
                    {t("sendNewResetLink")}
                  </Link>
                  <Link
                    href={loginHref("/")}
                    prefetch={false}
                    className="mt-4 inline-block text-[14px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {t("backToSignIn")}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </AuthDaylight>
    );
  }

  return (
    <AuthDaylight>
      <AuthTopBar backHref={loginHref("/")} backLabel={t("signIn")} pill={t("pillNewPassword")} variant="day" />

      <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] xl:grid-cols-[minmax(0,1fr)_460px]">
        <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 backdrop-blur-[2px] lg:flex xl:p-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="max-w-md"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">{t("updateSecureKicker")}</p>
            <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
              {t("updateHeroTitle")}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{t("updateHeroBody")}</p>
            <ul className="mt-10 space-y-4">
              <CheckRow>{t("updateBullet1")}</CheckRow>
              <CheckRow>{t("updateBullet2")}</CheckRow>
              <CheckRow>{t("updateBullet3")}</CheckRow>
            </ul>
          </motion.div>
          <Link
            href="/help-center"
            prefetch={false}
            className="border-t border-neutral-200/60 pt-8 text-[13px] font-semibold text-blue-700 hover:text-blue-800"
          >
            {t("helpCenter")} →
          </Link>
        </aside>

        <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
          <div className="lg:hidden">
            <p className="pt-6 text-[13px] leading-relaxed text-neutral-600">{t("updateMobileIntro")}</p>
          </div>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mx-auto w-full max-w-[400px]"
            >
              <motion.div className="rounded-3xl border border-neutral-200/90 bg-white/95 p-8 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-neutral-900/5 sm:p-9">
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
                    {saved ? t("passwordUpdated") : t("newPassword")}
                  </h1>
                  <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
                    {saved ? t("passwordUpdatedBody") : t("updateIntro")}
                  </p>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {saved ? (
                    <motion.div
                      key="done"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 space-y-4"
                    >
                      <div
                        role="status"
                        className="rounded-xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-4 text-[13px] leading-relaxed text-emerald-950"
                      >
                        {t("signedInNewPassword")}
                      </div>
                      <button
                        type="button"
                        onClick={continueAfterSave}
                        className="flex min-h-[50px] w-full items-center justify-center rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-colors hover:bg-blue-700"
                      >
                        {t("continueBtn")}
                      </button>
                      <Link
                        href={loginHref("/")}
                        prefetch={false}
                        className="block text-center text-[14px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {t("signInOtherDevice")}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={onSubmit}
                      className="mt-8 space-y-5"
                      noValidate
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div>
                        <div className="flex items-end justify-between gap-2">
                          <label htmlFor={pwdId} className="text-[13px] font-semibold text-neutral-700">
                            {t("newPassword")} <span className="text-rose-600">*</span>
                          </label>
                          <span className="text-[11px] font-semibold text-neutral-500" aria-live="polite">
                            {pwdLabel}
                          </span>
                        </div>
                        <div className="relative mt-2">
                          <input
                            id={pwdId}
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pr-12`}
                            minLength={8}
                            required
                            placeholder={t("passwordMin8")}
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
                        <div className="mt-2 flex gap-1" aria-hidden>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${i < pwdAnalysis.passed ? pwdBar : "bg-neutral-200"}`}
                            />
                          ))}
                        </div>
                        <ul
                          className="mt-3 space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3 py-2.5"
                          aria-label={t("passwordMin8")}
                        >
                          <ReqRow ok={pwdAnalysis.checks.len8}>{t("passwordMin8")}</ReqRow>
                          <ReqRow ok={pwdAnalysis.checks.lower}>{t("passwordLower")}</ReqRow>
                          <ReqRow ok={pwdAnalysis.checks.upper}>{t("passwordUpper")}</ReqRow>
                          <ReqRow ok={pwdAnalysis.checks.digit}>{t("passwordReqDigit")}</ReqRow>
                          <ReqRow ok={pwdAnalysis.checks.symbol}>{t("passwordReqSymbol")}</ReqRow>
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <label htmlFor={confirmId} className="text-[13px] font-semibold text-neutral-700">
                            {t("confirmPasswordLabel")} <span className="text-rose-600">*</span>
                          </label>
                          {confirm.length > 0 ? (
                            <span
                              className={`text-[11px] font-semibold ${confirmOk ? "text-emerald-600" : "text-amber-600"}`}
                              aria-live="polite"
                            >
                              {confirmOk ? t("passwordMatch") : t("passwordMismatch")}
                            </span>
                          ) : null}
                        </div>
                        <div className="relative mt-2">
                          <input
                            id={confirmId}
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={`${inputClass} pr-12 ${confirmWarn ? "border-amber-300 ring-2 ring-amber-200/80" : confirmOk ? "border-emerald-300 ring-2 ring-emerald-200/60" : ""}`}
                            minLength={8}
                            required
                            placeholder={t("passwordRepeat")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                            aria-label={showConfirm ? t("hidePassword") : t("showPassword")}
                          >
                            <EyeToggleIcon visible={showConfirm} />
                          </button>
                        </div>
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
                        disabled={busy || !canSubmit}
                        whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
                        className="relative mt-1 flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-[box-shadow,background-color,opacity] hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-[0.55]"
                      >
                        <span className="relative flex items-center gap-2.5">
                          {busy && !reduceMotion ? <SubmitSpinner /> : null}
                          {busy ? t("saving") : t("saveNewPassword")}
                        </span>
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </AuthDaylight>
  );
}
