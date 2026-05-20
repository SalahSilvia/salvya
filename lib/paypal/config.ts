export type PayPalMode = "sandbox" | "live";

export type PayPalServerConfig = {
  clientId: string;
  clientSecret: string;
  mode: PayPalMode;
  baseUrl: string;
};

function readMode(): PayPalMode {
  const raw = (process.env.PAYPAL_MODE ?? process.env.PAYPAL_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
  return raw === "live" || raw === "production" ? "live" : "sandbox";
}

export function paypalApiBaseUrl(mode: PayPalMode): string {
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

/** Server-only PayPal credentials. Never import from client components. */
export function getPayPalServerConfig(): PayPalServerConfig | null {
  const clientId = (process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET ?? "").trim();
  if (!clientId || !clientSecret) return null;

  const mode = readMode();
  return {
    clientId,
    clientSecret,
    mode,
    baseUrl: paypalApiBaseUrl(mode),
  };
}

export function isPayPalServerConfigured(): boolean {
  return getPayPalServerConfig() !== null;
}
