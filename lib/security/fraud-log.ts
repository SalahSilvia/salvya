export type FraudEventType =
  | "rate_limited"
  | "price_label_mismatch"
  | "price_cents_mismatch"
  | "placement_key_reuse"
  | "duplicate_order_attempt"
  | "paypal_verify_failed"
  | "paypal_duplicate_blocked"
  | "checkout_rapid_fire"
  | "invalid_discount"
  | "variant_id_mismatch";

export type FraudEvent = {
  id: string;
  type: FraudEventType;
  at: string;
  ip?: string;
  email?: string;
  meta?: Record<string, unknown>;
};

const MAX_EVENTS = 500;
const events: FraudEvent[] = [];
let seq = 0;

function nextId(): string {
  seq += 1;
  return `fraud-${Date.now()}-${seq}`;
}

export function logFraudEvent(
  type: FraudEventType,
  meta?: Record<string, unknown>,
  ctx?: { ip?: string; email?: string },
): void {
  const entry: FraudEvent = {
    id: nextId(),
    type,
    at: new Date().toISOString(),
    ...(ctx?.ip ? { ip: ctx.ip } : {}),
    ...(ctx?.email ? { email: ctx.email } : {}),
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };
  events.unshift(entry);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  if (process.env.NODE_ENV !== "test") {
    console.warn("[fraud]", JSON.stringify(entry));
  }
}

export function getRecentFraudEvents(limit = 100): FraudEvent[] {
  return events.slice(0, Math.min(limit, events.length));
}

export function summarizeFraudByIpEmail(limit = 50): {
  topIps: { key: string; count: number }[];
  topEmails: { key: string; count: number }[];
  recent: FraudEvent[];
} {
  const ipCounts = new Map<string, number>();
  const emailCounts = new Map<string, number>();
  for (const e of events) {
    if (e.ip) ipCounts.set(e.ip, (ipCounts.get(e.ip) ?? 0) + 1);
    if (e.email) emailCounts.set(e.email, (emailCounts.get(e.email) ?? 0) + 1);
  }
  const sortMap = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));

  return {
    topIps: sortMap(ipCounts),
    topEmails: sortMap(emailCounts),
    recent: getRecentFraudEvents(limit),
  };
}

/** @internal test helper */
export function clearFraudLogForTests(): void {
  events.length = 0;
}
