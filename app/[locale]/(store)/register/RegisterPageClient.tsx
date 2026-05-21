"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
import { SignupSuccessDialog } from "@/components/auth/SignupSuccessDialog";
import { useAuthToast } from "@/components/auth/useAuthToast";
import { buildAuthCallbackUrl } from "@/lib/auth/auth-callback-url";
import { signInWithGoogle } from "@/lib/auth/oauth";
import { analyzePassword, strengthBarClass, strengthLabel } from "@/lib/auth/password-strength";
import { clearRegisterDraft, readRegisterDraft, writeRegisterDraft } from "@/lib/auth/register-draft";
import { setAfterSignupLoginHint, setConfirmEmailNotice, stashLoginPrefillEmail } from "@/lib/auth/post-auth-notice";
import { fetchSessionRole } from "@/lib/auth/fetch-session-role";
import { loginHref, safeNextPath } from "@/lib/auth/login-href";
import { resolvePostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { interpretSignUpResponse } from "@/lib/auth/signup-result";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ease = [0.22, 1, 0.36, 1] as const;

const SHIPPING_COUNTRY_CODES = ["", "FR", "BE", "NL", "DE", "ES", "IT", "PT", "GB", "IE", "CH", "MA", "US", "OTHER"] as const;

const COUNTRY_LABEL_KEYS: Record<(typeof SHIPPING_COUNTRY_CODES)[number], string> = {
  "": "countryPlaceholder",
  FR: "countryFR",
  BE: "countryBE",
  NL: "countryNL",
  DE: "countryDE",
  ES: "countryES",
  IT: "countryIT",
  PT: "countryPT",
  GB: "countryGB",
  IE: "countryIE",
  CH: "countryCH",
  MA: "countryMA",
  US: "countryUS",
  OTHER: "countryOTHER",
};

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

const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15";

const selectClass =
  "mt-2 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-sm outline-none transition-[border-color,box-shadow] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 [&>option]:bg-white [&>option]:text-neutral-900";

const checkShell = "rounded-2xl border border-neutral-200/90 bg-neutral-50/70 px-4 py-4";
const checkInput = "mt-1 size-4 shrink-0 rounded border-neutral-300 text-blue-600 focus:ring-blue-500/25";

export default function RegisterPageClient() {
  const t = useTranslations("auth");
  const shippingCountries = useMemo(
    () =>
      SHIPPING_COUNTRY_CODES.map((value) => ({
        value,
        label: t(COUNTRY_LABEL_KEYS[value] as Parameters<typeof t>[0]),
      })),
    [t],
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const reduceMotion = useReducedMotion();
  const { toast, showToast, dismissToast } = useAuthToast();
  const fullNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const countryId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const marketingId = useId();
  const termsId = useId();

  const fullNameRef = useRef<HTMLInputElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const authDisabled = busy || oauthBusy;
  const [banner, setBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successNext, setSuccessNext] = useState<null | "shop" | "signin">(null);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  const pwdAnalysis = useMemo(() => analyzePassword(password), [password]);
  const pwdLabel = strengthLabel(pwdAnalysis.passed, password.length);
  const pwdBar = strengthBarClass(pwdAnalysis.passed, password.length);
  const confirmOk = confirmPassword.length > 0 && password === confirmPassword;
  const confirmWarn = confirmPassword.length > 0 && password !== confirmPassword;

  const formProgress = useMemo(() => {
    let p = 0;
    if (fullName.trim()) p += 18;
    if (email.trim().includes("@")) p += 22;
    if (country) p += 20;
    if (password.length >= 8) p += 15;
    if (password.length >= 8 && password === confirmPassword && confirmPassword.length > 0) p += 15;
    if (termsAccepted) p += 10;
    return Math.min(100, p);
  }, [fullName, email, country, password, confirmPassword, termsAccepted]);

  const didAutofocus = useRef(false);

  useEffect(() => {
    const d = readRegisterDraft();
    if (d) {
      setFullName(d.fullName ?? "");
      setEmail(d.email ?? "");
      setPhone(d.phone ?? "");
      setCountry(d.country ?? "");
      setMarketing(Boolean(d.marketing));
    }
    setHydrated(true);
  }, []);

  const queueDraftSave = useCallback(() => {
    if (!hydrated) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      writeRegisterDraft({
        fullName,
        email,
        phone,
        country,
        marketing,
      });
    }, 450);
  }, [hydrated, fullName, email, phone, country, marketing]);

  useEffect(() => {
    queueDraftSave();
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [queueDraftSave]);

  useEffect(() => {
    if (!hydrated || didAutofocus.current) return;
    didAutofocus.current = true;
    if (!fullName.trim() && !email.trim()) {
      fullNameRef.current?.focus();
    }
  }, [hydrated, fullName, email]);

  useEffect(() => {
    if (!existingEmail) return;
    if (email.trim().toLowerCase() !== existingEmail.toLowerCase()) {
      setExistingEmail(null);
      setFormError(null);
    }
  }, [email, existingEmail]);

  const handleGoogleSignUp = useCallback(async () => {
    setBanner(null);
    setFormError(null);
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
      setFormError(result.message);
    }
  }, [returnTo, showToast, t]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setFormError(null);
    setExistingEmail(null);

    if (password !== confirmPassword) {
      setFormError(t("passwordMismatchForm"));
      return;
    }
    if (password.length < 8) {
      setFormError(t("passwordMinForm"));
      return;
    }
    if (!termsAccepted) {
      setFormError(t("termsRequired"));
      return;
    }
    if (!country) {
      setFormError(t("countryRequired"));
      return;
    }

    const fullNameTrim = fullName.trim();
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (!isSupabaseConfigured()) {
      setBusy(true);
      await new Promise((r) => setTimeout(r, 400));
      setBusy(false);
      setBanner(t("supabaseEnvHint"));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError(t("authConnectFailed"));
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: emailTrim,
      password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl(returnTo),
        data: {
          full_name: fullNameTrim,
          country,
          phone: phoneTrim || null,
          marketing_opt_in: marketing,
          salvya_role: "customer",
        },
      },
    });

    const outcome = interpretSignUpResponse({
      user: data.user,
      session: data.session,
      error,
    });

    setBusy(false);

    if (outcome.kind === "existing_email") {
      setExistingEmail(emailTrim);
      setFormError(outcome.message);
      showToast(outcome.message, "error");
      return;
    }

    if (outcome.kind === "error") {
      setFormError(outcome.message);
      showToast(outcome.message, "error");
      return;
    }

    clearRegisterDraft();

    const { triggerEmailAutomation } = await import("@/lib/email/trigger-automation-client");
    void triggerEmailAutomation("user.registered", {
      email: emailTrim,
      customerName: fullNameTrim,
    });
    if (marketing) {
      void triggerEmailAutomation("user.newsletter_opt_in", {
        email: emailTrim,
        customerName: fullNameTrim,
      });
    }

    if (!outcome.needsEmailConfirmation) {
      setConfirmEmailNotice();
      setSuccessNext("shop");
      setSuccessOpen(true);
      return;
    }

    setAfterSignupLoginHint();
    stashLoginPrefillEmail(emailTrim);
    setSuccessNext("signin");
    setSuccessOpen(true);
  }

  async function handleSignupSuccessContinue() {
    const next = successNext;
    setSuccessOpen(false);
    setSuccessNext(null);
    if (next === "shop") {
      const role = await fetchSessionRole();
      router.replace(resolvePostLoginRedirect(returnTo, role));
      router.refresh();
      return;
    }
    if (next === "signin") {
      router.replace(loginHref(returnTo));
    }
  }

  function handleClearDraft() {
    clearRegisterDraft();
    setFullName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setMarketing(false);
    setExistingEmail(null);
    setTermsAccepted(false);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <AuthDaylight>
      <AuthToast toast={toast} onDismiss={dismissToast} />
      <AuthTopBar backHref={loginHref(returnTo)} backLabel={t("signIn")} pill={t("createAccount")} variant="day" />

      <main className="min-h-dvh pt-[calc(3.5rem+env(safe-area-inset-top))] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(100%,480px)] xl:grid-cols-[minmax(0,1fr)_500px]">
        <aside className="relative hidden flex-col justify-between border-neutral-200/70 bg-gradient-to-br from-white/90 via-blue-50/40 to-sky-50/30 p-10 backdrop-blur-[2px] lg:flex xl:p-14">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">{t("registerKicker")}</p>
            <h2 className="mt-4 text-balance text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-neutral-950">
              {t("registerHeroTitle")}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{t("registerHeroBody")}</p>
            <ul className="mt-10 space-y-4">
              <CheckRow>{t("registerBullet1")}</CheckRow>
              <CheckRow>{t("registerBullet2")}</CheckRow>
              <CheckRow>{t("registerBullet3")}</CheckRow>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200/60 pt-8 text-[13px] text-neutral-500">
            <Link href="/help-center" prefetch={false} className="font-semibold text-blue-700 hover:text-blue-800">
              {t("helpCenter")}
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link href="/terms/account" prefetch={false} className="font-semibold text-neutral-700 hover:text-neutral-950">
              Account terms
            </Link>
          </div>
        </aside>

        <div className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] lg:border-l lg:border-neutral-200/80 lg:px-8 lg:py-10 xl:px-12">
          <div className="lg:hidden">
            <p className="pt-6 text-[13px] leading-relaxed text-neutral-600">
              Create your Salvya <span className="font-semibold text-neutral-800">customer</span> account — name, email, region, and a secure password.
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-6">
            <AuthCard
              title={t("createAccount")}
              subtitle={t("createAccountCardSubtitle")}
              maxWidthClass="max-w-[440px]"
              footer={
                <>
                  <p className="text-center text-[14px] text-neutral-600">
                    {t("hasAccount")}{" "}
                    <Link href={loginHref(returnTo)} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                      {t("signIn")}
                    </Link>
                  </p>
                  <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
                    <p className="text-center text-[12px] leading-relaxed text-neutral-600">
                      <span className="font-medium text-neutral-800">Creators</span> — after you register, open Menu to apply.{" "}
                      <Link href="/menu" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                        Go to Menu
                      </Link>
                      {" · "}
                      <Link href="/creator" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                        Creator hub
                      </Link>
                    </p>
                  </div>
                </>
              }
            >
              <GoogleAuthButton
                label={t("continueWithGoogle")}
                loading={oauthBusy}
                disabled={authDisabled}
                onClick={() => void handleGoogleSignUp()}
              />
              <AuthOAuthLegal termsHref="/terms/account" />
              <AuthDivider label={t("orEmail")} />

                <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    <span>Form progress</span>
                    <span className="tabular-nums text-neutral-700">{formProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-200/90" role="progressbar" aria-valuenow={formProgress} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-[width] duration-300 ease-out"
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-neutral-500">
                    Your name, email, and country are saved in this browser if you leave the page (passwords are never stored).
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor={fullNameId} className="text-[13px] font-semibold text-neutral-700">
                      Full name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      ref={fullNameRef}
                      id={fullNameId}
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Alex Martin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor={emailId} className="text-[13px] font-semibold text-neutral-700">
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <input
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
                    <label htmlFor={phoneId} className="text-[13px] font-semibold text-neutral-700">
                      Mobile phone <span className="font-normal text-neutral-500">(optional)</span>
                    </label>
                    <input
                      id={phoneId}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor={countryId} className="text-[13px] font-semibold text-neutral-700">
                      Country / region <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id={countryId}
                      name="country"
                      className={selectClass}
                      required
                      aria-required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      {shippingCountries.map((c) => (
                        <option key={c.value || "empty"} value={c.value} disabled={c.value === ""}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-[12px] text-neutral-500">Used for shipping estimates at checkout.</p>
                  </div>

                  <div>
                    <div className="flex items-end justify-between gap-2">
                      <label htmlFor={passwordId} className="text-[13px] font-semibold text-neutral-700">
                        Password <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-neutral-500" aria-live="polite">
                        {pwdLabel}
                      </span>
                    </div>
                    <div className="relative mt-2">
                      <input
                        id={passwordId}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder={t("passwordMin8")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <div className="mt-2 flex gap-1" aria-hidden>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${i < pwdAnalysis.passed ? pwdBar : "bg-neutral-200"}`}
                        />
                      ))}
                    </div>
                    <ul className="mt-3 space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3 py-2.5" aria-label="Password requirements">
                      <ReqRow ok={pwdAnalysis.checks.len8}>{t("passwordMin8")}</ReqRow>
                      <ReqRow ok={pwdAnalysis.checks.lower}>One lowercase letter</ReqRow>
                      <ReqRow ok={pwdAnalysis.checks.upper}>One uppercase letter</ReqRow>
                      <ReqRow ok={pwdAnalysis.checks.digit}>One number</ReqRow>
                      <ReqRow ok={pwdAnalysis.checks.symbol}>One symbol (recommended)</ReqRow>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={confirmId} className="text-[13px] font-semibold text-neutral-700">
                        Confirm password <span className="text-rose-600">*</span>
                      </label>
                      {confirmPassword.length > 0 ? (
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
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-12 ${confirmWarn ? "border-amber-300 ring-2 ring-amber-200/80" : confirmOk ? "border-emerald-300 ring-2 ring-emerald-200/60" : ""}`}
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

                  <div className={checkShell}>
                    <label className="flex cursor-pointer gap-3 text-left">
                      <input
                        id={marketingId}
                        name="marketing"
                        type="checkbox"
                        className={checkInput}
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-neutral-800">Drops &amp; restocks</span>
                        <span className="mt-1 block text-[12px] leading-relaxed text-neutral-600">
                          Email me when artists I follow release new pieces or bring sizes back. See our{" "}
                          <Link href="/cookies" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                            cookies policy
                          </Link>{" "}
                          for how we use data.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className={checkShell}>
                    <label className="flex cursor-pointer gap-3 text-left">
                      <input
                        id={termsId}
                        name="terms"
                        type="checkbox"
                        className={checkInput}
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span className="text-[12px] leading-relaxed text-neutral-600">
                        I agree to the Salvya{" "}
                        <Link href="/terms" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                          Terms of Service
                        </Link>
                        , the{" "}
                        <Link href="/terms/account" prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700">
                          Account creation addendum
                        </Link>{" "}
                        (customer accounts).
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="text-[12px] font-semibold text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
                    >
                      Clear saved fields
                    </button>
                    <Link href="/help-center" prefetch={false} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">
                      Need help?
                    </Link>
                  </div>

                  {existingEmail ? (
                    <motion.div
                      role="alert"
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-blue-200/90 bg-blue-50/95 px-4 py-4 shadow-sm"
                    >
                      <p className="text-[13px] font-semibold text-blue-950">This email already has an account</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-blue-900/90">
                        <span className="font-medium">{existingEmail}</span> is registered on Salvya. Sign in with that email — do not create a second account.
                      </p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={loginHref(returnTo, existingEmail)}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Sign in instead
                        </Link>
                        <Link
                          href="/forgot-password"
                          prefetch={false}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-[14px] font-semibold text-blue-800 transition-colors hover:bg-blue-50/80"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </motion.div>
                  ) : null}

                  {formError && !existingEmail ? (
                    <p
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-950"
                      role="alert"
                    >
                      {formError}
                    </p>
                  ) : null}

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
                            onClick={() => setBanner(null)}
                            className="shrink-0 self-start rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800/80 hover:bg-amber-100/80"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AuthSubmitButton
                    label={t("createAccount")}
                    loadingLabel={t("creatingAccount")}
                    busy={busy}
                    disabled={oauthBusy}
                  />
                </form>
            </AuthCard>
          </div>
        </div>
      </main>

      <SignupSuccessDialog open={successOpen} next={successNext} onContinue={handleSignupSuccessContinue} />
    </AuthDaylight>
  );
}
