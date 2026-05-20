"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { AdminArtistProfilePreview } from "@/components/admin/artists/AdminArtistProfilePreview";
import { AdminImageDropzone } from "@/components/admin/products/AdminImageDropzone";
import {
  isLegacyFilesystemArtistSlug,
  isValidArtistSlugFormat,
} from "@/lib/admin/artist-slug";
import { uploadArtistImage } from "@/lib/admin/upload-artist-image";
import { defaultArtistImages, slugifyArtistName, type AdminArtistDTO } from "@/lib/artists/types";
import type { ArtistStatusTag } from "@/lib/site-data";

const STATUS_OPTIONS: ArtistStatusTag[] = ["AVAILABLE", "LIMITED DROP", "COMING SOON"];

const GRADIENT_PRESETS = [
  { label: "Blue night", value: "from-[#241840] via-[#0c1a45] to-[#05060c]" },
  { label: "Crimson", value: "from-[#301018] via-[#120a14] to-[#050508]" },
  { label: "Ocean", value: "from-[#0a2230] via-[#081018] to-[#040608]" },
  { label: "Violet", value: "from-[#1a1025] via-[#0d1520] to-[#050508]" },
  { label: "Forest", value: "from-[#0c1814] via-[#081210] to-[#050508]" },
  { label: "Gold", value: "from-[#1a1408] via-[#0f0c06] to-[#050508]" },
];

const AMBIENT_PRESETS = [
  { label: "Blue glow", value: "from-[#2D6BFF]/25 to-transparent" },
  { label: "Rose", value: "from-[#ff4d6d]/12 to-transparent" },
  { label: "Soft white", value: "from-white/5 to-transparent" },
  { label: "Violet", value: "from-violet-400/15 to-transparent" },
  { label: "Emerald", value: "from-emerald-400/12 to-transparent" },
  { label: "Amber", value: "from-amber-200/10 to-transparent" },
];

type Props = { mode: "create" } | { mode: "edit"; slug: string };

