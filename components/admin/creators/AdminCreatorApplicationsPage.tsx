"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import type { AdminCreatorApplication } from "@/lib/creator/types";
import { SkTableBodyRows } from "@/components/skeleton/SalvyaSkeletonBlocks";

const STATUS_STYLES: Record<AdminCreatorApplication["status"], string> = {
  pending: "bg-amber-50 text-amber-900 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
};

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
] as const;

export function AdminCreatorApplicationsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pending");
  const [applications, setApplications] = useState<AdminCreatorApplication[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status: tab });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/creator-applications?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        applications?: AdminCreatorApplication[];
        counts?: typeof counts;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.applications) throw new Error(body.error ?? "Failed to load");
      setApplications(body.applications);
      if (body.counts) setCounts(body.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/creator-applications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? `${action} failed`);
      window.dispatchEvent(new CustomEvent("salvya-admin-creator-applications-changed"));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${action} failed`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Creator applications"
        description="Review and approve creator applications. Approval grants creator access and a unique creator code."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminKpiCard label="Pending" value={String(counts.pending)} />
        <AdminKpiCard label="Approved" value={String(counts.approved)} />
        <AdminKpiCard label="Rejected" value={String(counts.rejected)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold ${
              tab === t.id ? "border-[#2D6BFF] bg-[#2D6BFF]/10 text-[#1a4fd6]" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search name, @handle, email, country…"
        value={qInput}
        onChange={(e) => setQInput(e.target.value)}
        className={`${adminInputClass} mt-4 max-w-md`}
      />

      {error ? <div className={`${adminErrorBox} mt-4`}>{error}</div> : null}

      <div className={`${adminTableWrap} mt-6`}>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3 font-semibold">Applicant</th>
              <th className="px-4 py-3 font-semibold">Instagram</th>
              <th className="px-4 py-3 font-semibold">Niche</th>
              <th className="px-4 py-3 font-semibold">Followers</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkTableBodyRows cols={6} rows={5} />
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-4 py-10 text-center ${adminMuted}`}>
                  No applications in this queue.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{app.full_name}</p>
                    <p className="text-slate-500">{app.country}</p>
                    <p className="text-[12px] text-slate-400">{app.applicantEmail ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={app.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#2D6BFF] hover:underline"
                    >
                      @{app.instagram_username}
                    </a>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{app.niche}</td>
                  <td className="px-4 py-3 tabular-nums">{app.followers_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLES[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {app.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyId === app.id}
                          onClick={() => void mutate(app.id, "approve")}
                          className={adminBtnPrimary}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === app.id}
                          onClick={() => void mutate(app.id, "reject")}
                          className={adminBtnSecondary}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={adminMuted}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
