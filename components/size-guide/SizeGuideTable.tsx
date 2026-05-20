"use client";

import { useCallback, useMemo, useState } from "react";
import { SIZE_CHART_ROWS, chartAsTsv, cmToInches, garmentFullChestCm } from "@/lib/size-chart";

type Unit = "cm" | "in";

function formatIn(cm: number) {
  return cmToInches(cm, 1);
}

export function SizeGuideTable() {
  const [unit, setUnit] = useState<Unit>("cm");
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const onCopy = useCallback(async () => {
    const text = chartAsTsv(unit);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("ok");
      window.setTimeout(() => setCopyState("idle"), 2400);
    } catch {
      setCopyState("err");
      window.setTimeout(() => setCopyState("idle"), 3200);
    }
  }, [unit]);

  const caption =
    unit === "cm"
      ? "Half chest (flat), body length, garment chest — centimetres"
      : "Half chest (flat), body length, garment chest — inches (rounded)";

  const rows = useMemo(
    () =>
      SIZE_CHART_ROWS.map((row) => ({
        size: row.size,
        half: unit === "cm" ? `${row.halfChestCm} cm` : `${formatIn(row.halfChestCm)} in`,
        length: unit === "cm" ? `${row.lengthCm} cm` : `${formatIn(row.lengthCm)} in`,
        full: unit === "cm" ? `${garmentFullChestCm(row)} cm` : `${formatIn(garmentFullChestCm(row))} in`,
      })),
    [unit],
  );

  const copyLabel =
    copyState === "ok" ? "Copied" : copyState === "err" ? "Copy blocked" : `Copy as tab-separated (${unit})`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-600">Display units</p>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Table units"
          >
            <button
              type="button"
              onClick={() => setUnit("cm")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                unit === "cm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit("in")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                unit === "in" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              inches
            </button>
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-3.5 text-[12px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            {copyLabel}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[340px] border-collapse text-left text-[14px]">
          <caption className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[12px] font-semibold text-slate-600">
            {caption}
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">
                Size
              </th>
              <th scope="col" className="px-4 py-3">
                Half chest (A)
              </th>
              <th scope="col" className="px-4 py-3">
                Length (B)
              </th>
              <th scope="col" className="px-4 py-3">
                Garment chest
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.size} className={i < rows.length - 1 ? "border-b border-slate-100" : ""}>
                <th scope="row" className="px-4 py-3 font-semibold text-slate-900">
                  {row.size}
                </th>
                <td className="px-4 py-3 tabular-nums text-slate-700">{row.half}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{row.length}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{row.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] leading-relaxed text-slate-500">
        Garment chest is the approximate circumference (2 × half chest). Use it when comparing to a tape measure
        around your body.
      </p>
    </div>
  );
}
