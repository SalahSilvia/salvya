"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { captureClientError } from "@/lib/sentry/capture-client-error";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleErrorPage({ error, reset }: Props) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : undefined;

  useEffect(() => {
    console.error("[Salvya]", error);
    captureClientError(error, { digest: error.digest ?? "unknown", surface: "locale-error", locale: locale ?? "en" });
  }, [error, locale]);

  return (
    <SalvyaErrorPage
      variant="runtime"
      locale={locale}
      digest={error.digest}
      onRetry={reset}
    />
  );
}
