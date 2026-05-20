"use client";

import { useEffect } from "react";
import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { captureClientError } from "@/lib/sentry/capture-client-error";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Catches errors in the root layout (when locale shells are unavailable). */
export default function GlobalErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error("[Salvya Global]", error);
    captureClientError(error, { digest: error.digest ?? "unknown", surface: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-[#050508] text-white antialiased">
        <SalvyaErrorPage variant="global" digest={error.digest} onRetry={reset} plainLinks locale="en" />
      </body>
    </html>
  );
}
