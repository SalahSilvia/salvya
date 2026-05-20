import Link from "next/link";
import type { ReactNode } from "react";
import { DOC_CATEGORIES } from "@/lib/docs/categories";

export function DocsShell({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="min-h-dvh bg-[#fafbfd] text-neutral-950 antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(100%_80%_at_50%_-20%,rgba(59,130,246,0.08),transparent_55%)]" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:py-4">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/" className="font-semibold text-neutral-500 hover:text-neutral-900">
              Home
            </Link>
            {breadcrumbs?.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                <span className="text-neutral-300">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="font-semibold text-neutral-500 hover:text-neutral-900">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-semibold text-neutral-900">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/help-center" className="text-[12px] font-semibold text-neutral-500 hover:text-blue-700">
              Help Center
            </Link>
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Docs
            </span>
          </div>
        </div>
        <div className="border-t border-neutral-100">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DOC_CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/docs/${c.id}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold text-neutral-600 hover:bg-blue-50 hover:text-blue-800"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </header>
      <div className="relative mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] py-10 pr-[max(1rem,env(safe-area-inset-right))] sm:py-14">
        {children}
      </div>
    </div>
  );
}
