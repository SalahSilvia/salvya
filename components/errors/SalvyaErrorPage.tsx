"use client";

import type { ReactNode } from "react";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { Link } from "@/i18n/navigation";
import {
  ADMIN_ERROR_PRESET,
  STOREFRONT_ERROR_PRESETS,
  type SalvyaErrorPreset,
  type SalvyaErrorVariant,
} from "@/lib/errors/salvya-error-presets";
import { withLocalePath } from "@/lib/i18n/pathname";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";

export type SalvyaErrorPageProps = {
  variant?: SalvyaErrorVariant;
  surface?: "storefront" | "admin";
  locale?: string;
  title?: string;
  description?: string;
  hint?: string;
  code?: string;
  digest?: string;
  onRetry?: () => void;
  showReportLink?: boolean;
  plainLinks?: boolean;
  embedded?: boolean;
  extraActions?: ReactNode;
};

function resolveLocale(locale?: string): AppLocale {
  return locale && isAppLocale(locale) ? locale : defaultLocale;
}

function resolvePreset(
  variant: SalvyaErrorVariant,
  surface: "storefront" | "admin",
  overrides: Partial<SalvyaErrorPreset>,
): SalvyaErrorPreset {
  const base = surface === "admin" ? ADMIN_ERROR_PRESET : STOREFRONT_ERROR_PRESETS[variant];
  return {
    code: overrides.code ?? base.code,
    title: overrides.title ?? base.title,
    description: overrides.description ?? base.description,
    hint: overrides.hint ?? base.hint,
  };
}

function shellClass(isAdmin: boolean, embedded: boolean): string {
  if (isAdmin) {
    return embedded
      ? "mx-auto w-full max-w-lg rounded-2xl border border-[#e3e5e7] bg-white px-6 py-10 text-[#202223] shadow-sm"
      : "flex min-h-[70vh] flex-col items-center justify-center bg-[#f6f6f7] px-6 py-16 text-[#202223]";
  }
  return embedded
    ? "relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#050508] px-6 py-10 text-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]"
    : "relative flex min-h-[min(100dvh,920px)] flex-col items-center justify-center overflow-hidden bg-[#050508] px-6 py-16 text-white";
}

export function SalvyaErrorPage({
  variant = "runtime",
  surface = "storefront",
  locale,
  title,
  description,
  hint,
  code,
  digest,
  onRetry,
  showReportLink = true,
  plainLinks = false,
  embedded = false,
  extraActions,
}: SalvyaErrorPageProps) {
  const loc = resolveLocale(locale);
  const preset = resolvePreset(variant, surface, { title, description, hint, code });
  const isAdmin = surface === "admin";

  const shopPath = isAdmin ? "/admin/overview" : "/shop";
  const homePath = isAdmin ? "/admin" : "/";
  const helpPath = "/help-center";
  const reportPath = "/report-problem";
  const trackPath = "/track-order";

  const shopHref = plainLinks && !isAdmin ? withLocalePath(shopPath, loc) : shopPath;
  const homeHref = plainLinks && !isAdmin ? withLocalePath(homePath, loc) : homePath;
  const helpHref = plainLinks ? withLocalePath(helpPath, loc) : helpPath;
  const reportHref = plainLinks ? withLocalePath(reportPath, loc) : reportPath;
  const trackHref = plainLinks ? withLocalePath(trackPath, loc) : trackPath;

  const NavLink = plainLinks
    ? ({ href, className, children }: { href: string; className: string; children: ReactNode }) => (
        <a href={href} className={className}>
          {children}
        </a>
      )
    : ({ href, className, children }: { href: string; className: string; children: ReactNode }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      );

  return (
    <div className={shellClass(isAdmin, embedded)}>
      {!isAdmin && !embedded ? (<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,107,255,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e18]/90 via-[#050508] to-[#020203]" /><div className="absolute -left-[20%] top-[15%] h-[min(90vw,420px)] w-[min(90vw,420px)] rounded-full bg-[#2D6BFF]/18 blur-[100px]" />
          <div className="absolute -right-[15%] top-[40%] h-[min(70vw,340px)] w-[min(70vw,340px)] rounded-full bg-[#1e3a8a]/30 blur-[90px]" />
        </div>
      ) : null}

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="flex justify-center">
          <SalvyaLogoImage
            variant={isAdmin ? "dark" : "light"}
            alt="Salvya"
            fallback="word"
            className={isAdmin ? "h-7 w-auto opacity-90" : "h-7 w-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"}
            fallbackClassName={
              isAdmin
                ? "text-lg font-semibold tracking-tight text-[#202223]"
                : "text-lg font-semibold tracking-tight text-white"
            }
          />
        </div>

        <p
          className={
            isAdmin
              ? "mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7175]"
              : "mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35"
          }
        >
          {preset.code}
        </p>
        <h1
          className={
            isAdmin
              ? "mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#202223]"
              : "mt-3 text-[26px] font-semibold tracking-[-0.03em] text-white"
          }
        >
          {preset.title}
        </h1>
        <p
          className={
            isAdmin
              ? "mt-3 text-[15px] leading-relaxed text-[#6d7175]"
              : "mt-3 text-[15px] leading-relaxed text-white/50"
          }
        >
          {preset.description}
        </p>
        {preset.hint ? (
          <p
            className={
              isAdmin ? "mt-3 text-[13px] leading-relaxed text-[#8c9196]" : "mt-3 text-[13px] leading-relaxed text-white/40"
            }
          >
            {preset.hint}
          </p>
        ) : null}
        {digest ? (
          <p
            className={isAdmin ? "mt-4 font-mono text-[10px] text-[#8c9196]" : "mt-4 font-mono text-[10px] text-white/25"}
            title="Error reference for support"
          >
            Ref: {digest}
          </p>
        ) : null}

        <div className="mt-9 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className={
                isAdmin
                  ? "rounded-full bg-[#2D6BFF] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#2557d6]"
                  : "rounded-full bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_32px_-10px_rgba(45,107,255,0.55)] hover:brightness-105"
              }
            >
              Try again
            </button>
          ) : null}
          {isAdmin ? (
            <>
              <a
                href={shopHref}
                className="rounded-full border border-[#c9cccf] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#202223] hover:bg-[#fafbfb]"
              >
                Open overview
              </a>
              <a
                href="/admin/orders"
                className="rounded-full border border-[#e3e5e7] px-5 py-2.5 text-[13px] font-semibold text-[#6d7175] hover:text-[#202223]"
              >
                Orders
              </a>
            </>
          ) : (
            <>
              <NavLink
                href={shopHref}
                className="rounded-full border border-white/[0.14] bg-white/[0.08] px-5 py-2.5 text-[13px] font-semibold text-white/90 hover:bg-white/[0.12]"
              >
                Browse shop
              </NavLink>
              <NavLink
                href={homeHref}
                className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[13px] font-semibold text-white/70 hover:text-white"
              >
                Home
              </NavLink>
            </>
          )}
        </div>

        {extraActions ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">{extraActions}</div>
        ) : null}

        {!isAdmin ? (
          <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] font-medium">
            <NavLink href={helpHref} className="text-[#7eb0ff] hover:text-[#a8c8ff]">
              Help center
            </NavLink>
            <NavLink href={trackHref} className="text-white/45 hover:text-white/70">
              Track order
            </NavLink>
            {showReportLink ? (
              <NavLink href={reportHref} className="text-white/45 hover:text-white/70">
                Report a problem
              </NavLink>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-[12px] text-[#8c9196]">Check server logs or store settings if this repeats.</p>
        )}
      </div>
    </div>
  );
}
