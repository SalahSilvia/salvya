import type { AdminNavIcon } from "@/components/admin/nav-config";

export function AdminNavIconGlyph({ name, className }: { name: AdminNavIcon; className?: string }) {
  const cls = className ?? "h-5 w-5 shrink-0";
  switch (name) {
    case "grid":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      );
    case "cart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M5 7h14l-1 12H6L5 7zm3 0V5a4 4 0 018 0v2" />
        </svg>
      );
    case "truck":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M3 9h11v8H3V9zm11 0l3 3v5h-3V9zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      );
    case "pen":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z"
          />
        </svg>
      );
    case "shirt":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M9 6l3-3 3 3 4 2v5l-3 1v8H8v-8l-3-1V8l4-2z" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M12 11a3 3 0 100-6 3 3 0 000 6zm8 7v-1a4 4 0 00-3-3.87M20 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 15.8 7.2 18l.9-5.3-3.9-3.8 5.4-.8L12 3z"
          />
        </svg>
      );
    case "mic":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm0 0v3m-6 2h12"
          />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m4 14V9m4 10V7m4 12v-6" />
        </svg>
      );
    case "gear":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6zm7.94-3c0 .47-.05.94-.14 1.4l2.02 1.58-1.92 3.32-2.38-.96a8.04 8.04 0 01-2.42 1.4l-.36 2.54h-3.84l-.36-2.54a8.04 8.04 0 01-2.42-1.4l-2.38.96-1.92-3.32 2.02-1.58a7.9 7.9 0 010-2.8l-2.02-1.58 1.92-3.32 2.38.96a8.04 8.04 0 012.42-1.4l.36-2.54h3.84l.36 2.54a8.04 8.04 0 012.42 1.4l2.38-.96 1.92 3.32-2.02 1.58c.09.46.14.93.14 1.4z" />
        </svg>
      );
    case "mail":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7l8 5 8-5M4 7v10h16V7"
          />
        </svg>
      );
    case "plus":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.8} strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      );
    case "store":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M3 9l2-4h14l2 4M5 9v10h14V9M9 13h6" />
        </svg>
      );
    case "menu":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeWidth={1.8} strokeLinecap="round" d="M5 7h14M5 12h14M5 17h10" />
        </svg>
      );
    case "wallet":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18v10H3V7zm14 0v2m-4-2v2M7 11h4"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l7 3v6c0 4.5-3.2 7.4-7 9-3.8-1.6-7-4.5-7-9V6l7-3z"
          />
        </svg>
      );
    default:
      return null;
  }
}
