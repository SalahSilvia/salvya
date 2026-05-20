import type { EmailAutomationEvent } from "@/lib/email/automations";

/** Fire lifecycle automations from the browser (welcome, cart abandoned, etc.). */
export async function triggerEmailAutomation(
  event: EmailAutomationEvent,
  payload: {
    email: string;
    customerName?: string;
    cartUrl?: string;
    productTitle?: string;
    discountCode?: string;
    artistName?: string;
    collectionName?: string;
  },
): Promise<void> {
  try {
    await fetch("/api/email/automation", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...payload }),
    });
  } catch {
    /* non-fatal */
  }
}
