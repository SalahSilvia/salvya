"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { askSalvyaKnowledge, getSuggestedAiQuestions } from "@/lib/knowledge/assistant";

export function AskSalvyaAi({ className }: { className?: string }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<ReturnType<typeof askSalvyaKnowledge> | null>(null);

  const submit = useCallback(() => {
    const q = question.trim();
    if (!q) return;
    setResponse(askSalvyaKnowledge(q));
  }, [question]);

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] border border-indigo-200/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-6 text-white shadow-[0_32px_80px_-32px_rgba(30,58,138,0.55)] sm:p-8 ${className ?? ""}`}
      aria-labelledby="ask-salvya-ai"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300/80">Ask Salvya AI</p>
      <h2 id="ask-salvya-ai" className="mt-1 text-[1.35rem] font-bold tracking-tight">
        Knowledge assistant
      </h2>
      <p className="mt-2 text-[14px] text-indigo-100/80">
        Answers cite internal docs, FAQs, policies, and API surfaces — optimized for support intents.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. How do creators get paid?"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white placeholder:text-indigo-200/50 outline-none focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-400/30"
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-indigo-950 hover:bg-indigo-50"
        >
          Ask
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {getSuggestedAiQuestions().map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              setResponse(askSalvyaKnowledge(s));
            }}
            className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium ring-1 ring-white/15 hover:bg-white/15"
          >
            {s}
          </button>
        ))}
      </div>

      {response ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-4">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-indigo-50">{response.answer}</p>
          {response.citations.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/70">Citations</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {response.citations.map((c) => (
                  <li key={`${c.kind}-${c.id}`}>
                    <Link href={c.href} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold hover:bg-white/15">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
