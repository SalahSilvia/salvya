import { randomUUID } from "crypto";

export type CheckoutLogContext = Record<string, unknown>;

export function newCheckoutRequestId(): string {
  try {
    return randomUUID();
  } catch {
    return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function logCheckoutEvent(
  scope: string,
  level: "info" | "warn" | "error",
  fields: CheckoutLogContext,
): void {
  if (process.env.NODE_ENV === "test") return;
  const line = JSON.stringify({ scope, level, at: new Date().toISOString(), ...fields });
  if (level === "error") console.error(`[checkout] ${line}`);
  else if (level === "warn") console.warn(`[checkout] ${line}`);
  else console.info(`[checkout] ${line}`);
}
