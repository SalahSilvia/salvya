"use client";

import { useCallback, useId, useState } from "react";
import { adminMuted } from "@/components/admin/admin-theme";

type Props = {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  aspect?: "square" | "portrait" | "banner";
};

export function AdminImageDropzone({
  label,
  hint,
  value,
  onChange,
  onUpload,
  disabled,
  aspect = "portrait",
}: Props) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const aspectClass =
    aspect === "square" ? "aspect-square" : aspect === "banner" ? "aspect-[2.2/1]" : "aspect-[4/5]";

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file || disabled) return;
      setErr(null);
      setUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [disabled, onChange, onUpload],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-[13px] font-semibold text-[#202223]">{label}</p>
        {hint ? <p className={`mt-0.5 text-[12px] ${adminMuted}`}>{hint}</p> : null}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${aspectClass} ${
          dragging ? "border-[#2D6BFF] bg-[#eef4ff]/60" : "border-[#c9cccf] bg-[#fafbfb]"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/55 to-transparent p-2 pt-8">
              <label
                htmlFor={inputId}
                className="flex-1 cursor-pointer rounded-lg bg-white/95 px-2 py-1.5 text-center text-[11px] font-semibold text-[#202223] hover:bg-white"
              >
                Replace
              </label>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-white"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className={`flex h-full cursor-pointer flex-col items-center justify-center px-4 text-center ${disabled ? "cursor-not-allowed" : ""}`}
          >
            <svg className="mb-2 size-8 text-[#8c9196]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-[13px] font-semibold text-[#202223]">
              {uploading ? "Uploading…" : "Drop image or click"}
            </span>
            <span className={`mt-1 text-[11px] ${adminMuted}`}>JPEG, PNG, WebP · max 8 MB</span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={disabled || uploading}
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
