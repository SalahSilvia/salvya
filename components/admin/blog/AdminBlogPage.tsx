"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminRowMenu } from "@/components/admin/AdminRowMenu";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminMuted,
  adminPanelClass,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import { statusLabel } from "@/lib/blog/payload";
import type { AdminBlogPost, BlogPostStatus } from "@/lib/blog/types";

const STATUS_STYLES: Record<BlogPostStatus, string> = {
  draft: "bg-amber-50 text-amber-900 border-amber-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

type Filter = "active" | "draft" | "published" | "archived" | "all";

export function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("active");
  const [q, setQ] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter === "draft" || filter === "published" || filter === "archived") {
        params.set("status", filter);
      } else if (filter === "all") {
        params.set("all", "1");
      }
      const res = await fetch(`/api/admin/blog?${params}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; posts?: AdminBlogPost[]; error?: string };
      if (!res.ok || !body.ok || !body.posts) throw new Error(body.error ?? "Failed to load");
      setPosts(body.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "published").length;
    const draft = posts.filter((p) => p.status === "draft").length;
    const featured = posts.filter((p) => p.featured).length;
    return { published, draft, featured, total: posts.length };
  }, [posts]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((p) => {
      const hay = `${p.title} ${p.slug} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [posts, q]);

  const runFolderImport = async () => {
    setImportBusy(true);
    setImportMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/import-folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        result?: { inserted: number; updated: number; total: number };
        error?: string;
      };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Import failed");
      const r = body.result;
      setImportMsg(
        r ? `Synced ${r.total} posts from Blogs/ (${r.inserted} new, ${r.updated} updated)` : "Import complete",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportBusy(false);
    }
  };

  const quickStatus = async (slug: string, status: BlogPostStatus) => {
    setBusySlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  const remove = async (slug: string) => {
    setBusySlug(slug);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Delete failed");
      setPosts((list) => list.filter((p) => p.slug !== slug));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusySlug(null);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
    { id: "published", label: "Published" },
    { id: "archived", label: "Archived" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Magazine at /blog — import from Salvya/Blogs, write new posts, or edit synced articles."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={adminBtnSecondary}
              disabled={importBusy}
              onClick={() => void runFolderImport()}
            >
              {importBusy ? "Syncing…" : "Sync Blogs folder"}
            </button>
            <Link href="/admin/blog/new" className={adminBtnPrimary}>
              New post
            </Link>
          </div>
        }
      />

      {importMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">
          {importMsg}
        </div>
      ) : null}
      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Published", value: stats.published },
          { label: "Drafts", value: stats.draft },
          { label: "Featured", value: stats.featured },
          { label: "Showing", value: visible.length },
        ].map((s) => (
          <div key={s.label} className={`${adminPanelClass} px-4 py-3`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${adminMuted}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[#202223]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, slug, tags…"
          className="min-h-[40px] flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 text-[14px] shadow-sm focus:border-[#2D6BFF] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/25"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                filter === f.id
                  ? "bg-[#2D6BFF] text-white"
                  : "border border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
            Refresh
          </button>
        </div>
      </div>

      <div className={adminTableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Read</th>
                <th className="px-4 py-3">Updated</th>
                <th className="w-12 px-2 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e5e7]">
              {visible.map((p) => (
                <tr key={p.slug} className="hover:bg-[#f6f6f7]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[#e3e5e7] bg-[#f6f6f7]">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/blog/${encodeURIComponent(p.slug)}`}
                          className="font-semibold text-[#2D6BFF] hover:underline"
                        >
                          {p.title}
                        </Link>
                        <p className={`mt-0.5 truncate text-[12px] ${adminMuted}`}>/blog/{p.slug}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.featured ? (
                            <span className="text-[10px] font-semibold uppercase text-violet-700">Featured</span>
                          ) : null}
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-[#f6f6f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6d7175]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#202223]">
                    {p.authorName}
                    {p.authorRole ? <span className={`block text-[11px] ${adminMuted}`}>{p.authorRole}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 tabular-nums ${adminMuted}`}>{p.readTimeMinutes} min</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#6d7175]">
                    {new Date(p.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-3">
                    <AdminRowMenu
                      disabled={busySlug === p.slug}
                      items={[
                        ...(p.status === "published"
                          ? [{ kind: "link" as const, label: "View", href: `/blog/${p.slug}`, external: true }]
                          : []),
                        {
                          kind: "link",
                          label: "Edit",
                          href: `/admin/blog/${encodeURIComponent(p.slug)}`,
                        },
                        p.status !== "published"
                          ? {
                              kind: "action",
                              label: "Publish",
                              onClick: () => void quickStatus(p.slug, "published"),
                            }
                          : {
                              kind: "action",
                              label: "Unpublish",
                              onClick: () => void quickStatus(p.slug, "draft"),
                            },
                        {
                          kind: "action",
                          label: "Delete",
                          danger: true,
                          onClick: () => setDeleteTarget(p),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!visible.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-[#6d7175]">
                    {q.trim() ? "No posts match your search." : "No posts yet."}{" "}
                    <Link href="/admin/blog/new" className="font-semibold text-[#2D6BFF] hover:underline">
                      Write your first story
                    </Link>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {loading ? <p className={adminMuted}>Loading posts…</p> : null}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete blog post?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed permanently.` : undefined}
        confirmLabel="Delete"
        tone="danger"
        busy={busySlug === deleteTarget?.slug}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void remove(deleteTarget.slug)}
      />
    </div>
  );
}

