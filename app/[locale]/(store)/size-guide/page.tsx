import Link from "next/link";
import { MeasurementDiagram } from "@/components/size-guide/MeasurementDiagram";
import { SizeFinder } from "@/components/size-guide/SizeFinder";
import { SizeGuideTable } from "@/components/size-guide/SizeGuideTable";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-32 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const ul = "mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-slate-700";
const strong = "font-semibold text-slate-900";

const jump = [
  { href: "#fit", label: "Fit" },
  { href: "#measure", label: "Measure" },
  { href: "#finder", label: "Finder" },
  { href: "#chart", label: "Chart" },
  { href: "#hoodies", label: "Hoodies & tees" },
  { href: "#care", label: "Care" },
  { href: "#policy", label: "Orders" },
] as const;

export default function SizeGuidePage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <Link href="/" className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-slate-900">
            ← Home
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold sm:gap-x-4">
            <Link href="/shipping" className="text-slate-500 transition-colors hover:text-slate-800">
              Shipping
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/returns" className="text-slate-500 transition-colors hover:text-slate-800">
              Returns
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="hidden text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:inline">
              Sizing
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">Size guide</h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Updated:</strong> 12 May 2026 · Oversize hoodies &amp; tees
        </p>

        <nav
          aria-label="On this page"
          className="sticky top-14 z-10 -mx-1 mt-8 border-y border-slate-200/90 bg-white/95 py-2.5 backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent,black_0.75rem,black_calc(100%-0.75rem),transparent)]"
        >
          <ul className="flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {jump.map((item) => (
              <li key={item.href} className="snap-start shrink-0">
                <a
                  href={item.href}
                  className="inline-flex min-h-9 items-center rounded-full border border-transparent bg-slate-50 px-3.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className={`${p} mt-8 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          Salvya drops use an <strong className={strong}>oversize, street-led block</strong>: relaxed body, dropped
          shoulder, and extra length compared to slim retail fits. Garments are{" "}
          <Link
            href="/returns#no-returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            produced on demand
          </Link>
          — double-check your size before checkout. This page is a <strong className={strong}>general reference</strong>
          ; a specific product may note small differences when the manufacturer updates blanks.
        </p>

        <h2 id="fit" className={h2}>
          1. How Salvya pieces fit
        </h2>
        <p className={p}>
          Expect a <strong className={strong}>roomy chest</strong> and <strong className={strong}>longer sleeves and
          body</strong> than a standard fashion tee. If you usually wear a medium in slim fits, you may still prefer M
          here for the intended silhouette—or size down one step if you want a closer (but still relaxed) look.
        </p>
        <ul className={ul}>
          <li>
            <strong className={strong}>Between two sizes?</strong> Compare your measurements to the chart below; when
            in doubt, keep the larger size for the authentic oversize drape.
          </li>
          <li>
            <strong className={strong}>Layering:</strong> hoodies are sized to allow a light layer underneath; tees are
            single-layer friendly.
          </li>
          <li>
            <strong className={strong}>Long torso or short arms?</strong> Prioritise chest first for tees; for hoodies,
            if length is borderline, compare the <strong className={strong}>body length (B)</strong> column to a hoodie
            you already wear.
          </li>
        </ul>

        <h2 id="measure" className={h2}>
          2. How to measure
        </h2>
        <p className={p}>
          Lay a similar garment you already love <strong className={strong}>flat on a table</strong>, button/zip
          closed, and smooth out wrinkles—do not stretch the fabric.
        </p>
        <ul className={ul}>
          <li>
            <strong className={strong}>Half chest (A):</strong> measure straight across the garment,{" "}
            <strong className={strong}>1 cm below the armhole</strong>, from side seam to side seam. This number is
            “half chest” (half of the total chest circumference).
          </li>
          <li>
            <strong className={strong}>Body length (B):</strong> measure from the highest point of the shoulder (where
            shoulder meets collar) straight down to the hem.
          </li>
        </ul>
        <MeasurementDiagram />
        <p className={p}>
          To measure <strong className={strong}>your body</strong> instead, wrap a soft tape around the fullest part of
          your chest, keeping the tape level. Compare that circumference to roughly{" "}
          <strong className={strong}>2 × half chest</strong> from the chart, remembering you need ease for movement and
          the oversize cut.
        </p>

        <h2 id="finder" className={h2}>
          3. Find your size (body chest)
        </h2>
        <p className={p}>
          Use the tool below for a quick label suggestion from your body measurement. It does not replace measuring a
          flat garment when you need precision.
        </p>
        <SizeFinder />

        <h2 id="chart" className={h2}>
          4. Reference chart (unisex)
        </h2>
        <p className={p}>
          Approximate <strong className={strong}>garment</strong> dimensions after production; slight variance (±1–2
          cm) is normal between batches. Toggle <strong className={strong}>cm or inches</strong> and copy the table for
          notes or messages to support.
        </p>
        <SizeGuideTable />

        <h2 id="hoodies" className={h2}>
          5. Hoodies vs tees
        </h2>
        <p className={p}>
          <strong className={strong}>Hoodies</strong> use a heavier blank: the same labelled size can feel more
          structured in the shoulders because of fleece weight. <strong className={strong}>Tees</strong> drape more
          softly; length and half chest follow the same grade rule as the chart unless the product page calls out a
          special cut.
        </p>

        <h2 id="care" className={h2}>
          6. Wash &amp; shrinkage
        </h2>
        <p className={p}>
          Follow the care label inside the garment. Cotton-rich fabrics may shrink slightly on a hot wash or tumble
          dry. For longest life: cold wash, mild detergent, reshape while damp, air dry or low heat. If you are between
          sizes, remember shrinkage can steal about <strong className={strong}>1–2 cm</strong> of length after the first
          hot cycles—plan ahead.
        </p>

        <h2 id="policy" className={h2}>
          7. Orders &amp; exchanges
        </h2>
        <p className={p}>
          Wrong-size regrets are not covered as a return reason because pieces are made for you—see our{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>
          . If you are unsure, measure twice or ask us on official support channels before the{" "}
          <Link
            href="/returns#cancellation"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            twelve-hour cancellation window
          </Link>{" "}
          closes.
        </p>

        <div className="mt-14 flex flex-col gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">
            <Link
              href="/terms"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Terms of Service
            </Link>
            <Link
              href="/shipping"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Shipping &amp; delivery
            </Link>
            <Link
              href="/returns"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Returns &amp; refunds
            </Link>
            <Link
              href="/about"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              About Salvya
            </Link>
            <Link
              href="/cookies"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Cookie policy
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Return to Salvya home
          </Link>
        </div>
      </article>
    </div>
  );
}
