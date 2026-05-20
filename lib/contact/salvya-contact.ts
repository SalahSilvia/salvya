import { SALVYA_EMAIL_ALIASES } from "@/lib/email/resend-brand";

/** Public contact channels — single source of truth for the contact page and menus. */
export const SALVYA_CONTACT = {
  companyName: "Salvya",
  legalEntity: "CIEG",
  regions: ["Morocco", "Italy"] as const,
  noWalkIn:
    "We do not operate a public showroom or walk-in address. All orders and support are handled online.",
  responseTime: "We usually reply within 24 hours on email and WhatsApp (often faster).",
  hours: {
    label: "Support hours",
    summary: "Mon–Sat · 10:00–19:00 (Morocco & Italy time)",
    note: "Messages outside hours are answered on the next business day.",
  },
  emails: {
    primary: SALVYA_EMAIL_ALIASES.contact.address,
    support: SALVYA_EMAIL_ALIASES.support.address,
    orders: SALVYA_EMAIL_ALIASES.orders.address,
  },
  whatsapp: {
    italy: {
      label: "Italy (Italian)",
      region: "Italy",
      display: "+39 338 408 7178",
      e164: "393384087178",
      href: "https://wa.me/393384087178",
      prefill: "Hello Salvya, I'd like help with my order (Italy).",
    },
    morocco: {
      label: "Morocco",
      region: "Morocco",
      display: "+212 6 73 63 37 28",
      e164: "212673633728",
      href: "https://wa.me/212673633728",
      prefill: "Hello Salvya, I'd like help with my order (Morocco).",
    },
  },
  phone: {
    moroccoNational: {
      label: "Morocco — national line",
      display: "0528 885 641",
      tel: "+212528885641",
    },
  },
  helpCenterHref: "/help-center",
  helpCenterLabel: "Help center — guided answers",
  website: "https://salvyastore.com",
} as const;

export type ContactRegionId = "morocco" | "italy";

export function formatContactRegions(): string {
  return SALVYA_CONTACT.regions.join(" · ");
}

export function whatsappHref(region: ContactRegionId, customMessage?: string): string {
  const ch = region === "italy" ? SALVYA_CONTACT.whatsapp.italy : SALVYA_CONTACT.whatsapp.morocco;
  const text = customMessage?.trim() || ch.prefill;
  return `${ch.href}?text=${encodeURIComponent(text)}`;
}

export function mailtoHref(opts: { to?: string; subject?: string; body?: string }): string {
  const to = opts.to ?? SALVYA_CONTACT.emails.support;
  const params = new URLSearchParams();
  if (opts.subject) params.set("subject", opts.subject);
  if (opts.body) params.set("body", opts.body);
  const q = params.toString();
  return q ? `mailto:${to}?${q}` : `mailto:${to}`;
}

/** Plain-text block for “copy all” */
export function formatVCard(): string {
  const c = SALVYA_CONTACT;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Salvya Support",
    "ORG:Salvya",
    `EMAIL:${c.emails.support}`,
    `TEL;TYPE=WORK,VOICE:${c.phone.moroccoNational.tel}`,
    `NOTE:WhatsApp IT ${c.whatsapp.italy.display} | MA ${c.whatsapp.morocco.display}`,
    "END:VCARD",
  ].join("\r\n");
}

export function vCardDownloadFilename(): string {
  return "Salvya-Contact.vcf";
}

export function formatContactSheet(): string {
  const c = SALVYA_CONTACT;
  return [
    `${c.companyName} (${c.legalEntity}) — ${formatContactRegions()}`,
    c.noWalkIn,
    "",
    `Email (general): ${c.emails.primary}`,
    `Email (support): ${c.emails.support}`,
    `Email (orders): ${c.emails.orders}`,
    "",
    `WhatsApp Italy: ${c.whatsapp.italy.display}`,
    `WhatsApp Morocco: ${c.whatsapp.morocco.display}`,
    "",
    `Phone Morocco: ${c.phone.moroccoNational.display}`,
    "",
    `Help: ${c.website}${c.helpCenterHref}`,
  ].join("\n");
}
