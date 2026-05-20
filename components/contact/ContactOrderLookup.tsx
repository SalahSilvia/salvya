"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactCard, ContactSectionTitle } from "@/components/contact/contact-ui";
import { buildOrderHelpLinks } from "@/lib/contact/contact-page-data";

export function ContactOrderLookup() {
  const [orderNumber, setOrderNumber] = useState("");

  const trimmed = orderNumber.trim();
  const links = trimmed ? buildOrderHelpLinks(trimmed) : null;

  return (
    <ContactCard className="p-4">
      <ContactSectionTitle>Have an order number?</ContactSectionTitle>
      <p className="mt-2 text-[13px] leading-relaxed text-white/45">
        Paste your reference (e.g. SV-…) for quick links to tracking, orders, or email support.
      </p>
      <label className="mt-3 block">
        <span className="sr-only">Order number</span>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="SV-12345 or order reference"
          className="w-full rounded-xl border border-white/[0.12] bg-black/30 px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none ring-[#2D6BFF]/0 transition-shadow focus:border-[#2D6BFF]/40 focus:ring-2 focus:ring-[#2D6BFF]/25"
          autoComplete="off"
        />
      </label>
      {links ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link
            href={links.track}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[13px] font-semibold text-white/85 hover:bg-white/[0.08]"
          >
            Track
          </Link>
          <Link
            href={links.orders}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-[13px] font-semibold text-white/85 hover:bg-white/[0.08]"
          >
            My orders
          </Link>
          <a
            href={links.email}
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-[#2D6BFF]/20 text-[13px] font-semibold text-[#b8c9ff] ring-1 ring-[#2D6BFF]/30 hover:bg-[#2D6BFF]/28"
          >
            Email us
          </a>
        </div>
      ) : null}
    </ContactCard>
  );
}
