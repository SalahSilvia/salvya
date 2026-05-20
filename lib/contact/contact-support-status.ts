import { SALVYA_CONTACT } from "@/lib/contact/salvya-contact";

export type SupportAvailability = "open" | "closed" | "unknown";

const OPEN_DOW = new Set([1, 2, 3, 4, 5, 6]); // Mon–Sat
const OPEN_HOUR_START = 10;
const OPEN_HOUR_END = 19;

function availabilityInTimeZone(tz: string): SupportAvailability {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date());

    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
    const dowMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const dow = dowMap[weekday] ?? -1;

    if (!OPEN_DOW.has(dow)) return "closed";
    if (hour >= OPEN_HOUR_START && hour < OPEN_HOUR_END) return "open";
    return "closed";
  } catch {
    return "unknown";
  }
}

/** Open if either Morocco or Italy desk is in support hours. */
export function getSupportAvailability(): SupportAvailability {
  const ma = availabilityInTimeZone("Africa/Casablanca");
  const it = availabilityInTimeZone("Europe/Rome");
  if (ma === "open" || it === "open") return "open";
  if (ma === "unknown" && it === "unknown") return "unknown";
  return "closed";
}

export function supportStatusLabel(status: SupportAvailability): string {
  if (status === "open") return "Support is online now";
  if (status === "closed") return "Outside support hours";
  return SALVYA_CONTACT.hours.summary;
}

export function supportStatusDetail(status: SupportAvailability): string {
  if (status === "open") return "WhatsApp and phone are staffed — we still answer emails 24/7 when we can.";
  if (status === "closed") return SALVYA_CONTACT.hours.note;
  return SALVYA_CONTACT.responseTime;
}

function formatDeskLocalTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).format(new Date());
  } catch {
    return "—";
  }
}

export function deskClocks(): { label: string; time: string }[] {
  return [
    { label: "Morocco", time: formatDeskLocalTime("Africa/Casablanca") },
    { label: "Italy", time: formatDeskLocalTime("Europe/Rome") },
  ];
}
