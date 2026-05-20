import { getPayPalServerConfig, type PayPalMode } from "@/lib/paypal/config";

export type PayPalEnvReport = {
  mode: PayPalMode | null;
  clientIdPublic: boolean;
  clientIdServer: boolean;
  secret: boolean;
  siteUrl: boolean;
  warnings: string[];
};

/** Non-secret PayPal env audit for server routes (logs warnings once per process). */
export function auditPayPalEnvironment(): PayPalEnvReport {
  const publicId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "").trim();
  const serverId = (process.env.PAYPAL_CLIENT_ID ?? publicId).trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET ?? "").trim();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  const cfg = getPayPalServerConfig();

  const warnings: string[] = [];

  if (!publicId) {
    warnings.push("NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing — PayPal buttons will not render.");
  }
  if (!secret) {
    warnings.push("PAYPAL_CLIENT_SECRET is missing — server verification and create-order will fail.");
  }
  if (publicId && serverId && publicId !== serverId) {
    warnings.push(
      "NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_ID differ — use the same PayPal app credentials for browser + server.",
    );
  }
  if (!siteUrl) {
    warnings.push("NEXT_PUBLIC_SITE_URL is missing — emails and SEO may use the wrong domain.");
  }
  if (cfg?.mode === "live" && process.env.NODE_ENV !== "production") {
    warnings.push("PAYPAL_MODE=live while NODE_ENV is not production — double-check before processing real money.");
  }

  return {
    mode: cfg?.mode ?? null,
    clientIdPublic: Boolean(publicId),
    clientIdServer: Boolean(serverId),
    secret: Boolean(secret),
    siteUrl: Boolean(siteUrl),
    warnings,
  };
}

let envWarningsLogged = false;

export function logPayPalEnvWarningsOnce(): void {
  if (envWarningsLogged) return;
  envWarningsLogged = true;
  const report = auditPayPalEnvironment();
  if (report.warnings.length === 0) return;
  console.warn("[payments] PayPal environment warnings", {
    mode: report.mode,
    warnings: report.warnings,
  });
}
