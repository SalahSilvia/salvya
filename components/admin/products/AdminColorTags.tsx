"use client";

import { useState } from "react";
import { adminInputClass, adminMuted } from "@/components/admin/admin-theme";
import type { ProductColorOption } from "@/lib/admin/product-metadata";

type Props = {
  value: ProductColorOption[];
  onChange: (colors: ProductColorOption[]) => void;
};

export function AdminColorTags({ value, onChange }: Props) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#1a1a1a");

  const add = () => {
    const n = name.trim();
    if (!n || value.length >= 8) return;
    onChange([...value, { name: n, hex: /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex : undefined }]);
    setName("");
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((c, i) => (
          <span
            key={`${c.name}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#e3e5e7] bg-[#f6f6f7] py-1 pl-1.5 pr-2 text-[12px] font-medium text-[#202223]"
          >
            <span
              className="size-5 shrink-0 rounded-full border border-[#c9cccf]"
              style={{ backgroundColor: c.hex ?? "#e3e5e7" }}
              aria-hidden
            />
            {c.name}
            <button type="button" onClick={() => remove(i)} className="ml-0.5 text-[#8c9196] hover:text-rose-600" aria-label={`Remove ${c.name}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      {value.length < 8 ? (
        <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
          <input
            className={`min-h-[36px] ${adminInputClass} text-[13px]`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Color name (e.g. Night black)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-[#c9cccf] bg-white p-1"
            title="Swatch color"
          />
          <button type="button" onClick={add} className="rounded-lg border border-[#c9cccf] px-3 text-[13px] font-semibold hover:bg-[#f6f6f7]">
            Add
          </button>
        </div>
      ) : null}
      <p className={`text-[12px] ${adminMuted}`}>Optional — up to 8 colorways</p>
    </div>
  );
}
