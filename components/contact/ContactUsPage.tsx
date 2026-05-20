"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState, type ReactNode } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import { ContactFaqSection } from "@/components/contact/ContactFaqSection";
import { ContactMessageBuilder } from "@/components/contact/ContactMessageBuilder";
import { ContactOrderLookup } from "@/components/contact/ContactOrderLookup";
import {
  channelVisible,
  ContactChannelTabs,
  ContactShareTools,
} from "@/components/contact/ContactPageTools";
import { ContactSupportBanner } from "@/components/contact/ContactSupportBanner";
import {
  ChannelIcon,
  ContactAmbient,
  ContactCard,
  CONTACT_EASE,
  ContactSectionTitle,
  CopyChip,
} from "@/components/contact/contact-ui";
import {
  CONTACT_INTENTS,
  CONTACT_QUICK_LINKS,
  intentMailtoHref,
  type ContactChannelFilter,
} from "@/lib/contact/contact-page-data";
import {
  formatContactRegions,
  formatContactSheet,
  mailtoHref,
  SALVYA_CONTACT,
  whatsappHref,
  type ContactRegionId,
} from "@/lib/contact/salvya-contact";

function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      /* clipboard denied */
    }
  }, []);

  return { copiedKey, copy };
}

type ChannelProps = {
  icon: "email" | "whatsapp" | "phone" | "help";
  title: string;
  subtitle?: string;
  value: string;
  href?: string;
  external?: boolean;
  copyKey?: string;
  copyValue?: string;
  copiedKey?: string | null;
  onCopy?: (key: string, text: string) => void;
  actions?: ReactNode;
};

function ContactChannel({
  icon,
  title,
  subtitle,
  value,
  href,
  external,
  copyKey,
  copyValue,
  copiedKey,
  onCopy,
  actions,
}: ChannelProps) {
  const inner = (
    <div className="flex min-w-0 flex-1 gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#8fa8e8]">
        <ChannelIcon name={icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">{title}</p>
        {subtitle ? <p className="mt-0.5 text-[12px] text-white/45">{subtitle}</p> : null}
        <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-white/92">{value}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {copyKey && copyValue && onCopy ? (
            <CopyChip
              label="Copy"
              value={copyValue}
              copied={copiedKey === copyKey}
              onCopy={() => onCopy(copyKey, copyValue)}
            />
          ) : null}
          {actions}
        </div>
      </div>
      {href ? (
        <span className="mt-3 shrink-0 text-white/25 group-hover:text-[#8fa8e8]" aria-hidden>
          →
        </span>
      ) : null}
    </div>
  );

  if (!href) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">{inner}</div>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group block rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 transition-colors hover:border-[#2D6BFF]/30 hover:bg-white/[0.06]"
    >
      {inner}
    </a>
  );
}

