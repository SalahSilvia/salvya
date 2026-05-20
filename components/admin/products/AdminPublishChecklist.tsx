"use client";

import { adminPanelClass, adminMuted } from "@/components/admin/admin-theme";

type Item = { id: string; label: string; ok: boolean; hint?: string };

type Props = {
  items: Item[];
  readyToPublish: boolean;
};

export function AdminPublishChecklist({ items, readyToPublish }: Props) {
  const done = items.filter((i) => i.ok).length;

  return (
    <section className={adminPanelClass}>
      <div className="border-b border-[#e3e5e7] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d7175]">Publish checklist</p>
        <p className={`mt-0.5 text-[12px] ${adminMuted}`}>
          {done}/{items.length} complete
        </p>
      </div>
      <ul className="space-y-2 p-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2.5 text-[13px]">
            <span
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                item.ok ? "bg-emerald-100 text-emerald-800" : "bg-[#f6f6f7] text-[#8c9196]"
              }`}
              aria-hidden
            >
              {item.ok ? "✓" : ""}
            </span>
            <span>
              <span className={item.ok ? "text-[#202223]" : "text-[#6d7175]"}>{item.label}</span>
              {item.hint && !item.ok ? <span className={`block text-[11px] ${adminMuted}`}>{item.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <div
        className={`mx-4 mb-4 rounded-lg px-3 py-2 text-[12px] font-medium ${
          readyToPublish ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
        }`}
      >
        {readyToPublish ? "Ready to publish" : "Complete required items before publishing"}
      </div>
    </section>
  );
}
