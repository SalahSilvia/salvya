"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { AdminBlogCardPreview } from "@/components/admin/blog/AdminBlogCardPreview";
import { AdminBlogMarkdownPreview } from "@/components/admin/blog/AdminBlogMarkdownPreview";
import { AdminBlogMarkdownToolbar } from "@/components/admin/blog/AdminBlogMarkdownToolbar";
import { AdminBlogPublishChecklist } from "@/components/admin/blog/AdminBlogPublishChecklist";
import { AdminImageDropzone } from "@/components/admin/products/AdminImageDropzone";
import { uploadBlogImage } from "@/lib/admin/upload-blog-image";
import {
  BLOG_STARTER_TEMPLATES,
  BLOG_TOPIC_TEMPLATES,
  canPublish,
  excerptFromMarkdown,
  getPublishChecks,
  wrapMarkdownSelection,
  type MarkdownWrap,
} from "@/lib/blog/editor-helpers";
import { estimateReadTimeMinutes } from "@/lib/blog/read-time";
import { isValidBlogSlug, slugifyBlogTitle } from "@/lib/blog/slug";
import type { AdminBlogPost, BlogPostStatus } from "@/lib/blog/types";

type FormState = Omit<AdminBlogPost, "id" | "createdAt" | "updatedAt" | "readTimeMinutes">;

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    subtitle: "",
    excerpt: "",
    bodyMd: "",
    coverImage: "",
    authorName: "Salvya",
    authorRole: "Editorial",
    tags: [],
    status: "draft",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    publishedAt: null,
  };
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className={adminPanelClass}>
      <div className="border-b border-[#e3e5e7] px-5 py-4">
        <h2 className="text-[14px] font-semibold text-[#202223]">{title}</h2>
        {subtitle ? <p className={`mt-1 text-[12px] ${adminMuted}`}>{subtitle}</p> : null}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

type Props = { mode: "create" } | { mode: "edit"; slug: string };

