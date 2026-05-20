import type { ReactElement } from "react";

type IconProps = { className?: string };

export function MoreIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  const icons: Record<string, (p: IconProps) => ReactElement> = {
    analytics: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path d="M4 19V5M10 19V9M16 19v-6M22 19V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    leaderboard: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M8 21V10M12 21V3M16 21v-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    notifications: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M15 17H9l1 3h4l1-3zM18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    profile: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 20c1.5-3 4-4 7-4s5.5 1 7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    settings: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    wallet: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M4 8h16v10H4V8zm3-3h10a2 2 0 012 2v1H5V7a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    shop: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M6 7h12l-1 12H7L6 7zM9 7V5a3 3 0 016 0v2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    help: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 9a2.5 2.5 0 114.2 1.5c-.8.5-1.2 1-1.2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r=".75" fill="currentColor" />
      </svg>
    ),
    terms: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M8 4h8l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M16 4v4h4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    export: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M12 3v12M8 11l4 4 4-4M5 21h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    dashboard: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M4 11V5a1 1 0 011-1h14a1 1 0 011 1v6M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4M9 15h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    products: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path d="M6 7h12M6 12h12M6 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    contact: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M4 6h16v12H4V6zm2 3l6 4 6-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    report: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M12 9v4m0 4h.01M10.3 4.7l-7.8 13.5A1 1 0 003.4 20h17.2a1 1 0 00.9-1.5l-7.8-13.5a1 1 0 00-1.8 0z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    logout: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    links: (p) => (
      <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
        <path
          d="M10 13a3 3 0 100-6 3 3 0 000 6zm8 2l4 2-4 2v-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const Icon = icons[id] ?? icons.dashboard;
  return <Icon className={className} />;
}
