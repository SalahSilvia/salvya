"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { adminBtnSecondary, adminMuted, adminTableWrap } from "@/components/admin/admin-theme";
import type { AdminArtistDTO } from "@/lib/artists/types";

const STATUS_STYLES: Record<AdminArtistDTO["statusTag"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-800 border-emerald-200",
  "LIMITED DROP": "bg-[#2D6BFF]/10 text-[#1a5ae8] border-[#2D6BFF]/25",
  "COMING SOON": "bg-slate-100 text-slate-600 border-slate-200",
};

export function AdminArtistsPage() {
  const [artists, setArtists] = useState<AdminArtistDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (showArchived) params.set("all", "1");
      const res = await fetch(`/api/admin/artists?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; artists?: AdminArtistDTO[]; error?: string };
      if (!res.ok || !body.ok || !body.artists) throw new Error(body.error ?? "Failed to load artists");
      setArtists(body.artists);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  const setArchived = async (slug: string, archived: boolean) => {
    setBusySlug(slug);
    try {
      const res = await fetch(`/api/admin/artists/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusySlug(null);
    }
  };

  const remove = async (slug: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setBusySlug(slug);
    try {
      const res = await fetch(`/api/admin/artists/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Delete failed");
      setArtists((list) => list.filter((a) => a.slug !== slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Artists"
        description="Manage artist shops on Salvya — add new creators, archive old ones, or remove entries with no products."
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#202223]">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="size-4 rounded border-[#c9cccf] text-[#2D6BFF] focus:ring-[#2D6BFF]/30"
          />
          Show archived
        </label>
        <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
          Refresh
        </button>
        <Link
          href="/admin/artists/new"
          className="ml-auto inline-flex min-h-[42px] items-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] hover:shadow-[0_16px_40px_-12px_rgba(45,107,255,0.6)]"
        >
          Add artist
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">{error}</div>
      ) : null}

      {loading ? (
        <p className={adminMuted}>Loading artists…</p>
      ) : artists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#c9cccf] bg-white px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-[#202223]">No artists yet</p>
          <p className={`mt-2 text-[13px] ${adminMuted}`}>
            Run the <code className="text-[#6d7175]">salvya_artists</code> migration in Supabase, or add your first artist.
          </p>
          <Link href="/admin/artists/new" className="mt-4 inline-flex text-[13px] font-semibold text-[#2D6BFF] hover:text-[#1a5ae8]">
            Add artist →
          </Link>
        </div>
      ) : (
        <div className={adminTableWrap}>
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="border-b border-[#e3e5e7] bg-[#f6f6f7] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
              <tr>
                <th className="px-4 py-3">Artist</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e5e7]">
              {artists.map((a) => (
                <tr key={a.slug} className={a.archived ? "bg-slate-50/80 opacity-75" : "bg-white"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.profileImage}
                        alt=""
                        className="size-10 rounded-full border border-[#e3e5e7] object-cover bg-[#f6f6f7]"
                      />
                      <div>
                        <p className="font-semibold text-[#202223]">{a.name}</p>
                        {a.archived ? (
                          <span className="text-[11px] font-medium uppercase tracking-wide text-amber-700">Archived</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[a.statusTag]}`}
                    >
                      {a.statusTag}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#6d7175]">{a.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!a.archived ? (
                        <Link
                          href={`/artist/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-[#2D6BFF] hover:bg-[#2D6BFF]/8"
                        >
                          View shop
                        </Link>
                      ) : null}
                      <Link
                        href={`/admin/artists/${encodeURIComponent(a.slug)}`}
                        className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#202223] hover:bg-[#f6f6f7]"
                      >
                        Edit
                      </Link>
                      {a.archived ? (
                        <button
                          type="button"
                          disabled={busySlug === a.slug}
                          onClick={() => void setArchived(a.slug, false)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busySlug === a.slug}
                          onClick={() => void setArchived(a.slug, true)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busySlug === a.slug}
                        onClick={() => void remove(a.slug, a.name)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
