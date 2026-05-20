"use client";

import type { PublishCheck } from "@/lib/blog/editor-helpers";

type Props = {
  checks: PublishCheck[];
  ready: boolean;
};

export function AdminBlogPublishChecklist({ checks, ready }: Props) {
  return (
    <div className="rounded-xl border border-[#e3e5e7] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#202223]">Ready to publish</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            ready ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          }`}
        >
          {ready ? "Yes" : "Not yet"}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[12px]">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                c.ok ? "bg-emerald-100 text-emerald-800" : "bg-[#f6f6f7] text-[#8c9196]"
              }`}
              aria-hidden
            >
              {c.ok ? "✓" : "·"}
            </span>
            <span className={c.ok ? "text-[#454749]" : "text-[#202223]"}>
              <span className="font-medium">{c.label}</span>
              {!c.ok && c.hint ? <span className="block text-[#8c9196]">{c.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
