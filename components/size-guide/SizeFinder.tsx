"use client";

import { useMemo, useState } from "react";
import { SIZE_CHART_ROWS, suggestSizeFromBodyChest } from "@/lib/size-chart";

const easeOptions = [
  { id: "standard", ratio: 1.06, label: "Balanced oversize", hint: "~6% ease — Salvya default drape" },
  { id: "roomy", ratio: 1.1, label: "Roomier", hint: "~10% ease — more stack and fold" },
  { id: "min", ratio: 1.02, label: "Closer fit", hint: "~2% ease — still relaxed, less fabric" },
] as const;

export function SizeFinder() {
  const [rawChest, setRawChest] = useState("");
  const [easeId, setEaseId] = useState<(typeof easeOptions)[number]["id"]>("standard");

  const easeRatio = easeOptions.find((o) => o.id === easeId)?.ratio ?? 1.06;

  const bodyCm = useMemo(() => {
    const n = parseFloat(rawChest.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [rawChest]);

  const suggestion = useMemo(() => {
    if (bodyCm === null) return null;
    return suggestSizeFromBodyChest(bodyCm, easeRatio);
  }, [bodyCm, easeRatio]);

  const rowHighlight = suggestion?.size ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-6">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">Find your size</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
        Enter your <strong className="font-semibold text-slate-900">body chest</strong> (fullest part, tape level).
        We match the smallest label where garment chest ≥ your chest × ease. This is guidance only—always compare
        to a flat garment if you can.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="body-chest-cm" className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Body chest (cm)
          </label>
          <input
            id="body-chest-cm"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 96"
            value={rawChest}
            onChange={(e) => setRawChest(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] font-medium text-slate-900 outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#2D6BFF]/45 focus:shadow-[0_0_0_3px_rgba(45,107,255,0.12)]"
          />
        </div>
        <fieldset>
          <legend className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ease</legend>
          <div className="mt-1.5 flex flex-col gap-2">
            {easeOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  easeId === opt.id
                    ? "border-[#2D6BFF]/40 bg-[#2D6BFF]/[0.06]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="ease"
                  value={opt.id}
                  checked={easeId === opt.id}
                  onChange={() => setEaseId(opt.id)}
                  className="mt-1 size-4 shrink-0 accent-[#2D6BFF]"
                />
                <span>
                  <span className="block text-[14px] font-semibold text-slate-900">{opt.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-600">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-white px-4 py-4 sm:px-5" aria-live="polite">
        {!rawChest.trim() ? (
          <p className="text-[14px] text-slate-600">Enter a chest measurement to see a suggested Salvya size.</p>
        ) : bodyCm === null ? (
          <p className="text-[14px] text-amber-800">Use a number in centimetres (decimals allowed).</p>
        ) : suggestion ? (
          <div>
            <p className="text-[15px] font-semibold text-slate-900">
              Suggested size: <span className="text-[#1d4ed8]">{suggestion.size}</span>
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{suggestion.note}</p>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
              Chart sizes:{" "}
              {SIZE_CHART_ROWS.map((r) => (
                <span
                  key={r.size}
                  className={`mr-1 inline-block rounded-full px-2 py-0.5 font-medium ${
                    r.size === rowHighlight ? "bg-[#2D6BFF]/15 text-[#1d4ed8]" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {r.size}
                </span>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
