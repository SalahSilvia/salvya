/** Flat garment diagram: half-chest (A) and body length (B). */
export function MeasurementDiagram() {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-6 sm:px-8">
      <figcaption className="mb-4 text-center text-[13px] font-semibold text-slate-800">
        Flat-lay reference — measure like this
      </figcaption>
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-labelledby="size-diagram-title size-diagram-desc">
          <title id="size-diagram-title">T-shirt flat measurement points</title>
          <desc id="size-diagram-desc">
            Shirt laid flat with line A for half chest below armholes and line B for length from shoulder to hem.
          </desc>
          <path
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinejoin="round"
            d="M96 52c10-14 32-20 64-20s54 6 64 20l36 22 28 10v100H68V84l28-10 36-22z"
          />
          <path fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 5" d="M120 68h80M120 152h80" />
          <line x1="72" y1="100" x2="248" y2="100" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="242,94 252,100 242,106" fill="#2563eb" />
          <polygon points="78,106 68,100 78,94" fill="#2563eb" />
          <text x="160" y="92" textAnchor="middle" className="fill-blue-800" style={{ font: "bold 12px system-ui, sans-serif" }}>
            A · half chest
          </text>
          <line x1="262" y1="48" x2="262" y2="172" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="256,54 262,44 268,54" fill="#0f766e" />
          <polygon points="268,166 262,176 256,166" fill="#0f766e" />
          <text x="278" y="112" className="fill-teal-900" style={{ font: "bold 12px system-ui, sans-serif" }}>
            B
          </text>
          <text x="278" y="128" className="fill-teal-800" style={{ font: "600 10px system-ui, sans-serif" }}>
            length
          </text>
          <text x="160" y="198" textAnchor="middle" className="fill-slate-500" style={{ font: "11px system-ui, sans-serif" }}>
            Lay flat · no stretch · A is 1 cm below the armhole
          </text>
        </svg>
      </div>
    </figure>
  );
}
