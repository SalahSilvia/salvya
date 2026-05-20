import type { ReactNode } from "react";

const shell =
  "flex shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] text-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[color,background-color,border-color,box-shadow,transform] duration-200 group-hover:border-[#2D6BFF]/30 group-hover:bg-[#2D6BFF]/12 group-hover:text-[#c5d4ff] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_-8px_rgba(45,107,255,0.35)] group-active:scale-[0.97]";

function Svg({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-[15px] w-[15px]" : "h-[17px] w-[17px]";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={dim} aria-hidden>
      {children}
    </svg>
  );
}

function iconInner(linkId: string, size: "sm" | "md"): ReactNode {
  const sw = "1.45";
  switch (linkId) {
    case "home":
      return (
        <Svg size={size}>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "shop":
      return (
        <Svg size={size}>
          <path
            d="M4 10h16l-1.15 8.5H5.15L4 10zm2-4h12l.85 4H5.15L6 6z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "blog":
      return (
        <Svg size={size}>
          <path
            d="M8 4h8l2 3v13H6V7l2-3Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9 11h6M9 14.5h4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "bag":
      return (
        <Svg size={size}>
          <path
            d="M8 7.25V5.75a4 4 0 018 0v1.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.25 7.25h11.5c.55 0 1 .45 1 1l-.85 9.25c-.06.65-.6 1.15-1.26 1.15H7.36c-.66 0-1.2-.5-1.26-1.15L5.25 8.25c0-.55.45-1 1-1Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9.5 11h5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity={0.55} />
        </Svg>
      );
    case "orders":
      return (
        <Svg size={size}>
          <path
            d="M3 8.5 12 4l9 4.5-9 4.5ZM12 13v7M3 8.5V16l9 5 9-5V8.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "track":
      return (
        <Svg size={size}>
          <path
            d="M3 7h13l-1 9H4L3 7Zm0 0 2-3h12v12"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 18h2a2 2 0 100-4h-1" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "sizes":
      return (
        <Svg size={size}>
          <path d="M5 19V5m4 14V9m4 10v-6m4 6V7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "help":
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={sw} />
          <path d="M9.2 9.2a2.8 2.8 0 015.1 1.4c0 1.8-2.6 2.6-2.6 2.6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
          <circle cx="12" cy="16.8" r="0.85" fill="currentColor" />
        </Svg>
      );
    case "policies":
      return (
        <Svg size={size}>
          <path
            d="M12 4.5 5.5 7v6.5c0 4.2 3.2 6.5 6.5 6.5S18.5 17.7 18.5 13.5V7L12 4.5Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9.5 12.5 11 14l3.5-3.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "payment":
      return (
        <Svg size={size}>
          <rect x="3.5" y="6.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth={sw} />
          <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth={sw} />
          <path d="M7 14.5h4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "shipping":
      return (
        <Svg size={size}>
          <path
            d="M3 7h13l-1 9H4L3 7Zm0 0 2-3h12v12"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 18h2a2 2 0 100-4h-1" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "terms-recovery":
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 10v6M12 7h.01" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "cookies-settings":
      return (
        <Svg size={size}>
          <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7Z" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "terms":
    case "terms-account":
    case "terms-influencer":
      return (
        <Svg size={size}>
          <path
            d="M8 4h8l2 3v13H6V7l2-3Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9 11h6M9 14.5h4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "returns":
      return (
        <Svg size={size}>
          <path
            d="M4 7h11l1 9H5L4 7Zm11-2 2v2M7 7V5a2 2 0 014 0v2"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12.5h4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "cookies":
      return (
        <Svg size={size}>
          <path
            d="M12 3a9 9 0 109 9 8-8-9-9Zm-2.5 6.5a1.25 1.25 0 102.5 0 1.25 1.25 0 00-2.5 0Zm4 2a1 1 0 110 2 1 1 0 010-2Zm-3 4a1 1 0 110 2 1 1 0 010-2Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "about":
      return (
        <Svg size={size}>
          <path
            d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9-3.6-4 .7 3.6-2.8-4-.6L12 3z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "account":
      return (
        <Svg size={size}>
          <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth={sw} />
          <path d="M6 20a6 6 0 0112 0" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "profile":
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={sw} />
          <circle cx="12" cy="10" r="2.75" stroke="currentColor" strokeWidth={sw} />
          <path d="M7.5 17.5c1.2-1.8 2.8-2.75 4.5-2.75s3.3.95 4.5 2.75" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "sign-out":
      return (
        <Svg size={size}>
          <path
            d="M10 7V5.5A2.5 2.5 0 0112.5 3h5A2.5 2.5 0 0120 5.5v13a2.5 2.5 0 01-2.5 2.5h-5A2.5 2.5 0 0110 18.5V17"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path d="M14 12H4m0 0l2.5-2.5M4 12l2.5 2.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "notifications":
      return (
        <Svg size={size}>
          <path
            d="M12 22a2 2 0 002-2H10a2 2 0 002 2ZM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "likes":
      return (
        <Svg size={size}>
          <path
            d="M12 21s-7-4.35-9.6-9.35C-.3 8.1 1.6 4.5 7.5 4.5c1.74 0 3.41.81 4.5 2.09C13.09 5.31 14.76 4.5 16.5 4.5 19.58 4.5 22 6.92 22 10c0 3.78-3.4 6.86-8.55 11.54L12 21z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "report-problem":
      return (
        <Svg size={size}>
          <path
            d="M12 8v5m0 3h.01M10.3 4.3 4.6 18a1 1 0 00.9 1.4h12a1 1 0 00.9-1.4l-5.7-13.7a1 1 0 00-1.8 0Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "contact":
      return (
        <Svg size={size}>
          <path
            d="M4 6.5 12 11l8-4.5M5 18h14a2 2 0 002-2V8.2a2 2 0 00-2-2H5a2 2 0 00-2 2v7.8a2 2 0 002 2Z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "search":
      return (
        <Svg size={size}>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={sw} />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 10v5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
  }
}

type Props = {
  linkId: string;
  size?: "sm" | "md";
  variant?: "boxed" | "glyph";
  className?: string;
};

export function CustomerMenuSoftIcon({
  linkId,
  size = "md",
  variant = "boxed",
  className = "",
}: Props) {
  if (variant === "glyph") {
    return <span className={`inline-flex text-current ${className}`}>{iconInner(linkId, size)}</span>;
  }
  const box = size === "sm" ? "h-9 w-9 rounded-xl" : "h-10 w-10 rounded-2xl";
  return <span className={`${shell} ${box} ${className}`}>{iconInner(linkId, size)}</span>;
}
