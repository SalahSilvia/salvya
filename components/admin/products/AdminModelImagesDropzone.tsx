"use client";

import { useCallback, useId, useState } from "react";
import { adminMuted } from "@/components/admin/admin-theme";
import { MAX_MODEL_IMAGES } from "@/lib/admin/product-images";

type Props = {
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  /** When set, labels this block as tied to a colorway (e.g. "Black"). */
  colorName?: string;
};

export function AdminModelImagesDropzone({ values, onChange, onUpload, disabled, colorName }: Props) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const atMax = values.length >= MAX_MODEL_IMAGES;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled || atMax) return;
      const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;

      setErr(null);
      setUploading(true);
      const next = [...values];
      try {
        for (const file of images) {
          if (next.length >= MAX_MODEL_IMAGES) break;
          const url = await onUpload(file);
          next.push(url);
        }
        onChange(next);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [atMax, disabled, onChange, onUpload, values],
  );

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= values.length) return;
    const copy = [...values];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-semibold text-[#202223]">
          {colorName ? `Model photos — ${colorName}` : "On-model photos"}
        </p>
        <p className={`mt-0.5 text-[12px] ${adminMuted}`}>
          {colorName
            ? `Worn / lifestyle shots for ${colorName} only · up to ${MAX_MODEL_IMAGES} images`
            : `Drag multiple shots · up to ${MAX_MODEL_IMAGES} images`}
        </p>
      </div>

      {values.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {values.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[#e3e5e7] bg-[#f6f6f7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex-1 rounded-md bg-black/55 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={i === values.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex-1 rounded-md bg-black/55 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading && !atMax) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && !uploading && !atMax) void handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          atMax
            ? "cursor-not-allowed border-[#e3e5e7] bg-[#f6f6f7] opacity-60"
            : dragging
              ? "border-[#2D6BFF] bg-[#eef4ff]/60"
              : "border-[#c9cccf] bg-[#fafbfb]"
        }`}
      >
        <label
          htmlFor={inputId}
          className={`block ${atMax || disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <svg className="mx-auto mb-2 size-8 text-[#8c9196]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-[13px] font-semibold text-[#202223]">
            {uploading ? "Uploading…" : atMax ? "Maximum model photos reached" : "Drop model shots or click to add"}
          </span>
          <span className={`mt-1 block text-[11px] ${adminMuted}`}>
            {values.length}/{MAX_MODEL_IMAGES} added
          </span>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={disabled || uploading || atMax}
          onChange={(e) => {
            const f = e.target.files;
            if (f?.length) void handleFiles(f);
            e.target.value = "";
          }}
        />
      </div>

      {err ? <p className="text-[12px] text-rose-700">{err}</p> : null}
    </div>
  );
}
