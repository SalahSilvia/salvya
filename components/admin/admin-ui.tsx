import type { ReactNode } from "react";
import Link from "next/link";
import {
  adminLinkClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";

export { adminPanelClass, adminTooltipClass } from "@/components/admin/admin-theme";

const accentStyles = {
  blue: { bg: "bg-[#eef4ff]", ring: "ring-[#2D6BFF]/20", icon: "text-[#2D6BFF]" },
  emerald: { bg: "bg-emerald-50", ring: "ring-emerald-500/20", icon: "text-emerald-700" },
  amber: { bg: "bg-amber-50", ring: "ring-amber-500/20", icon: "text-amber-800" },
  violet: { bg: "bg-violet-50", ring: "ring-violet-500/20", icon: "text-violet-700" },
  rose: { bg: "bg-rose-50", ring: "ring-rose-500/20", icon: "text-rose-700" },
} as const;

export function AdminSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[13px] font-semibold text-[#202223]">{title}</h2>
        {description ? <p className={`mt-1 text-[12px] ${adminMuted}`}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#e3e5e7] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.65rem] font-semibold tracking-tight text-[#202223] sm:text-[1.85rem]">{title}</h1>
        {description ? <p className={`mt-2 max-w-2xl text-[14px] leading-relaxed ${adminMuted}`}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminKpiCard({
  label,
  value,
  hint,
  accent = "blue",
  icon,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: keyof typeof accentStyles;
  icon?: ReactNode;
  trend?: { label: string; positive?: boolean };
}) {
  const a = accentStyles[accent];
  return (
    <div className={`rounded-xl border border-[#e3e5e7] bg-white p-5 shadow-sm ring-1 ring-inset ${a.ring}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">{label}</p>
          <p className="mt-2.5 text-[1.65rem] font-semibold tabular-nums tracking-tight text-[#202223] sm:text-[1.85rem]">{value}</p>
          {trend ? (
            <p className={`mt-2 text-[12px] font-medium ${trend.positive !== false ? "text-emerald-700" : adminMuted}`}>
              {trend.label}
            </p>
          ) : null}
          {hint && !trend ? <p className={`mt-2 text-[12px] leading-snug ${adminMuted}`}>{hint}</p> : null}
        </div>
        {icon ? (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#e3e5e7] ${a.bg} ${a.icon}`}>
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function AdminPanel({
  title,
  subtitle,
  children,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${adminPanelClass} ${className ?? ""}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e3e5e7] px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[#202223]">{title}</h2>
          {subtitle ? <p className={`mt-1 text-[12px] ${adminMuted}`}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminQuickTile({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex items-center gap-3 rounded-xl border border-[#e3e5e7] bg-white px-4 py-3.5 shadow-sm transition-[border-color,box-shadow,transform] hover:border-[#2D6BFF]/40 hover:shadow-md active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#b4ccf7] bg-[#eef4ff] text-[#2D6BFF] transition-colors group-hover:bg-[#dce8ff]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-[#202223]">{label}</span>
        <span className={`mt-0.5 block text-[12px] ${adminMuted}`}>{description}</span>
      </span>
      <span className={`ml-auto shrink-0 transition-transform group-hover:translate-x-0.5 ${adminMuted} group-hover:text-[#2D6BFF]`} aria-hidden>
        →
      </span>
    </Link>
  );
}

export function AdminLivePill({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      {count} live now
    </span>
  );
}

export function AdminTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} prefetch={false} className={`inline-flex text-[13px] ${adminLinkClass}`}>
      {children}
    </Link>
  );
}

export function AdminWelcomeHero({ liveUsers }: { liveUsers?: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#e3e5e7] bg-white p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#2D6BFF]/10 blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2D6BFF]">Pro account</p>
          <h2 className="mt-1 text-[1.5rem] font-semibold tracking-tight text-[#202223] sm:text-[1.75rem]">
            {greeting} — command center
          </h2>
          <p className={`mt-2 max-w-xl text-[14px] leading-relaxed ${adminMuted}`}>
            Manage catalog, fulfillment, customers, and analytics from one professional workspace.
          </p>
        </div>
        {liveUsers != null ? (
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <AdminLivePill count={liveUsers} />
            <p className="text-[12px] text-[#8c9196]">Real-time storefront pulse</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
