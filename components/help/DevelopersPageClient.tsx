"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HELP_DEV_ENDPOINTS } from "@/lib/help-center";

const SDKS = [
  { name: "JavaScript SDK", description: "Fetch helpers for storefront and session APIs.", status: "Preview" },
  { name: "React SDK", description: "Hooks for auth state, cart sync, and creator metrics.", status: "Preview" },
];

const EXAMPLES = [
  {
    title: "Create order",
    code: `POST /api/orders
Content-Type: application/json

{
  "lines": [{ "productId": "...", "qty": 1 }],
  "shippingAddress": { ... }
}`,
  },
  {
    title: "Track shipment",
    code: `GET /track-order
?order=SVY-12345&email=fan@example.com`,
  },
  {
    title: "Creator analytics",
    code: `GET /api/creator/analytics
Cookie: sb-access-token=...`,
  },
];

export function DevelopersPageClient() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-dvh bg-[#fafbfd] text-neutral-950 antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(100%_80%_at_50%_-20%,rgba(59,130,246,0.08),transparent_55%)]" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
            <Link href="/help-center" className="font-semibold text-neutral-500 hover:text-neutral-900">
              Help Center
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Developers</span>
          </nav>
          <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">API</span>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-[max(1rem,env(safe-area-inset-left))] pb-24 pr-[max(1rem,env(safe-area-inset-right))] pt-10 sm:pt-14">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Developer portal</p>
          <h1 className="mt-2 text-[clamp(2rem,4.5vw,2.75rem)] font-bold tracking-[-0.04em]">Salvya APIs & integrations</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            REST endpoints for orders, catalog, creator workspace, authentication, and webhooks. Session cookies or bearer tokens where noted.
          </p>
        </motion.div>

        <section id="api" className="mt-12 scroll-mt-28" aria-labelledby="api-heading">
          <h2 id="api-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
            APIs
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm">
            <ul className="divide-y divide-neutral-100">
              {HELP_DEV_ENDPOINTS.map((ep) => (
                <li key={ep.id} id={ep.id.includes("orders") ? "orders-api" : ep.id.includes("products") ? "products-api" : ep.id.includes("creator") ? "creators-api" : ep.id.includes("webhook") ? "webhooks" : ep.id.includes("auth") ? "auth" : undefined} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">{ep.method}</span>
                    <code className="font-mono text-[13px] text-neutral-900">{ep.path}</code>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">{ep.auth}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-neutral-500">{ep.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="sdks" className="mt-12 scroll-mt-28" aria-labelledby="sdks-heading">
          <h2 id="sdks-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
            SDKs
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {SDKS.map((sdk) => (
              <li key={sdk.name} className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold">{sdk.name}</p>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">{sdk.status}</span>
                </div>
                <p className="mt-1 text-[13px] text-neutral-500">{sdk.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="examples" className="mt-12 scroll-mt-28" aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
            Examples
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className="rounded-2xl border border-neutral-800/10 bg-neutral-950 p-4 text-emerald-300/90 shadow-sm">
                <p className="text-[13px] font-semibold text-white">{ex.title}</p>
                <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{ex.code}</pre>
              </div>
            ))}
          </div>
        </section>

        <section id="openapi" className="mt-12 scroll-mt-28" aria-labelledby="openapi-heading">
          <h2 id="openapi-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
            OpenAPI
          </h2>
          <p className="mt-2 text-[14px] text-neutral-600">Download the machine-readable specification for codegen and API explorers.</p>
          <Link href="/openapi.json" className="mt-4 inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-800 hover:border-blue-200">
            Download openapi.json
          </Link>
        </section>

        <div className="mt-16 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
          <p className="text-[14px] font-semibold text-neutral-900">Need human-readable guides?</p>
          <p className="mt-1 text-[13px] text-neutral-600">Browse the full Help Center for policies, flows, and AI-readable platform docs.</p>
          <Link href="/help-center" className="mt-4 inline-flex text-[13px] font-semibold text-blue-700 hover:underline">
            ← Back to Help Center
          </Link>
        </div>
      </main>
    </div>
  );
}
