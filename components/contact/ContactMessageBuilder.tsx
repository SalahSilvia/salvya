"use client";

import { useMemo, useState } from "react";
import { ContactCard, ContactSectionTitle } from "@/components/contact/contact-ui";
import { WHATSAPP_TEMPLATES } from "@/lib/contact/contact-page-data";
import { SALVYA_CONTACT, whatsappHref, type ContactRegionId } from "@/lib/contact/salvya-contact";

export function ContactMessageBuilder() {
  const [region, setRegion] = useState<ContactRegionId>("morocco");
  const [message, setMessage] = useState<string>(SALVYA_CONTACT.whatsapp.morocco.prefill);

  const href = useMemo(() => whatsappHref(region, message), [region, message]);

  return (
    <ContactCard className="p-4">
      <ContactSectionTitle>Compose WhatsApp message</ContactSectionTitle>
      <p className="mt-2 text-[13px] text-white/45">Pick a line, edit your text, then open WhatsApp with everything filled in.</p>

      <div className="mt-3 flex gap-2">
        {(["morocco", "italy"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRegion(r);
              setMessage(SALVYA_CONTACT.whatsapp[r].prefill);
            }}
            className={`min-h-[40px] flex-1 rounded-xl border text-[13px] font-semibold transition-colors ${
              region === r
                ? "border-[#2D6BFF]/40 bg-[#2D6BFF]/15 text-white"
                : "border-white/[0.1] bg-white/[0.04] text-white/55 hover:bg-white/[0.06]"
            }`}
          >
            {r === "morocco" ? "🇲🇦 Morocco" : "🇮🇹 Italy"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {WHATSAPP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setMessage(t.message);
              if (t.region) setRegion(t.region);
            }}
            className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/70 hover:border-white/[0.16] hover:text-white"
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="mt-3 w-full resize-y rounded-xl border border-white/[0.12] bg-black/30 px-4 py-3 text-[14px] leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-[#2D6BFF]/40 focus:ring-2 focus:ring-[#2D6BFF]/25"
        placeholder="Type your message…"
      />

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(16,185,129,0.45)] transition-transform active:scale-[0.99]"
      >
        Open WhatsApp with this message
      </a>
    </ContactCard>
  );
}
