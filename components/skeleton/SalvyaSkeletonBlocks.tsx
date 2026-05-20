import { cx, SkFieldDark, SkFieldLight, SkKicker, SkKickerLight, SkLineDark, SkLineLight } from "./SalvyaSkeletonPrimitives";

type Tone = "dark" | "light";

function useTone(tone: Tone) {
  return tone === "dark"
    ? { Field: SkFieldDark, Line: SkLineDark, Kicker: SkKicker }
    : { Field: SkFieldLight, Line: SkLineLight, Kicker: SkKickerLight };
}

export function SkProductCard({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const { Field, Line, Kicker } = useTone(tone);
  return (
    <div className={cx("flex flex-col gap-2.5", className)}>
      <Field className="aspect-[4/5] w-full rounded-2xl" />
      <Kicker className="w-16" />
      <Line className="h-3.5 w-[78%]" />
      <Line className="h-3 w-[42%] opacity-80" />
    </div>
  );
}

export function SkBlogCard({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const { Field, Line, Kicker } = useTone(tone);
  return (
    <article className={cx("flex flex-col gap-3", className)}>
      <Field className="aspect-[16/10] w-full rounded-2xl" />
      <Kicker className="w-20" />
      <Line className="h-4 w-[92%]" />
      <Line className="h-3 w-full opacity-70" />
      <Line className="h-3 w-[65%] opacity-60" />
    </article>
  );
}

/** Valid skeleton rows for use inside `<tbody>` — only `<tr>` / `<td>`. */
export function SkTableBodyRows({
  rows = 5,
  cols = 4,
  colSpan,
}: {
  rows?: number;
  cols?: number;
  /** When set, each row is one cell spanning all columns. */
  colSpan?: number;
}) {
  const span = colSpan ?? cols;
  const singleCell = colSpan != null || cols <= 1;

  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-[#f1f2f3] last:border-0">
          {singleCell ? (
            <td colSpan={span} className="px-4 py-4">
              <div className="h-10 w-full rounded-lg bg-[#e3e5e7]/55 salvya-sk-sheen-light salvya-sk-breathe-light" />
            </td>
          ) : (
            Array.from({ length: cols }).map((_, c) => (
              <td key={c} className="px-4 py-3">
                <div
                  className="h-3 w-full rounded-md bg-[#e3e5e7]/55 salvya-sk-sheen-light salvya-sk-breathe-light"
                  style={{ maxWidth: c === 0 ? "85%" : undefined }}
                />
              </td>
            ))
          )}
        </tr>
      ))}
    </>
  );
}

export function SkTableRows({
  rows = 6,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cx("overflow-hidden rounded-xl border border-[#e3e5e7] bg-white", className)}>
      <div className="flex gap-3 border-b border-[#e3e5e7] bg-[#fafbfb] px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 flex-1 rounded-full bg-[#e3e5e7]/80 salvya-sk-sheen-light salvya-sk-breathe-light"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 border-b border-[#f1f2f3] px-4 py-4 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 flex-1 rounded-md bg-[#e3e5e7]/55 salvya-sk-sheen-light salvya-sk-breathe-light"
              style={{ maxWidth: c === 0 ? "40%" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkChartPanel({ className }: { className?: string }) {
  return (
    <div className={cx("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#e3e5e7] bg-white p-4 salvya-sk-sheen-light salvya-sk-breathe-light"
        >
          <div className="h-2 w-16 rounded-full bg-[#e3e5e7]/80" />
          <div className="mt-3 h-7 w-24 rounded-lg bg-[#e3e5e7]/60" />
        </div>
      ))}
      <div className="col-span-full min-h-[220px] rounded-xl border border-[#e3e5e7] bg-white p-4 sm:min-h-[260px]">
        <div className="h-2.5 w-28 rounded-full bg-[#e3e5e7]/80 salvya-sk-sheen-light salvya-sk-breathe-light" />
        <div className="mt-6 flex h-[calc(100%-2rem)] items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-[#e3e5e7]/50 salvya-sk-sheen-light salvya-sk-breathe-light"
              style={{ height: `${35 + ((i * 17) % 55)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkSettingsRows({
  count = 5,
  tone = "dark",
  className,
}: {
  count?: number;
  tone?: Tone;
  className?: string;
}) {
  const { Field, Line } = useTone(tone);
  return (
    <div className={cx("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Field key={i} className="flex min-h-[52px] items-center gap-3 rounded-2xl px-4 py-3">
          <div className="size-9 shrink-0 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.05]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Line className="h-3 w-[45%]" />
            <Line className="h-2.5 w-[70%] opacity-60" />
          </div>
        </Field>
      ))}
    </div>
  );
}

export function SkInboxRows({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cx("divide-y divide-white/[0.06]", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5">
          <SkFieldDark className="size-11 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <SkLineDark className="h-3 w-[35%]" />
            <SkLineDark className="h-3 w-[88%]" />
            <SkLineDark className="h-2.5 w-[55%] opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}
