import type { Integration } from "@sentry/core";

/** Public DSN — required for browser error reporting. */
export function getSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || process.env.SENTRY_DSN?.trim();
  return dsn || undefined;
}

/**
 * Whether Sentry should load and report.
 * Development is opt-in (`SENTRY_ENABLED=true`) to avoid heavy OpenTelemetry/Prisma bundles in webpack dev.
 */
export function isSentryRuntimeEnabled(): boolean {
  if (!getSentryDsn()) return false;
  if (process.env.SENTRY_ENABLED === "false") return false;
  if (process.env.SENTRY_ENABLED === "true") return true;
  return process.env.NODE_ENV === "production";
}

/** @deprecated Use isSentryRuntimeEnabled — kept for callers that only gate capture. */
export function isSentryEnabled(): boolean {
  return isSentryRuntimeEnabled();
}

function withoutPrismaIntegration(integrations: Integration[]): Integration[] {
  return integrations.filter((integration) => {
    const name = integration.name ?? "";
    return !name.toLowerCase().includes("prisma");
  });
}

/** Shared init options for client, server, and edge. */
export function sentryInitOptions() {
  const dsn = getSentryDsn();
  if (!dsn || !isSentryRuntimeEnabled()) return null;

  return {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    enabled: true,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    sendDefaultPii: false,
    integrations: (defaults: Integration[]) => withoutPrismaIntegration(defaults),
  } as const;
}
