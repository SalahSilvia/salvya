"use client";

import { useEffect, useMemo, useState } from "react";
import { adminPanelClass } from "@/components/admin/admin-theme";

type Slide = { id: string; label: string; url: string };

type Props = {
  front: string | null;
  back: string | null;
  models: string[];
  title: string;
  subtitle: string;
  badge: string;
  priceLabel: string;
  compareLabel: string | null;
  sizes: string[];
  colors: { name: string; hex?: string }[];
};

export function AdminProductPreviewGallery({
  front,
  back,
  models,
  title,
  subtitle,
  badge,
  priceLabel,
  compareLabel,
  sizes,
  colors,
}: Props) {
  const slides = useMemo(() => {
    const out: Slide[] = [];
    if (front) out.push({ id: "front", label: "Front", url: front });
    if (back) out.push({ id: "back", label: "Back", url: back });
    models.forEach((url, i) => out.push({ id: `model-${i}`, label: `Model ${i + 1}`, url }));
    return out;
  }, [back, front, models]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  const safe = slides[Math.min(active, Math.max(0, slides.length - 1))];

  return (
    <section className={adminPanelClass}>
      <div className="border-b border-[#e3e5e7] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d7175]">Storefront preview</p>
      </div>
      <div className="p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[#e3e5e7] bg-[#0b0b10]">
          {safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safe.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-white/40">No image</div>
          )}
          {badge.trim() ? (
            <span className="absolute left-2 top-2 rounded-full bg-[#2D6BFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {badge.trim()}
            </span>
          ) : null}
          {safe ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90">
              {safe.label}
            </span>
          ) : null}
        </div>

        {slides.length > 1 ? (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-14 w-11 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  i === active ? "border-[#2D6BFF]" : "border-[#e3e5e7] opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        {subtitle.trim() ? (
          <p className="mt-3 text-[12px] font-medium uppercase tracking-wide text-[#6d7175]">{subtitle.trim()}</p>
        ) : null}
        <p className="mt-1 line-clamp-2 text-[15px] font-semibold text-[#202223]">{title.trim() || "Product title"}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <p className="text-[13px] font-semibold text-[#2D6BFF]">{priceLabel}</p>
          {compareLabel ? <p className="text-[12px] text-[#8c9196] line-through">{compareLabel}</p> : null}
        </div>

        {sizes.length ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {sizes.map((s) => (
              <span key={s} className="rounded border border-[#e3e5e7] px-2 py-0.5 text-[11px] font-semibold text-[#202223]">
                {s}
              </span>
            ))}
          </div>
        ) : null}

        {colors.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 text-[11px] text-[#6d7175]">
                <span className="size-3.5 rounded-full border border-[#c9cccf]" style={{ backgroundColor: c.hex ?? "#e3e5e7" }} />
                {c.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
