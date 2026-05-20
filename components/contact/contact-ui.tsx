"use client";

import type { ReactNode } from "react";

export const CONTACT_EASE = [0.22, 1, 0.36, 1] as const;

export function ContactAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-[8%] top-[-5%] h-[min(20rem,60vw)] w-[min(20rem,60vw)] rounded-full bg-[#2D6BFF]/[0.14] blur-[90px]" />
      <div className="absolute -left-[20%] bottom-[10%] h-[min(14rem,45vw)] w-[min(14rem,45vw)] rounded-full bg-emerald-500/[0.06] blur-[80px]" />
      <div className="grain-overlay absolute inset-0 opacity-[0.04]" />
    </div>
  );
}

export function ContactSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/38">{children}</h2>
  );
}

export function ContactCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.15rem] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export function CopyChip({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:border-[#2D6BFF]/35 hover:bg-white/[0.1] hover:text-white"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5 opacity-70" />
          {label}
        </>
      )}
    </button>
  );
}

export function ChannelIcon({ name }: { name: "email" | "whatsapp" | "phone" | "help" | "map" }) {
  const cls = "h-5 w-5 shrink-0";
  switch (name) {
    case "email":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M4 6.5 12 11l8-4.5M5 18h14a2 2 0 002-2V8.2a2 2 0 00-2-2H5a2 2 0 00-2 2v7.8a2 2 0 002 2Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M12 3a8.5 8.5 0 00-7.4 12.8L3 21l5.4-1.4A8.5 8.5 0 1012 3Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M6.5 4h3l1.5 4-2 1.2a11 11 0 005.8 5.8L17 13l4 1.5v3A2.5 2.5 0 0118.6 20 14 14 0 016.5 4Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.65" />
          <path d="M9.5 9.5a2.5 2.5 0 014.8.8c0 1.5-2.3 1.5-2.3 3.2M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M12 21s6-4.5 6-10a6 6 0 10-12 0c0 5.5 6 10 6 10Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.65" />
        </svg>
      );
  }
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <path d="M6 16V6a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12.5 9.5 17 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDown({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
