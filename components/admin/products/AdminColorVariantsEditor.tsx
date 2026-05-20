"use client";

import { useEffect, useState } from "react";
import { AdminImageDropzone } from "@/components/admin/products/AdminImageDropzone";
import { AdminModelImagesDropzone } from "@/components/admin/products/AdminModelImagesDropzone";
import { adminInputClass, adminMuted } from "@/components/admin/admin-theme";
import { colorOptionId } from "@/lib/admin/product-color-variants";
import type { ProductColorOption } from "@/lib/admin/product-metadata";

type Props = {
  value: ProductColorOption[];
  onChange: (colors: ProductColorOption[]) => void;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
};

const QUICK_COLORWAYS: ProductColorOption[] = [
  { id: "black", name: "Black", hex: "#1a1a1a" },
  { id: "white", name: "White", hex: "#f5f5f0" },
];

function emptyColor(name: string, hex?: string, id?: string): ProductColorOption {
  return { id, name, hex, front: undefined, back: undefined, models: [] };
}

export function AdminColorVariantsEditor({ value, onChange, onUpload, disabled }: Props) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#1a1a1a");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!value.length) {
      setOpenId(null);
      return;
    }
    if (openId && value.some((c, i) => colorOptionId(c, i) === openId)) return;
    setOpenId(colorOptionId(value[0]!, 0));
  }, [value, openId]);

  const add = (preset?: ProductColorOption) => {
    if (value.length >= 8) return;
    if (preset) {
      const id = preset.id ?? colorOptionId(preset, value.length);
      if (value.some((c, i) => colorOptionId(c, i) === id)) {
        setOpenId(id);
        return;
      }
      const next = [...value, { ...emptyColor(preset.name, preset.hex, id), id }];
      onChange(next);
      setOpenId(id);
      return;
    }
    const n = name.trim();
    if (!n) return;
    const color = emptyColor(n, /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex : undefined);
    const id = colorOptionId(color, value.length);
    onChange([...value, { ...color, id }]);
    setOpenId(id);
    setName("");
  };

  const updateAt = (index: number, patch: Partial<ProductColorOption>) => {
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const removeAt = (index: number) => {
    const id = colorOptionId(value[index]!, index);
    onChange(value.filter((_, i) => i !== index));
    if (openId === id) setOpenId(null);
  };

  const hasQuick = (id: string) => value.some((c, i) => colorOptionId(c, i) === id);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#c9cccf]/80 bg-[#f6f6f7] px-3 py-2.5">
        <p className="text-[13px] font-medium text-[#202223]">Per-color photos</p>
        <p className={`mt-0.5 text-[12px] leading-relaxed ${adminMuted}`}>
          Add <strong className="font-semibold text-[#202223]">Black</strong>,{" "}
          <strong className="font-semibold text-[#202223]">White</strong>, or any color — then open each row to
          upload <strong className="font-semibold text-[#202223]">Front</strong>,{" "}
          <strong className="font-semibold text-[#202223]">Back</strong>, and model shots.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_COLORWAYS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled || hasQuick(preset.id!)}
              onClick={() => add(preset)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e5e7] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#202223] hover:border-[#2D6BFF] hover:text-[#2D6BFF] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span
                className="size-3.5 rounded-full border border-[#c9cccf]"
                style={{ backgroundColor: preset.hex }}
                aria-hidden
              />
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      {value.map((color, index) => {
        const id = colorOptionId(color, index);
        const expanded = openId === id;
        const models = color.models ?? [];

        return (
          <div key={`${id}-${index}`} className="overflow-hidden rounded-xl border border-[#e3e5e7] bg-[#fafbfb]">
            <button
              type="button"
              onClick={() => setOpenId(expanded ? null : id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7]"
            >
              <span
                className="size-7 shrink-0 rounded-full border border-[#c9cccf]"
                style={{ backgroundColor: color.hex ?? "#e3e5e7" }}
                aria-hidden
              />
              <span className="flex shrink-0 gap-1">
                {color.front ? (
                  <span className="relative h-11 w-9 overflow-hidden rounded border border-[#e3e5e7] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={color.front} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/55 py-px text-center text-[8px] font-bold uppercase text-white">
                      F
                    </span>
                  </span>
                ) : (
                  <span className="flex h-11 w-9 items-center justify-center rounded border border-dashed border-[#c9cccf] bg-white text-[9px] font-semibold text-[#8c9196]">
                    Front
                  </span>
                )}
                {color.back ? (
                  <span className="relative h-11 w-9 overflow-hidden rounded border border-[#e3e5e7] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={color.back} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/55 py-px text-center text-[8px] font-bold uppercase text-white">
                      B
                    </span>
                  </span>
                ) : (
                  <span className="flex h-11 w-9 items-center justify-center rounded border border-dashed border-[#c9cccf] bg-white text-[9px] font-semibold text-[#8c9196]">
                    Back
                  </span>
                )}
                {models[0] ? (
                  <span className="relative h-11 w-9 overflow-hidden rounded border border-[#2D6BFF]/35 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={models[0]} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-[#2D6BFF]/85 py-px text-center text-[8px] font-bold uppercase text-white">
                      M{models.length > 1 ? `+${models.length - 1}` : ""}
                    </span>
                  </span>
                ) : (
                  <span className="flex h-11 w-9 items-center justify-center rounded border border-dashed border-[#c9cccf] bg-white text-[9px] font-semibold text-[#8c9196]">
                    Model
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-[#202223]">{color.name}</span>
                <span className={`text-[12px] ${adminMuted}`}>
                  {[color.front ? "Front ✓" : "Front —", color.back ? "Back ✓" : "Back —", models.length ? `${models.length} model` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="shrink-0 rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-semibold text-[#2D6BFF]">
                {expanded ? "Close" : "Edit photos"}
              </span>
            </button>

            {expanded ? (
              <div className="space-y-4 border-t border-[#e3e5e7] bg-white px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
                      Color name
                    </label>
                    <input
                      className={`min-h-[36px] ${adminInputClass} text-[13px]`}
                      value={color.name}
                      onChange={(e) => updateAt(index, { name: e.target.value })}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
                      Swatch
                    </label>
                    <input
                      type="color"
                      value={color.hex ?? "#e3e5e7"}
                      onChange={(e) => updateAt(index, { hex: e.target.value })}
                      className="h-10 w-full cursor-pointer rounded-lg border border-[#c9cccf] bg-white p-1"
                      disabled={disabled}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminImageDropzone
                    label="Front (flat lay)"
                    hint={`Main shop view — ${color.name}`}
                    value={color.front ?? null}
                    onChange={(url) => updateAt(index, { front: url ?? undefined })}
                    onUpload={onUpload}
                    disabled={disabled}
                  />
                  <AdminImageDropzone
                    label="Back"
                    hint={`Back print — ${color.name}`}
                    value={color.back ?? null}
                    onChange={(url) => updateAt(index, { back: url ?? undefined })}
                    onUpload={onUpload}
                    disabled={disabled}
                  />
                </div>

                <div className="rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-4">
                  <AdminModelImagesDropzone
                    values={models}
                    onChange={(urls) => updateAt(index, { models: urls })}
                    onUpload={onUpload}
                    disabled={disabled}
                    colorName={color.name}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="text-[13px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove colorway
                </button>
              </div>
            ) : null}
          </div>
        );
      })}

      {value.length < 8 ? (
        <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
          <input
            className={`min-h-[36px] ${adminInputClass} text-[13px]`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Other color (e.g. Navy, Bone)"
            disabled={disabled}
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
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => add()}
            disabled={disabled}
            className="rounded-lg border border-[#c9cccf] px-3 text-[13px] font-semibold hover:bg-[#f6f6f7] disabled:opacity-50"
          >
            Add color
          </button>
        </div>
      ) : null}
    </div>
  );
}