function QuickAction({
  label,
  hint,
  href,
  external,
  accent,
  icon,
}: {
  label: string;
  hint: string;
  href: string;
  external?: boolean;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`flex min-h-[5.5rem] flex-col justify-between rounded-2xl border p-3.5 transition-[transform,border-color] active:scale-[0.99] ${accent}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-white/85">
        {icon}
      </span>
      <span>
        <span className="block text-[14px] font-semibold tracking-[-0.02em] text-white/92">{label}</span>
        <span className="mt-0.5 block text-[11px] text-white/42">{hint}</span>
      </span>
    </a>
  );
}

export function ContactUsPage() {
  const reduceMotion = useReducedMotion();
  const { copiedKey, copy } = useCopyFeedback();
  const [channel, setChannel] = useState<ContactChannelFilter>("all");
  const c = SALVYA_CONTACT;

  const regionCards: { id: ContactRegionId; flag: string; title: string; blurb: string }[] = [
    {
      id: "morocco",
      flag: "🇲🇦",
      title: "Morocco",
      blurb: "COD orders, local delivery & national phone line",
    },
    {
      id: "italy",
      flag: "🇮🇹",
      title: "Italy",
      blurb: "Italian WhatsApp & EU shopper support",
    },
  ];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
      <ContactAmbient />

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/90 px-5 pb-4 pt-[max(1.1rem,env(safe-area-inset-top))] backdrop-blur-2xl sm:px-6">
        <AccountBackButton fallbackHref="/menu" />
        <motion.div
          className="relative mt-4 overflow-hidden rounded-[1.2rem] border border-white/[0.1] bg-gradient-to-br from-[#2D6BFF]/[0.2] via-[#0a0a10]/90 to-[#050508] p-[1px]"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: CONTACT_EASE }}
        >
          <div className="rounded-[1.15rem] bg-[#0a0a10]/85 px-4 py-4 backdrop-blur-sm sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9eb6ff]">Support</p>
            <h1 className="mt-1 text-[clamp(1.45rem,5vw,1.65rem)] font-semibold tracking-[-0.04em]">Contact us</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-white/48">{c.responseTime}</p>
            <p className="mt-3 inline-flex rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/55">
              {c.hours.summary}
            </p>
            <div className="mt-3">
              <ContactSupportBanner />
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 space-y-7 px-5 py-6 pb-32 sm:px-6">
        <section className="space-y-3">
          <ContactSectionTitle>Quick actions</ContactSectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            <QuickAction
              label="WhatsApp IT"
              hint="Italian line"
              href={whatsappHref("italy")}
              external
              accent="border-emerald-500/25 bg-emerald-500/[0.08] hover:border-emerald-400/40"
              icon={<ChannelIcon name="whatsapp" />}
            />
            <QuickAction
              label="WhatsApp MA"
              hint="Morocco line"
              href={whatsappHref("morocco")}
              external
              accent="border-emerald-500/25 bg-emerald-500/[0.08] hover:border-emerald-400/40"
              icon={<ChannelIcon name="whatsapp" />}
            />
            <QuickAction
              label="Call Morocco"
              hint={c.phone.moroccoNational.display}
              href={`tel:${c.phone.moroccoNational.tel}`}
              accent="border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]"
              icon={<ChannelIcon name="phone" />}
            />
            <QuickAction
              label="Help center"
              hint="Bot & FAQs"
              href={c.helpCenterHref}
              accent="border-[#2D6BFF]/25 bg-[#2D6BFF]/[0.1] hover:border-[#2D6BFF]/40"
              icon={<ChannelIcon name="help" />}
            />
          </div>
        </section>

        <section className="space-y-3">
          <ContactSectionTitle>I need help with…</ContactSectionTitle>
          <div className="flex flex-wrap gap-2">
            {CONTACT_INTENTS.map((intent) => (
              <a
                key={intent.id}
                href={intentMailtoHref(intent)}
                className="inline-flex min-h-[40px] items-center rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 text-[13px] font-semibold text-white/85 transition-colors hover:border-[#2D6BFF]/35 hover:bg-white/[0.08]"
              >
                {intent.label}
              </a>
            ))}
          </div>
        </section>

        <ContactOrderLookup />

        <ContactCard className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[#8fa8e8]">
              <ChannelIcon name="map" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">Company</p>
              <p className="mt-1 text-[17px] font-semibold text-white">{c.companyName}</p>
              <p className="mt-1 text-[13px] text-white/55">
                {c.legalEntity} — <span className="text-white/75">{formatContactRegions()}</span>
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/40">{c.noWalkIn}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {regionCards.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3"
              >
                <span className="text-xl" aria-hidden>
                  {r.flag}
                </span>
                <p className="mt-1.5 text-[13px] font-semibold text-white/88">{r.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-white/40">{r.blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <ContactShareTools />
          </div>
          <button
            type="button"
            onClick={() => void copy("sheet", formatContactSheet())}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-[14px] font-semibold text-white/85 transition-colors hover:bg-white/[0.09]"
          >
            {copiedKey === "sheet" ? "Contact details copied" : "Copy all contact details"}
          </button>
        </ContactCard>

        <ContactChannelTabs channel={channel} onChannelChange={setChannel} />

        {channelVisible(channel, "email") ? (
        <section className="space-y-2.5">
          <ContactSectionTitle>Email</ContactSectionTitle>
          <ContactChannel
            icon="email"
            title="General & inquiries"
            value={c.emails.primary}
            href={`mailto:${c.emails.primary}`}
            copyKey="email-primary"
            copyValue={c.emails.primary}
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <ContactChannel
            icon="email"
            title="Customer support"
            value={c.emails.support}
            href={mailtoHref({ to: c.emails.support, subject: "Support request" })}
            copyKey="email-support"
            copyValue={c.emails.support}
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <ContactChannel
            icon="email"
            title="Orders"
            value={c.emails.orders}
            href={mailtoHref({
              to: c.emails.orders,
              subject: "Order question",
              body: "Order number:\n\n",
            })}
            copyKey="email-orders"
            copyValue={c.emails.orders}
            copiedKey={copiedKey}
            onCopy={copy}
          />
        </section>
        ) : null}

        {channelVisible(channel, "chat") ? (
        <ContactMessageBuilder />
        ) : null}

        {channelVisible(channel, "chat") ? (
        <section className="space-y-2.5">
          <ContactSectionTitle>WhatsApp</ContactSectionTitle>
          <ContactChannel
            icon="whatsapp"
            title={c.whatsapp.italy.label}
            subtitle="Opens chat with a pre-filled message"
            value={c.whatsapp.italy.display}
            href={whatsappHref("italy")}
            external
            copyKey="wa-it"
            copyValue={c.whatsapp.italy.display}
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <ContactChannel
            icon="whatsapp"
            title={c.whatsapp.morocco.label}
            subtitle="Opens chat with a pre-filled message"
            value={c.whatsapp.morocco.display}
            href={whatsappHref("morocco")}
            external
            copyKey="wa-ma"
            copyValue={c.whatsapp.morocco.display}
            copiedKey={copiedKey}
            onCopy={copy}
          />
        </section>
        ) : null}

        {channelVisible(channel, "phone") ? (
        <section className="space-y-2.5">
          <ContactSectionTitle>Phone</ContactSectionTitle>
          <ContactChannel
            icon="phone"
            title={c.phone.moroccoNational.label}
            subtitle={c.hours.note}
            value={c.phone.moroccoNational.display}
            href={`tel:${c.phone.moroccoNational.tel}`}
            copyKey="phone-ma"
            copyValue={c.phone.moroccoNational.display}
            copiedKey={copiedKey}
            onCopy={copy}
          />
        </section>
        ) : null}

        {channelVisible(channel, "self") ? (
        <section className="space-y-2.5">
          <ContactSectionTitle>Self-service</ContactSectionTitle>
          <ContactChannel
            icon="help"
            title="Help center"
            subtitle="Search topics — refunds, shipping, account, creators"
            value={c.helpCenterLabel}
            href={c.helpCenterHref}
          />
        </section>
        ) : null}

        <section className="space-y-3">
          <ContactSectionTitle>Shortcuts</ContactSectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {CONTACT_QUICK_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 transition-colors hover:border-[#2D6BFF]/25 hover:bg-white/[0.06]"
              >
                <p className="text-[13px] font-semibold text-white/88">{link.label}</p>
                <p className="mt-0.5 text-[11px] text-white/40">{link.hint}</p>
              </Link>
            ))}
          </div>
        </section>

        <ContactFaqSection />
      </main>
    </div>
  );
}