export function AdminBlogEditor(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const [form, setForm] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"card" | "body">("card");
  const [splitEditor, setSplitEditor] = useState(true);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [dirty, setDirty] = useState(false);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const resolvedSlug = useMemo(() => {
    if (isEdit) return form.slug.trim().toLowerCase();
    return (slugTouched ? form.slug : slugifyBlogTitle(form.title)).trim().toLowerCase();
  }, [form.slug, form.title, isEdit, slugTouched]);

  const slugReady = isValidBlogSlug(resolvedSlug);
  const readMins = useMemo(() => estimateReadTimeMinutes(form.bodyMd), [form.bodyMd]);
  const tags = useMemo(() => tagsInput.split(",").map((t) => t.trim()).filter(Boolean), [tagsInput]);

  const editorForm = useMemo(
    () => ({
      slug: resolvedSlug,
      title: form.title,
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      bodyMd: form.bodyMd,
      coverImage: form.coverImage,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      status: form.status,
    }),
    [form, resolvedSlug],
  );

  const publishChecks = useMemo(() => getPublishChecks(editorForm, resolvedSlug), [editorForm, resolvedSlug]);
  const publishReady = canPublish(editorForm, resolvedSlug);

  const patchForm = useCallback((patch: Partial<FormState>) => {
    setDirty(true);
    setForm((f) => ({ ...f, ...patch }));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/blog/${encodeURIComponent(props.slug)}`, {
          credentials: "include",
          cache: "no-store",
        });
        const body = (await res.json()) as { ok?: boolean; post?: AdminBlogPost; error?: string };
        if (!res.ok || !body.ok || !body.post) throw new Error(body.error ?? "Not found");
        if (cancelled) return;
        const p = body.post;
        setForm({
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          excerpt: p.excerpt,
          bodyMd: p.bodyMd,
          coverImage: p.coverImage,
          authorName: p.authorName,
          authorRole: p.authorRole,
          tags: p.tags,
          status: p.status,
          featured: p.featured,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          publishedAt: p.publishedAt,
        });
        setTagsInput(p.tags.join(", "));
        setSlugTouched(true);
        setDirty(false);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, props]);

  useEffect(() => {
    if (!slugReady || (isEdit && resolvedSlug === props.slug)) {
      setSlugAvailable(true);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug: resolvedSlug });
        if (isEdit) params.set("exclude", props.slug);
        const res = await fetch(`/api/admin/blog/check-slug?${params}`, { credentials: "include" });
        const body = (await res.json()) as { ok?: boolean; available?: boolean };
        if (!cancelled && res.ok && body.ok) setSlugAvailable(Boolean(body.available));
      } catch {
        if (!cancelled) setSlugAvailable(null);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [resolvedSlug, slugReady, isEdit, props]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const uploadCover = useCallback((file: File) => uploadBlogImage(file, resolvedSlug, "cover"), [resolvedSlug]);

  const insertInlineImage = async (file: File) => {
    if (!slugReady) {
      setError("Set a title or slug before uploading images.");
      return;
    }
    const url = await uploadBlogImage(file, resolvedSlug, "inline");
    const alt = file.name.replace(/\.[^.]+$/, "").slice(0, 60);
    patchForm({ bodyMd: `${form.bodyMd.trim()}\n\n![${alt}](${url})\n` });
  };

  const applyMarkdownWrap = (kind: MarkdownWrap) => {
    const el = bodyRef.current;
    if (!el) return;
    const { next, cursor } = wrapMarkdownSelection(el.value, el.selectionStart, el.selectionEnd, kind);
    patchForm({ bodyMd: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const fillSeoFromContent = () => {
    const excerpt = form.excerpt.trim() || excerptFromMarkdown(form.bodyMd);
    patchForm({
      seoTitle: form.seoTitle.trim() || form.title.trim().slice(0, 120),
      seoDescription: form.seoDescription.trim() || excerpt.slice(0, 320),
      excerpt: form.excerpt.trim() || excerpt,
    });
  };

  const applyTemplate = (templateId: string, pool: typeof BLOG_STARTER_TEMPLATES) => {
    const t = pool.find((x) => x.id === templateId);
    if (!t) return;
    if (form.bodyMd.trim() && !window.confirm("Replace current body with this template?")) return;
    patchForm({
      bodyMd: t.bodyMd,
      featured: t.featured ?? form.featured,
    });
    if (!tagsInput.trim()) setTagsInput(t.tags.join(", "));
    if (!form.title.trim()) patchForm({ title: t.label });
    fillSeoFromContent();
    setError(null);
  };

  const magicFillNewPost = () => {
    const t = BLOG_TOPIC_TEMPLATES[0]!;
    patchForm({
      title: form.title.trim() || "Hoodie oversize .. New drop",
      bodyMd: t.bodyMd,
      featured: true,
      authorName: "Salvya",
      authorRole: "Editorial",
    });
    setTagsInput(t.tags.join(", "));
    fillSeoFromContent();
    setError(null);
  };

  const save = useCallback(
    async (publishNow?: boolean) => {
      if (publishNow && !publishReady) {
        setError("Complete the publish checklist before going live.");
        return;
      }
      if (!isEdit && slugAvailable === false) {
        setError("This URL slug is already taken — choose another.");
        return;
      }

      setSaving(true);
      setError(null);
      try {
        const slug = isEdit ? form.slug : slugTouched ? form.slug : slugifyBlogTitle(form.title);
        const status: BlogPostStatus = publishNow ? "published" : form.status;
        const excerpt =
          form.excerpt.trim() ||
          excerptFromMarkdown(form.bodyMd) ||
          form.subtitle.trim().slice(0, 280);

        const payload = {
          ...form,
          slug,
          tags,
          status,
          excerpt,
          seoTitle: form.seoTitle.trim() || form.title.trim().slice(0, 120),
          seoDescription:
            form.seoDescription.trim() || excerpt.slice(0, 320),
          readTimeMinutes: readMins,
          publishedAt:
            publishNow && !form.publishedAt ? new Date().toISOString() : form.publishedAt,
        };

        const res = await fetch(
          isEdit ? `/api/admin/blog/${encodeURIComponent(form.slug)}` : "/api/admin/blog",
          {
            method: isEdit ? "PATCH" : "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const body = (await res.json()) as { ok?: boolean; post?: AdminBlogPost; error?: string };
        if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");

        setDirty(false);
        router.push("/admin/blog");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [form, isEdit, publishReady, readMins, router, slugAvailable, slugTouched, tags],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void save(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  if (loading) {
    return <p className={adminMuted}>Loading post…</p>;
  }

  const publishedLocal = form.publishedAt
    ? new Date(form.publishedAt).toISOString().slice(0, 16)
    : "";

  const slugHint =
    !slugReady
      ? "Slug needs 2+ characters (a-z, 0-9, hyphens)"
      : slugAvailable === false
        ? "Slug already in use"
        : slugAvailable === true
          ? "Slug available"
          : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? `Edit: ${form.title || "post"}` : "New blog post"}
        description="Templates, markdown toolbar, live preview, and publish checklist. Drafts can save without a cover; publishing requires a hero image."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit && form.status === "published" ? (
              <Link href={`/blog/${form.slug}`} target="_blank" className={adminBtnSecondary}>
                View live
              </Link>
            ) : null}
            <Link href="/admin/blog" className={adminBtnSecondary}>
              Cancel
            </Link>
          </div>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      {!isEdit ? (
        <section className={`${adminPanelClass} p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-[#202223]">Start from a template</p>
              <p className={`mt-1 text-[12px] ${adminMuted}`}>Streetwear SEO topics or story formats.</p>
            </div>
            <button
              type="button"
              onClick={magicFillNewPost}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2 text-[13px] font-semibold text-violet-900"
            >
              <span aria-hidden>✨</span> Magic fill
            </button>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">SEO topics</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BLOG_TOPIC_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id, BLOG_TOPIC_TEMPLATES)}
                className="rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-3 text-left hover:border-violet-300 hover:bg-violet-50/40"
              >
                <p className="text-[12px] font-semibold text-[#202223]">{t.label}</p>
                <p className={`mt-1 text-[11px] leading-snug ${adminMuted}`}>{t.description}</p>
              </button>
            ))}
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Story formats</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {BLOG_STARTER_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id, BLOG_STARTER_TEMPLATES)}
                className="rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-4 text-left hover:border-[#2D6BFF]/40 hover:bg-[#eef4ff]/50"
              >
                <p className="text-[13px] font-semibold text-[#202223]">{t.label}</p>
                <p className={`mt-1 text-[11px] leading-snug ${adminMuted}`}>{t.description}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(320px,100%)]">
        <div className="space-y-6">
          <Section title="Story" subtitle="Title, URL, and short descriptions.">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Title</span>
              <input
                className={adminInputClass}
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
                placeholder="Post headline"
              />
            </label>
            {!isEdit ? (
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">URL slug</span>
                <input
                  className={adminInputClass}
                  value={slugTouched ? form.slug : slugifyBlogTitle(form.title)}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patchForm({ slug: e.target.value });
                  }}
                />
                <p className={`mt-1 text-[12px] ${slugHint === "Slug already in use" ? "text-rose-600" : slugHint === "Slug available" ? "text-emerald-700" : adminMuted}`}>
                  /blog/{resolvedSlug || "…"}
                  {slugHint ? ` · ${slugHint}` : ""}
                </p>
              </label>
            ) : (
              <p className={`text-[12px] ${adminMuted}`}>
                Slug: <span className="font-mono text-[#202223]">{form.slug}</span>
              </p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Subtitle</span>
              <input
                className={adminInputClass}
                value={form.subtitle}
                onChange={(e) => patchForm({ subtitle: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-[#202223]">Excerpt</span>
                <button type="button" onClick={fillSeoFromContent} className="text-[11px] font-semibold text-[#2D6BFF]">
                  Auto-fill from body
                </button>
              </span>
              <textarea
                rows={2}
                className={`${adminInputClass} min-h-[72px] resize-y`}
                value={form.excerpt}
                onChange={(e) => patchForm({ excerpt: e.target.value })}
                placeholder="Shown on the blog index and link previews"
              />
            </label>
          </Section>

          <Section
            title="Cover"
            subtitle={slugReady ? "Optional for drafts · required to publish." : "Set slug first to upload."}
          >
            <AdminImageDropzone
              label="Cover image"
              hint="16:10 hero"
              aspect="banner"
              value={form.coverImage.trim() || null}
              onChange={(url) => patchForm({ coverImage: url ?? "" })}
              onUpload={uploadCover}
              disabled={!slugReady || saving}
            />
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Or cover URL</span>
              <input
                className={adminInputClass}
                value={form.coverImage}
                onChange={(e) => patchForm({ coverImage: e.target.value })}
                placeholder="https://…"
              />
            </label>
          </Section>

          <Section title="Body" subtitle={`Markdown · ~${readMins} min read · Ctrl+S to save draft`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <AdminBlogMarkdownToolbar
                disabled={saving}
                onWrap={applyMarkdownWrap}
                onInsertImage={() => inlineInputRef.current?.click()}
              />
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#6d7175]">
                <input
                  type="checkbox"
                  checked={splitEditor}
                  onChange={(e) => setSplitEditor(e.target.checked)}
                  className="size-4 rounded border-[#c9cccf]"
                />
                Split preview
              </label>
            </div>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void insertInlineImage(f).catch((err) => setError(err instanceof Error ? err.message : "Upload failed"));
                e.target.value = "";
              }}
            />
            {splitEditor ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <textarea
                  ref={bodyRef}
                  rows={22}
                  className={`${adminInputClass} min-h-[420px] resize-y font-mono text-[13px]`}
                  value={form.bodyMd}
                  onChange={(e) => patchForm({ bodyMd: e.target.value })}
                  placeholder="Write your story…"
                />
                <div className="max-h-[min(70vh,520px)] overflow-y-auto rounded-xl border border-[#e3e5e7] bg-[#050508] p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-white/35">Live preview</p>
                  <AdminBlogMarkdownPreview markdown={form.bodyMd} />
                </div>
              </div>
            ) : (
              <>
                <textarea
                  ref={bodyRef}
                  rows={18}
                  className={`${adminInputClass} min-h-[360px] resize-y font-mono text-[13px]`}
                  value={form.bodyMd}
                  onChange={(e) => patchForm({ bodyMd: e.target.value })}
                  placeholder="Write your story…"
                />
                <details className="mt-3 rounded-lg border border-[#e3e5e7] bg-[#fafbfb]">
                  <summary className="cursor-pointer px-4 py-2.5 text-[12px] font-semibold text-[#6d7175]">
                    Inline preview
                  </summary>
                  <div className="border-t border-[#e3e5e7] p-4">
                    <AdminBlogMarkdownPreview markdown={form.bodyMd} />
                  </div>
                </details>
              </>
            )}
          </Section>

          <Section title="Author & tags">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Author</span>
                <input
                  className={adminInputClass}
                  value={form.authorName}
                  onChange={(e) => patchForm({ authorName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Role / byline</span>
                <input
                  className={adminInputClass}
                  value={form.authorRole}
                  onChange={(e) => patchForm({ authorRole: e.target.value })}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Tags (comma-separated)</span>
                <input
                  className={adminInputClass}
                  value={tagsInput}
                  onChange={(e) => {
                    setDirty(true);
                    setTagsInput(e.target.value);
                  }}
                  placeholder="drops, artists, behind-the-scenes"
                />
              </label>
            </div>
          </Section>

          <Section title="Publish & SEO">
            <div className="mb-3 flex flex-wrap gap-2">
              <button type="button" onClick={fillSeoFromContent} className={adminBtnSecondary}>
                Fill SEO from title & excerpt
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Status</span>
                <select
                  className={adminInputClass}
                  value={form.status}
                  onChange={(e) => patchForm({ status: e.target.value as BlogPostStatus })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Publish date</span>
                <input
                  type="datetime-local"
                  className={adminInputClass}
                  value={publishedLocal}
                  onChange={(e) =>
                    patchForm({
                      publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => patchForm({ featured: e.target.checked })}
                  className="size-4 rounded border-[#c9cccf]"
                />
                <span className="text-[13px] text-[#202223]">Featured on blog home</span>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 flex justify-between text-[12px] font-semibold text-[#202223]">
                  <span>SEO title</span>
                  <span className={adminMuted}>{form.seoTitle.length}/120</span>
                </span>
                <input
                  className={adminInputClass}
                  value={form.seoTitle}
                  onChange={(e) => patchForm({ seoTitle: e.target.value.slice(0, 120) })}
                  placeholder={form.title || "Defaults to post title"}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 flex justify-between text-[12px] font-semibold text-[#202223]">
                  <span>SEO description</span>
                  <span className={adminMuted}>{form.seoDescription.length}/320</span>
                </span>
                <textarea
                  rows={2}
                  className={`${adminInputClass} min-h-[64px] resize-y`}
                  value={form.seoDescription}
                  onChange={(e) => patchForm({ seoDescription: e.target.value.slice(0, 320) })}
                />
              </label>
            </div>
          </Section>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={saving} onClick={() => void save(false)} className={adminBtnSecondary}>
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={saving || !publishReady}
              onClick={() => void save(true)}
              className={adminBtnPrimary}
              title={!publishReady ? "Complete checklist to publish" : undefined}
            >
              {saving ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <AdminBlogPublishChecklist checks={publishChecks} ready={publishReady} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab("card")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${previewTab === "card" ? "bg-[#2D6BFF] text-white" : "bg-[#f6f6f7] text-[#6d7175]"}`}
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("body")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${previewTab === "body" ? "bg-[#2D6BFF] text-white" : "bg-[#f6f6f7] text-[#6d7175]"}`}
            >
              Article
            </button>
          </div>
          {previewTab === "card" ? (
            <AdminBlogCardPreview
              title={form.title}
              subtitle={form.subtitle}
              excerpt={form.excerpt}
              coverImage={form.coverImage}
              authorName={form.authorName}
              authorRole={form.authorRole}
              tags={tags}
              status={form.status}
              readTimeMinutes={readMins}
              publishedAt={form.publishedAt}
            />
          ) : (
            <div className="max-h-[min(70vh,640px)] overflow-y-auto rounded-xl border border-[#e3e5e7] bg-[#050508] p-4">
              <AdminBlogMarkdownPreview markdown={form.bodyMd} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