function emptyForm(): Omit<AdminArtistDTO, "createdAt" | "updatedAt"> {
  return {
    slug: "",
    name: "",
    statusTag: "AVAILABLE",
    gradient: GRADIENT_PRESETS[0]!.value,
    ambient: AMBIENT_PRESETS[0]!.value,
    profileImage: "",
    coverImage: "",
    aboutLead: "",
    aboutMore: null,
    archived: false,
    sortOrder: 100,
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

export function AdminArtistEditor(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlFields, setShowUrlFields] = useState(false);

  const resolvedSlug = useMemo(() => {
    if (isEdit) return form.slug.trim().toLowerCase();
    return (slugTouched ? form.slug : slugifyArtistName(form.name)).trim().toLowerCase();
  }, [form.slug, form.name, isEdit, slugTouched]);

  const slugReady = isValidArtistSlugFormat(resolvedSlug);
  const isLegacy = isLegacyFilesystemArtistSlug(resolvedSlug);
  const imageDefaults = useMemo(() => defaultArtistImages(resolvedSlug || "artist"), [resolvedSlug]);

  const previewProfile = form.profileImage.trim() || (isLegacy ? imageDefaults.profileImage : "");
  const previewCover = form.coverImage.trim() || (isLegacy ? imageDefaults.coverImage : previewProfile);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/artists/${encodeURIComponent(props.slug)}`, {
          credentials: "include",
          cache: "no-store",
        });
        const body = (await res.json()) as { ok?: boolean; artist?: AdminArtistDTO; error?: string };
        if (!res.ok || !body.ok || !body.artist) throw new Error(body.error ?? "Not found");
        if (cancelled) return;
        const a = body.artist;
        setForm({
          slug: a.slug,
          name: a.name,
          statusTag: a.statusTag,
          gradient: a.gradient,
          ambient: a.ambient,
          profileImage: a.profileImage,
          coverImage: a.coverImage,
          aboutLead: a.aboutLead,
          aboutMore: a.aboutMore,
          archived: a.archived,
          sortOrder: a.sortOrder,
        });
        setSlugTouched(true);
        const legacy = isLegacyFilesystemArtistSlug(a.slug);
        const hasCustomUrls =
          (a.profileImage && !a.profileImage.includes("/api/artist-avatar/")) ||
          (a.coverImage && !a.coverImage.includes("/api/artist-cover/"));
        if (!legacy || hasCustomUrls) setShowUrlFields(true);
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

  const uploadProfile = useCallback(
    (file: File) => uploadArtistImage(file, resolvedSlug, "profile"),
    [resolvedSlug],
  );
  const uploadCover = useCallback(
    (file: File) => uploadArtistImage(file, resolvedSlug, "cover"),
    [resolvedSlug],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const name = form.name.trim();
      if (!name) throw new Error("Display name is required.");

      const slug = isEdit
        ? form.slug.trim().toLowerCase()
        : (slugTouched ? form.slug : slugifyArtistName(form.name)).trim().toLowerCase();

      if (!isValidArtistSlugFormat(slug)) {
        throw new Error("Slug must be at least 2 characters (letters, numbers, hyphens).");
      }

      const legacy = isLegacyFilesystemArtistSlug(slug);
      const defaults = defaultArtistImages(slug);
      const profileImage = form.profileImage.trim() || (legacy ? defaults.profileImage : "");
      const coverImage = form.coverImage.trim() || (legacy ? defaults.coverImage : "");

      if (!profileImage) {
        throw new Error("Upload a profile photo (or set a profile image URL).");
      }
      if (!coverImage) {
        throw new Error("Upload a cover image (or set a cover image URL).");
      }

      const payload = {
        ...form,
        slug,
        name,
        profileImage,
        coverImage,
      };

      const res = await fetch(
        isEdit ? `/api/admin/artists/${encodeURIComponent(form.slug)}` : "/api/admin/artists",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = (await res.json()) as { ok?: boolean; artist?: AdminArtistDTO; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");

      router.push("/admin/artists");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, router, slugTouched]);

  if (loading) {
    return <p className={adminMuted}>Loading artist…</p>;
  }

  const uploadHint = slugReady
    ? "Saved to Supabase storage and linked on save."
    : "Enter a display name or slug (2+ characters) before uploading.";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? `Edit ${form.name || "artist"}` : "New artist"}
        description="Upload profile and cover images, then save. All fields are stored in Supabase and power the home carousel, search, and artist shop pages."
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(320px,100%)]">
        <div className="space-y-6">
          <Section title="Basics" subtitle="Name, slug, and storefront visibility.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Display name</span>
                <input
                  className={adminInputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Artist name"
                />
              </label>

              {!isEdit ? (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">URL slug</span>
                  <input
                    className={adminInputClass}
                    value={slugTouched ? form.slug : slugifyArtistName(form.name)}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    placeholder="artist-slug"
                  />
                  <p className={`mt-1 text-[12px] ${adminMuted}`}>
                    Shop URL: /artist/{resolvedSlug || "…"}
                  </p>
                </label>
              ) : (
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Slug</span>
                  <p className="font-mono text-[13px] text-[#6d7175]">{form.slug}</p>
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Status</span>
                <select
                  className={adminInputClass}
                  value={form.statusTag}
                  onChange={(e) => setForm((f) => ({ ...f, statusTag: e.target.value as ArtistStatusTag }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Sort order</span>
                <input
                  type="number"
                  className={adminInputClass}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                />
                <p className={`mt-1 text-[12px] ${adminMuted}`}>Lower numbers appear first on home.</p>
              </label>

              {isEdit ? (
                <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.archived}
                    onChange={(e) => setForm((f) => ({ ...f, archived: e.target.checked }))}
                    className="size-4 rounded border-[#c9cccf]"
                  />
                  <span className="text-[13px] text-[#202223]">Archived (hidden from storefront)</span>
                </label>
              ) : null}
            </div>
          </Section>

          <Section title="Images" subtitle={uploadHint}>
            <AdminImageDropzone
              label="Profile photo"
              hint="Square · shown on cards and the artist header"
              aspect="square"
              value={form.profileImage.trim() || null}
              onChange={(url) => setForm((f) => ({ ...f, profileImage: url ?? "" }))}
              onUpload={uploadProfile}
              disabled={!slugReady || saving}
            />
            <AdminImageDropzone
              label="Cover image"
              hint="Wide banner · top of the artist shop page"
              aspect="banner"
              value={form.coverImage.trim() || null}
              onChange={(url) => setForm((f) => ({ ...f, coverImage: url ?? "" }))}
              onUpload={uploadCover}
              disabled={!slugReady || saving}
            />

            <button
              type="button"
              onClick={() => setShowUrlFields((v) => !v)}
              className="text-[12px] font-semibold text-[#2D6BFF] hover:underline"
            >
              {showUrlFields ? "Hide image URLs" : "Use image URL instead"}
            </button>

            {showUrlFields ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Profile image URL</span>
                  <input
                    className={adminInputClass}
                    value={form.profileImage}
                    onChange={(e) => setForm((f) => ({ ...f, profileImage: e.target.value }))}
                    placeholder={isLegacy ? imageDefaults.profileImage : "https://…"}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Cover image URL</span>
                  <input
                    className={adminInputClass}
                    value={form.coverImage}
                    onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                    placeholder={isLegacy ? imageDefaults.coverImage : "https://…"}
                  />
                </label>
              </div>
            ) : null}

            {isLegacy ? (
              <p className={`text-[12px] ${adminMuted}`}>
                This is a legacy catalog artist — filesystem avatars are used if you skip uploads.
              </p>
            ) : (
              <p className={`text-[12px] ${adminMuted}`}>
                New artists need uploaded images (stored in Supabase) so the storefront can load them.
              </p>
            )}
          </Section>

          <Section title="Look & copy" subtitle="Gradient accents and about text on the shop page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Gradient</span>
                <select
                  className={adminInputClass}
                  value={form.gradient}
                  onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
                >
                  {GRADIENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">Ambient glow</span>
                <select
                  className={adminInputClass}
                  value={form.ambient}
                  onChange={(e) => setForm((f) => ({ ...f, ambient: e.target.value }))}
                >
                  {AMBIENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">About (short)</span>
                <textarea
                  rows={3}
                  className={`${adminInputClass} min-h-[88px] resize-y`}
                  value={form.aboutLead}
                  onChange={(e) => setForm((f) => ({ ...f, aboutLead: e.target.value }))}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#202223]">About (read more)</span>
                <textarea
                  rows={4}
                  className={`${adminInputClass} min-h-[100px] resize-y`}
                  value={form.aboutMore ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, aboutMore: e.target.value || null }))}
                />
              </label>
            </div>
          </Section>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={saving} onClick={() => void save()} className={adminBtnPrimary}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create artist"}
            </button>
            <Link href="/admin/artists" className={adminBtnSecondary}>
              Cancel
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d7175]">Preview</p>
          <AdminArtistProfilePreview
            name={form.name}
            statusTag={form.statusTag}
            profileImage={previewProfile}
            coverImage={previewCover}
            gradient={form.gradient}
            ambient={form.ambient}
            aboutLead={form.aboutLead}
          />
        </aside>
      </div>
    </div>
  );
}
