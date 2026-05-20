"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";

/** User silhouette — matches stroke weight of `PreviewBagHeaderLink` bag icon */
function AccountIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={22} height={22} aria-hidden>
      <path
        d="M12 11.25a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 19.25c.6-2.8 3.2-4.75 6.5-4.75s5.9 1.95 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  className: string;
  style?: CSSProperties;
};

export function AccountHeaderLink({ className, style }: Props) {
  const { user, loading } = useSupabaseUser();
  const href = user ? "/account/profile" : "/login";
  const label = user ? "Account" : "Sign in";

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      style={style}
      aria-label={loading ? "Account" : label}
    >
      <span className="relative inline-flex items-center justify-center [&>svg]:translate-y-px">
        <AccountIcon />
      </span>
    </Link>
  );
}
