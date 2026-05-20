import type { ReactNode } from "react";

const shell =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100/95 to-neutral-50 text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-neutral-200/70 transition-[color,box-shadow,transform] duration-200 group-hover:text-blue-700 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(37,99,235,0.2)] group-hover:ring-blue-200/70 group-active:scale-[0.97]";

function Svg({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={narrow ? "h-[15px] w-[15px]" : "h-4 w-4"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function rowInner(id: string): ReactNode {
  switch (id) {
    case "home":
      return (
        <Svg>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "bag":
      return (
        <Svg>
          <path
            d="M6 8h12l1 12H5L6 8zm3-3a3 3 0 016 0V8H9V5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "track":
      return (
        <Svg>
          <path
            d="M3 7h13l-1 9H4L3 7Zm0 0 2-3h12v12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 18h2a2 2 0 100-4h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case "sizes":
      return (
        <Svg>
          <path d="M5 19V5m4 14V9m4 10v-6m4 6V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case "help-center":
      return (
        <Svg>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="17" r="0.75" fill="currentColor" />
        </Svg>
      );
    case "about-page":
      return (
        <Svg>
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case "creator-more":
      return (
        <Svg>
          <path
            d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "policies-more":
      return (
        <Svg>
          <path
            d="M12 4.5 5 7v6c0 4.5 3.5 7 7 7s7-2.5 7-7V7l-7-2.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9.5 12.5 11 14l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return (
        <Svg>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 10v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" />
        </Svg>
      );
  }
}

export function MenuRowGlyph({ rowId }: { rowId: string }) {
  return <span className={shell}>{rowInner(rowId)}</span>;
}

function subviewInner(href: string): ReactNode {
  if (href.startsWith("/creator/apply") || href.startsWith("/creator/onboarding") || href.startsWith("/register")) {
    return (
      <Svg narrow>
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm4-1v6M19 16h-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (href.startsWith("/creator/dashboard")) {
    return (
      <Svg narrow>
        <path
          d="M4 19V5h16v14H4Zm4-10h8M8 14h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (href.startsWith("/creator")) {
    return (
      <Svg narrow>
        <path
          d="M8 5h12v14l-3-2-3 2-3-2-3 2V5a1 1 0 011-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 9h8M10 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    );
  }
  if (href.startsWith("/creator")) {
    return (
      <Svg narrow>
        <path
          d="M9 5h10a2 2 0 012 2v12a2 2 0 01-2 2H9l-4 2V7a2 2 0 012-2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 10h4M12 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    );
  }
  if (href.includes("cookies")) {
    return (
      <Svg narrow>
        <path
          d="M12 3a9 9 0 109 9c0-.5-.5-1-1-1h-1a2 2 0 01-2-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v1a2 2 0 01-2 2H4a2 2 0 00-2 2v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (href.startsWith("/shipping") || href.startsWith("/returns")) {
    return (
      <Svg narrow>
        <path
          d="M3 7h13l-1 9H4L3 7Zm0 0 2-3h12v12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (href.startsWith("/payment")) {
    return (
      <Svg narrow>
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    );
  }
  if (href.startsWith("/terms") || href.includes("terms")) {
    return (
      <Svg narrow>
        <path
          d="M8 4h8a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg narrow>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function SubviewLinkGlyph({ href }: { href: string }) {
  return <span className={shell}>{subviewInner(href)}</span>;
}
