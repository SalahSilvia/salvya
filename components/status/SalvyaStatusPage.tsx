import Link from "next/link";

const SYSTEMS = [
  { name: "Storefront & checkout", status: "operational", detail: "Shop, bag, and payment flows" },
  { name: "Order tracking", status: "operational", detail: "SVY lookup and notifications" },
  { name: "Creator workspace", status: "operational", detail: "Dashboard, links, wallet" },
  { name: "Creator payouts", status: "operational", detail: "DH commissions and withdrawals" },
  { name: "Public APIs", status: "operational", detail: "Auth probe and documented REST routes" },
  { name: "Documentation", status: "operational", detail: "/docs and Help Center" },
] as const;

function statusColor(status: string) {
  if (status === "operational") return "bg-emerald-500";
  if (status === "degraded") return "bg-amber-500";
  return "bg-red-500";
}

export function SalvyaStatusPage() {
  return (
    <div className="min-h-dvh bg-[#fafbfd] text-neutral-950">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Salvya Status</p>
            <h1 className="text-[1.5rem] font-bold">Platform health</h1>
          </div>
          <Link href="/help-center" className="text-[13px] font-semibold text-blue-700 hover:underline">
            Help Center
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-3 text-[14px] text-emerald-900">
          All core systems operational. Map <strong>status.salvyastore.com</strong> to this page in production DNS.
        </p>
        <ul className="mt-8 space-y-3">
          {SYSTEMS.map((s) => (
            <li key={s.name} className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${statusColor(s.status)}`} aria-hidden />
              <div>
                <p className="text-[15px] font-semibold">{s.name}</p>
                <p className="text-[13px] text-neutral-500">{s.detail}</p>
                <p className="mt-1 text-[12px] font-medium capitalize text-emerald-700">{s.status}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[13px] text-neutral-500">
          Report incidents via <Link href="/report-problem" className="font-semibold text-blue-700 hover:underline">report problem</Link> or{" "}
          <Link href="/contact" className="font-semibold text-blue-700 hover:underline">contact</Link>.
        </p>
      </main>
    </div>
  );
}
