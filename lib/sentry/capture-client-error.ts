import { isSentryRuntimeEnabled } from "@/lib/sentry/options";

/** Report a client-side error to Sentry when configured (browser SDK only — avoids Node/Prisma in client bundles). */
export function captureClientError(error: unknown, extras?: Record<string, string | number | boolean>) {
  if (!isSentryRuntimeEnabled() || typeof window === "undefined") return;

  void import("@sentry/browser").then((Sentry) => {
    Sentry.withScope((scope) => {
      if (extras) {
        for (const [key, value] of Object.entries(extras)) {
          scope.setExtra(key, value);
        }
      }
      Sentry.captureException(error);
    });
  });
}
