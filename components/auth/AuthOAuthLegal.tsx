"use client";

import Link from "next/link";

type Props = {
  termsHref?: string;
};

/** Fine print under Google OAuth — Airbnb / Stripe pattern. */
export function AuthOAuthLegal({ termsHref = "/terms" }: Props) {
  return (
    <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-500">
      By continuing with Google you agree to Salvya&apos;s{" "}
      <Link href={termsHref} prefetch={false} className="font-semibold text-neutral-700 underline-offset-2 hover:text-neutral-950 hover:underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/terms/account" prefetch={false} className="font-semibold text-neutral-700 underline-offset-2 hover:text-neutral-950 hover:underline">
        Account policies
      </Link>
      .
    </p>
  );
}
