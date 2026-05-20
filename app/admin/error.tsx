"use client";

import { useEffect } from "react";
import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { captureClientError } from "@/lib/sentry/capture-client-error";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error("[Salvya Admin]", error);
    captureClientError(error, { digest: error.digest ?? "unknown", surface: "admin-error" });
  }, [error]);

  return (
    <SalvyaErrorPage
      surface="admin"
      digest={error.digest}
      onRetry={reset}
    />
  );
}
