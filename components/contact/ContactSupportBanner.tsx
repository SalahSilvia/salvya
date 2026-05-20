"use client";

import { useEffect, useState } from "react";
import {
  deskClocks,
  getSupportAvailability,
  supportStatusDetail,
  supportStatusLabel,
  type SupportAvailability,
} from "@/lib/contact/contact-support-status";

export function ContactSupportBanner() {
  const [status, setStatus] = useState<SupportAvailability>("unknown");
  const [clocks, setClocks] = useState<{ label: string; time: string }[]>([]);

  useEffect(() => {
    setStatus(getSupportAvailability());
    setClocks(deskClocks());
    const id = window.setInterval(() => {
      setStatus(getSupportAvailability());
      setClocks(deskClocks());
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const open = status === "open";

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        open
          ? "border-emerald-500/30 bg-emerald-500/[0.08]"
          : status === "closed"
            ? "border-amber-500/25 bg-amber-500/[0.06]"
            : "border-white/[0.08] bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`relative mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${
            open ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-amber-400/80"
          }`}
          aria-hidden
        >
          {open ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white/90">{supportStatusLabel(status)}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/45">{supportStatusDetail(status)}</p>
          {clocks.length ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {clocks.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/50"
                >
                  <span className="text-white/35">{c.label}</span>
                  {c.time}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
