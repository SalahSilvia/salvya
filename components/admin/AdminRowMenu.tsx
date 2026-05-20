"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export type AdminRowMenuItem =
  | { kind: "link"; label: string; href: string; external?: boolean }
  | { kind: "action"; label: string; onClick: () => void; danger?: boolean; disabled?: boolean };

type Props = {
  items: AdminRowMenuItem[];
  disabled?: boolean;
  align?: "left" | "right";
};

export function AdminRowMenu({ items, disabled, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const panelAlign = align === "right" ? "right-0" : "left-0";

  return (
    <div ref={rootRef} className={`relative flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#e3e5e7] bg-white text-[#6d7175] transition-colors hover:bg-[#f6f6f7] hover:text-[#202223] disabled:opacity-45"
      >
        <span className="sr-only">Actions</span>
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="8" cy="3" r="1.25" />
          <circle cx="8" cy="8" r="1.25" />
          <circle cx="8" cy="13" r="1.25" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${panelAlign} top-[calc(100%+4px)] z-50 min-w-[9.5rem] rounded-xl border border-[#e3e5e7] bg-white p-1 shadow-lg`}
        >
          {items.map((item) => {
            if (item.kind === "link") {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f7]"
                >
                  {item.label}
                </Link>
              );
            }

            const tone = item.danger
              ? "text-rose-800 hover:bg-rose-50"
              : "text-[#202223] hover:bg-[#f6f6f7]";

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onClick();
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium disabled:opacity-45 ${tone}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
