import { createHash } from "crypto";
import type { CreatorAnyEventType } from "@/lib/creator/events-service";

export type EventFingerprintInput = {
  eventType: CreatorAnyEventType;
  trackingCode?: string | null;
  productId?: string | null;
  userId?: string | null;
  orderId?: string | null;
  ipHash?: string | null;
  userAgentHash?: string | null;
};

export function hashVisitorIp(ip: string): string {
  return createHash("sha256").update(`salvya-ip-v1:${ip.trim()}`).digest("hex").slice(0, 32);
}

export function hashUserAgent(ua: string): string {
  return createHash("sha256").update(`salvya-ua-v1:${ua.trim().slice(0, 512)}`).digest("hex").slice(0, 32);
}

export function buildEventFingerprint(input: EventFingerprintInput): string {
  const parts = [
    input.eventType,
    (input.trackingCode ?? "").trim().toUpperCase(),
    input.productId ?? "",
    input.userId ?? "",
    input.orderId ?? "",
    input.ipHash ?? "",
    input.userAgentHash ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export function visitorKeyFromRequest(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(`${hashVisitorIp(ip)}|${hashUserAgent(userAgent)}`)
    .digest("hex")
    .slice(0, 40);
}
