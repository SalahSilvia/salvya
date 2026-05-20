import { isSentryRuntimeEnabled } from "@/lib/sentry/options";

export async function register() {
  if (!isSentryRuntimeEnabled()) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

type RequestErrorHandler = typeof import("@sentry/nextjs").captureRequestError;

export const onRequestError: RequestErrorHandler = (...args) => {
  if (!isSentryRuntimeEnabled()) return;
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureRequestError(...args);
  });
};
