"use client";

import { useEffect, useId, useRef } from "react";
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/admin-theme";

export type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "inline-flex min-h-[40px] items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-50"
      : adminBtnPrimary;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[#202223]/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => !busy && onCancel()}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="relative w-full max-w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-[#e3e5e7] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]"
      >
        <div className={`h-1 w-full ${tone === "danger" ? "bg-rose-500" : "bg-[#2D6BFF]"}`} aria-hidden />
        <div className="p-5">
          <div className="flex items-start gap-3">
            {tone === "danger" ? (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-[15px] font-semibold tracking-tight text-[#202223]">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="mt-1.5 text-[13px] leading-relaxed text-[#6d7175]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={adminBtnSecondary} disabled={busy} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className={confirmClass} disabled={busy} onClick={onConfirm}>
              {busy ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
