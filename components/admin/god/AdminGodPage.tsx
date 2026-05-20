"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import type { GodAdminSnapshot, GodUserRow } from "@/lib/admin/god-overview";
import { godAssignableRoles } from "@/lib/admin/god-overview";
import type { SalvyaRole } from "@/lib/auth/roles";
import { roleLabel } from "@/lib/auth/roles";

function fmtWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function AdminGodPage() {
  const [snapshot, setSnapshot] = useState<GodAdminSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/god/overview", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; snapshot?: GodAdminSnapshot; error?: string };
      if (!res.ok || !body.ok || !body.snapshot) throw new Error(body.error ?? "Failed to load");
      setSnapshot(body.snapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setRole = async (userId: string, role: SalvyaRole) => {
    setBusyId(userId);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/god/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Role update failed");
      setMsg(`Updated role for ${userId.slice(0, 8)}…`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Role update failed");
    } finally {
      setBusyId(null);
    }
  };

  const users = (snapshot?.users ?? []).filter((u) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return u.email.toLowerCase().includes(needle) || u.id.toLowerCase().includes(needle) || u.role.includes(needle);
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="God Admin"
        description="Full system access — every user, every role, audit trail, and infrastructure status. Standard admins cannot see this surface."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/overview" className={adminBtnSecondary}>
              Pro dashboard
            </Link>
            <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
              Refresh
            </button>
          </div>
        }
      />

      <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-[#eef4ff] px-4 py-3 text-[13px] text-violet-950">
        <strong>God Admin</strong> can assign any role including other God Admins. Grant sparingly — this bypasses all
        storefront restrictions and controls team access.
      </div>

      {error ? <div className={adminErrorBox}>{error}</div> : null}
      {msg ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">{msg}</div> : null}

      {snapshot ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Customers" value={snapshot.counts.customers} />
            <StatCard label="Creators" value={snapshot.counts.influencers} />
            <StatCard label="Admins" value={snapshot.counts.admins} />
            <StatCard label="God Admins" value={snapshot.counts.godAdmins} accent />
          </div>

          <div className={`${adminPanelClass} p-5`}>
            <h2 className="text-[14px] font-semibold text-[#202223]">Infrastructure</h2>
            <p className={`mt-1 text-[12px] ${adminMuted}`}>
              {snapshot.store.storeName}
              {snapshot.store.maintenanceMode ? " · maintenance ON" : ""}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <EnvPill ok={snapshot.env.supabaseUrl} label="Supabase URL" />
              <EnvPill ok={snapshot.env.serviceRole} label="Service role" />
              <EnvPill ok={snapshot.env.resend} label="Resend email" />
              <EnvPill ok={snapshot.env.paypal} label="PayPal client" />
            </ul>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#202223]">All users ({users.length})</h2>
              <input
                className={`${adminInputClass} ml-auto min-w-[200px] max-w-md flex-1`}
                placeholder="Search email or id…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <UserTable users={users} busyId={busyId} onRoleChange={setRole} />
          </div>

          <div className={`${adminPanelClass} p-5`}>
            <h2 className="text-[14px] font-semibold text-[#202223]">Full audit log</h2>
            <p className={`mt-1 text-[12px] ${adminMuted}`}>Last {snapshot.audit.length} admin actions</p>
            <ul className="mt-4 max-h-[320px] divide-y divide-[#e3e5e7] overflow-y-auto">
              {snapshot.audit.map((row) => (
                <li key={row.id} className="py-2.5 text-[12px]">
                  <p className="font-medium text-[#202223]">{row.action}</p>
                  <p className={adminMuted}>
                    actor {row.actorId.slice(0, 8)}…
                    {row.targetType ? ` · ${row.targetType}` : ""}
                    {row.targetId ? ` ${row.targetId.slice(0, 12)}` : ""}
                  </p>
                  <p className="text-[11px] text-[#8c9196]">{fmtWhen(row.createdAt)}</p>
                </li>
              ))}
              {!snapshot.audit.length ? <li className={`py-6 text-center ${adminMuted}`}>No audit entries yet.</li> : null}
            </ul>
          </div>
        </>
      ) : (
        <p className={adminMuted}>Loading God Admin console…</p>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${accent ? "border-violet-200 bg-violet-50" : "border-[#e3e5e7] bg-white"}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">{label}</p>
      <p className={`mt-1 text-[1.5rem] font-semibold tabular-nums ${accent ? "text-violet-900" : "text-[#202223]"}`}>
        {value}
      </p>
    </div>
  );
}

function EnvPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`rounded-lg border px-3 py-2 text-[12px] font-semibold ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      {label}: {ok ? "OK" : "Missing"}
    </li>
  );
}

function UserTable({
  users,
  busyId,
  onRoleChange,
}: {
  users: GodUserRow[];
  busyId: string | null;
  onRoleChange: (userId: string, role: SalvyaRole) => void;
}) {
  const roles = godAssignableRoles();

  return (
    <div className={adminTableWrap}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[12px] font-semibold text-[#6d7175]">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#f1f2f3] last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#202223]">{u.email || "—"}</p>
                  <p className="font-mono text-[10px] text-[#8c9196]">{u.id}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    className={`${adminInputClass} min-w-[140px] py-1.5 text-[12px]`}
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => void onRoleChange(u.id, e.target.value as SalvyaRole)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{u.emailConfirmed ? "Yes" : "No"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#6d7175]">{fmtWhen(u.lastSignInAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
