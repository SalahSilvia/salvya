"use client";

import { useCallback, useState } from "react";
import {
  CONTACT_CHANNEL_TABS,
  type ContactChannelFilter,
} from "@/lib/contact/contact-page-data";
import {
  formatContactSheet,
  formatVCard,
  SALVYA_CONTACT,
  vCardDownloadFilename,
} from "@/lib/contact/salvya-contact";

type Props = {
  channel: ContactChannelFilter;
  onChannelChange: (c: ContactChannelFilter) => void;
};

export function ContactChannelTabs({ channel, onChannelChange }: Props) {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-[1.1rem] border border-white/[0.08] bg-white/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {CONTACT_CHANNEL_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={channel === tab.id}
          onClick={() => onChannelChange(tab.id)}
          className={`shrink-0 rounded-[0.85rem] px-3.5 py-2 text-[12px] font-semibold transition-colors ${
            channel === tab.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-white/45 hover:text-white/70"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ContactShareTools() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const flash = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 2200);
  }, []);

  const copy = useCallback(
    async (key: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        flash(key);
      } catch {
        /* denied */
      }
    },
    [flash],
  );

  const downloadVcard = useCallback(() => {
    const blob = new Blob([formatVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = vCardDownloadFilename();
    a.click();
    URL.revokeObjectURL(url);
    flash("vcard");
  }, [flash]);

  const share = useCallback(async () => {
    const text = formatContactSheet();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Salvya contact",
          text,
          url: SALVYA_CONTACT.website,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copy("share", text);
  }, [copy]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/[0.1]"
      >
        {copiedKey === "share" ? "Copied" : "Share contact"}
      </button>
      <button
        type="button"
        onClick={downloadVcard}
        className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/[0.1]"
      >
        {copiedKey === "vcard" ? "Saved" : "Save contact (.vcf)"}
      </button>
    </div>
  );
}

export function channelVisible(filter: ContactChannelFilter, section: ContactChannelFilter): boolean {
  if (filter === "all") return true;
  return filter === section;
}
