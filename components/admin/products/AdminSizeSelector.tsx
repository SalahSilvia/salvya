"use client";

import { useState } from "react";
import { adminInputClass, adminMuted } from "@/components/admin/admin-theme";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"] as const;

type Props = {
  value: string[];
  onChange: (sizes: string[]) => void;
};

export function AdminSizeSelector({ value, onChange }: Props) {
  const [custom, setCustom] = useState("");

  const toggle = (size: string) => {
    const u = size.toUpperCase();
    if (value.includes(u)) onChange(value.filter((s) => s !== u));
    else onChange([...value, u].slice(0, 12));
  };

  const addCustom = () => {
    const u = custom.trim().toUpperCase();
    if (!u || value.includes(u)) return;
    onChange([...value, u].slice(0, 12));
    setCustom("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_SIZES.map((size) => {
          const on = value.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggle(size)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                on
                  ? "border-[#2D6BFF] bg-[#eef4ff] text-[#2D6BFF]"
                  : "border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf]"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          className={`min-h-[36px] flex-1 ${adminInputClass} text-[13px]`}
          value={custom}
          onChange={(e) => setCustom(e.target.value.toUpperCase())}
          placeholder="Custom size"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" onClick={addCustom} className="rounded-lg border border-[#c9cccf] px-3 text-[13px] font-semibold text-[#202223] hover:bg-[#f6f6f7]">
          Add
        </button>
      </div>
      {value.length ? (
        <p className={`text-[12px] ${adminMuted}`}>
          Selected: {value.join(" · ")}
        </p>
      ) : (
        <p className={`text-[12px] ${adminMuted}`}>No sizes — customers won&apos;t pick a size at checkout</p>
      )}
    </div>
  );
}
