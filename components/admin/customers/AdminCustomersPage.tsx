"use client";

import { useCallback, useEffect, useState } from "react";

type CustomerRow = {
  id: string;
  email: string;
  rolePublic: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  ordersCount: number;
  totalSpent: number;
};

type CustomerDetail = {
  customer: CustomerRow;
  addresses: {
    id: string;
    full_name: string;
    phone: string;
    address_line_1: string;
    city: string | null;
    country: string;
    is_default: boolean;
  }[];
  orders: { id: string; orderNumber: string; total: number; paymentStatus: string; fulfillmentStatus: string; createdAt: string }[];
  engagement: { likesCount: number; followsCount: number; commentsCount: number };
};

export function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchNonce, setSearchNonce] = useState(0);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "25");
      if (q.trim()) params.set("q", q.trim());
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/customers?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; customers?: CustomerRow[]; error?: string };
      if (!res.ok || !body.ok || !body.customers) throw new Error(body.error ?? "Failed");
      setRows(body.customers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, q, roleFilter]);

  useEffect(() => {
    void load();
  }, [load, searchNonce]);

  const openProfile = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean } & Partial<CustomerDetail>;
      if (res.ok && body.ok && body.customer) {
        setDetail({
          customer: body.customer,
          addresses: body.addresses ?? [],
          orders: body.orders ?? [],
          engagement: body.engagement ?? { likesCount: 0, followsCount: 0, commentsCount: 0 },
        });
      }
    } catch {
      /* ignore */
    } finally {
      setDetailLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter email…"
          className="min-h-[42px] w-[min(100%,280px)] rounded-xl border border-[#c9cccf] bg-[#f6f6f7] px-3 text-[14px] text-[#202223] placeholder:text-[#8c9196] focus:border-[#2D6BFF]/45 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/20"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="min-h-[42px] rounded-xl border border-[#c9cccf] bg-white px-3 text-[14px] text-[#202223]"
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="creator">Creator</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearchNonce((n) => n + 1);
          }}
          className="rounded-xl border border-[#c9cccf] bg-[#f6f6f7] px-4 py-2 text-[13px] font-semibold text-[#202223]"
        >
          Apply
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-[#c9cccf] px-4 py-2 text-[13px] font-semibold text-[#202223] disabled:opacity-35"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-[#c9cccf] px-4 py-2 text-[13px] font-semibold text-[#202223]"
          >
            Next
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-100/95">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#e3e5e7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-[13px]">
            <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e5e7]">
              {rows.map((r) => (
                <tr key={r.id} className="cursor-pointer hover:bg-[#f6f6f7]" onClick={() => void openProfile(r.id)}>
                  <td className="px-4 py-3 text-[#2D6BFF]">{r.email || "—"}</td>
                  <td className="px-4 py-3 capitalize text-[#202223]">{r.rolePublic}</td>
                  <td className="px-4 py-3 tabular-nums text-[#6d7175]">{r.ordersCount}</td>
                  <td className="px-4 py-3 tabular-nums text-emerald-700">{fmt(r.totalSpent)}</td>
                  <td className="px-4 py-3 text-[#6d7175]">{r.lastSignInAt ? new Date(r.lastSignInAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-[#6d7175]">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#6d7175]">
                    No users on this page.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {loading ? <p className="text-[13px] text-[#6d7175]">Loading directory…</p> : null}

      {(detail || detailLoading) && (
        <>
          <button type="button" className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm" aria-label="Close" onClick={() => setDetail(null)} />
          <aside className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-lg flex-col border-l border-[#e3e5e7] bg-white shadow-[0_0_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-[#e3e5e7] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Customer profile</p>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg border border-[#c9cccf] px-3 py-1.5 text-[13px] text-[#202223] hover:bg-[#f6f6f7]">
                Close
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {detailLoading ? <p className="text-[#6d7175]">Loading profile…</p> : null}
              {detail ? (
                <>
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Account</p>
                    <p className="mt-2 text-[15px] font-semibold text-[#202223]">{detail.customer.email}</p>
                    <p className="text-[13px] capitalize text-[#6d7175]">{detail.customer.rolePublic}</p>
                    <p className="mt-2 text-[12px] text-[#6d7175]">
                      Joined {detail.customer.createdAt ? new Date(detail.customer.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </section>
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Engagement</p>
                    <p className="mt-2 text-[13px] text-[#202223]">
                      {detail.engagement.likesCount} likes · {detail.engagement.followsCount} follows · {detail.engagement.commentsCount}{" "}
                      comments
                    </p>
                  </section>
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Addresses</p>
                    <ul className="mt-2 space-y-2">
                      {detail.addresses.map((a) => (
                        <li key={a.id} className="rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-3 text-[12px] text-[#6d7175]">
                          <p className="font-medium text-[#202223]">{a.full_name}</p>
                          <p>{a.address_line_1}</p>
                          <p>
                            {[a.city, a.country].filter(Boolean).join(" · ")}
                            {a.is_default ? " · default" : ""}
                          </p>
                        </li>
                      ))}
                      {!detail.addresses.length ? <li className="text-[#6d7175]">No saved addresses.</li> : null}
                    </ul>
                  </section>
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Orders</p>
                    <ul className="mt-2 space-y-2">
                      {detail.orders.map((o) => (
                        <li key={o.id} className="flex justify-between rounded-xl border border-[#e3e5e7] bg-[#fafbfb] px-3 py-2 text-[12px]">
                          <span className="font-mono text-[#2D6BFF]">{o.orderNumber}</span>
                          <span className="text-emerald-700">€{o.total}</span>
                        </li>
                      ))}
                      {!detail.orders.length ? <li className="text-[#6d7175]">No orders yet.</li> : null}
                    </ul>
                  </section>
                </>
              ) : null}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
