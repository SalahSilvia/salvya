type IconProps = {
  active?: boolean;
  className?: string;
};

function stroke(active?: boolean) {
  return active ? 2 : 1.5;
}

export function CreatorStudioNavIcon({ id, active, className = "h-5 w-5" }: IconProps & { id: string }) {
  const sw = stroke(active);
  const opacity = active ? 1 : 0.72;

  switch (id) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path
            d="M4 11.5V6a1.5 1.5 0 011.5-1.5H9M4 11.5h16M4 11.5V18a1.5 1.5 0 001.5 1.5H18A1.5 1.5 0 0019.5 18v-6.5M9 4.5h6A1.5 1.5 0 0116.5 6v5.5M9 15.5h6"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path
            d="M7 8h10M7 12.5h10M7 17h6M5.5 4.5h13A1.5 1.5 0 0120 6v12a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18V6a1.5 1.5 0 011.5-1.5z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "links":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path
            d="M10.5 13.5a3.5 3.5 0 004.95 0l1.55-1.55a3.5 3.5 0 00-4.95-4.95L11 8"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M13.5 10.5a3.5 3.5 0 00-4.95 0L7 12.05a3.5 3.5 0 004.95 4.95L13 16"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path
            d="M4 9.5h16v8.5H4V9.5zM4 9.5V8a1.5 1.5 0 011.5-1.5h13A1.5 1.5 0 0120 8v1.5M16.5 13.25h.01"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path d="M5 19V11M10 19V5M15 19v-7M20 19V8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path d="M8 20V10M12 20V4M16 20v-6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "notifications":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <path
            d="M9.5 17h5l1 2.5h-7l1-2.5zM18 8.5a6 6 0 10-12 0c0 6.5-2.5 6.5-2.5 6.5h17S18 15 18 8.5z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <circle cx="6" cy="12" r="1.35" fill="currentColor" />
          <circle cx="12" cy="12" r="1.35" fill="currentColor" />
          <circle cx="18" cy="12" r="1.35" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden style={{ opacity }}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
  }
}
