"use client";

export function DocsCodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-950 shadow-sm">
      {lang ? (
        <span className="absolute right-3 top-3 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          {lang}
        </span>
      ) : null}
      <button
        type="button"
        className="absolute left-3 top-3 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
        onClick={() => void navigator.clipboard.writeText(code)}
        aria-label="Copy code"
      >
        Copy
      </button>
      <pre className="overflow-x-auto p-4 pt-10 font-mono text-[12px] leading-relaxed text-emerald-300/95">
        <code>{code}</code>
      </pre>
    </div>
  );
}
