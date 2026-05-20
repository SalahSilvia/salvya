"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export function SentryExampleClient() {
  const [sent, setSent] = useState(false);

  const triggerError = () => {
    setSent(false);
    throw new Error("Salvya Sentry test error — safe to ignore");
  };

  const triggerCapture = () => {
    Sentry.captureException(new Error("Salvya Sentry captureException test"));
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-6 py-16 text-white">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Sentry verify</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Test error monitoring</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/50">
          Use these buttons to send events to the <strong className="text-white/80">salvya-production</strong> project.
          Check Sentry → Issues within a minute.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={triggerError}
          className="rounded-full bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Throw uncaught error
        </button>
        <button
          type="button"
          onClick={triggerCapture}
          className="rounded-full border border-white/[0.14] bg-white/[0.08] px-5 py-2.5 text-[13px] font-semibold text-white/90"
        >
          captureException only
        </button>
      </div>
      {sent ? (
        <p className="text-[13px] text-emerald-400/90" role="status">
          Sent captureException — open Sentry Issues to confirm.
        </p>
      ) : null}
      <p className="text-[12px] text-white/35">
        Do not test from the browser DevTools console; use these buttons so Sentry receives the event.
      </p>
    </div>
  );
}
