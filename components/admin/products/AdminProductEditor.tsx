"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { AdminArtistSelect } from "@/components/admin/products/AdminArtistSelect";
import { AdminColorVariantsEditor } from "@/components/admin/products/AdminColorVariantsEditor";
import { AdminImageDropzone } from "@/components/admin/products/AdminImageDropzone";
import { AdminModelImagesDropzone } from "@/components/admin/products/AdminModelImagesDropzone";
import { AdminProductPreviewGallery } from "@/components/admin/products/AdminProductPreviewGallery";
import { AdminPublishChecklist } from "@/components/admin/products/AdminPublishChecklist";
import { ProductBarcodePanel } from "@/components/admin/products/ProductBarcodePanel";
import { AdminSizeSelector } from "@/components/admin/products/AdminSizeSelector";
import { metadataToDb } from "@/lib/admin/product-metadata";
import { PRODUCT_BADGE_PRESETS } from "@/lib/admin/product-metadata";
import type { ProductColorOption } from "@/lib/admin/product-metadata";
import type { CatalogArtistOption } from "@/lib/admin/catalog-artists";
import { getCatalogArtists } from "@/lib/admin/catalog-artists";
import {
  hydrateColorVariants,
  normalizeColorsForSave,
  primaryProductImages,
  productHasColorVariantImages,
  slotsFromColor,
} from "@/lib/admin/product-color-variants";
import { mergeProductImages, splitProductImages } from "@/lib/admin/product-images";
import { buildAdminProductMagicFill } from "@/lib/admin/product-magic-fill";
import { formatSalvyaSkuHuman, resolveSalvyaGtin13 } from "@/lib/barcode/salvya-gtin";
import { slugifyTitle } from "@/lib/admin/types";
import type { AdminProductDTO, PublishState } from "@/lib/admin/types";

const labelClass = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d7175]";
const fieldClass = `mt-1.5 w-full ${adminInputClass}`;

type Props = { mode: "create" | "edit"; productId?: string };

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {hint ? <p className={`mt-0.5 text-[12px] ${adminMuted}`}>{hint}</p> : null}
      {children}
    </label>
  );
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

const PUBLISH_OPTIONS: { id: PublishState; label: string; desc: string }[] = [
  { id: "draft", label: "Draft", desc: "Hidden from shop" },
  { id: "published", label: "Published", desc: "Live on storefront" },
  { id: "archived", label: "Archived", desc: "No longer sold" },
];

const CATEGORIES = [
  { id: "hoodie", label: "Hoodie" },
  { id: "tee", label: "Tee" },
  { id: "accessories", label: "Accessories" },
  { id: "other", label: "Other" },
] as const;

export function AdminProductEditor({ mode, productId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artistSlug, setArtistSlug] = useState("");
  const [slug, setSlug] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [category, setCategory] = useState("hoodie");
  const [stock, setStock] = useState("0");
  const [imageFront, setImageFront] = useState<string | null>(null);
  const [imageBack, setImageBack] = useState<string | null>(null);
  const [modelImages, setModelImages] = useState<string[]>([]);
  const [limited, setLimited] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("draft");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [sku, setSku] = useState("");
  const [compareAtEuros, setCompareAtEuros] = useState("");
  const [sizeFit, setSizeFit] = useState("");
  const [material, setMaterial] = useState("");
  const [featured, setFeatured] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColorOption[]>([]);
  const [careInstructions, setCareInstructions] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [maxPerOrder, setMaxPerOrder] = useState("");
  const [preorder, setPreorder] = useState(false);
  const [preorderShipDate, setPreorderShipDate] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [catalogArtists, setCatalogArtists] = useState<CatalogArtistOption[]>(() => getCatalogArtists());
  const [magicMsg, setMagicMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/artists?catalog=1", { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; artists?: CatalogArtistOption[] };
        if (!cancelled && res.ok && body.ok && body.artists?.length) {
          setCatalogArtists(body.artists);
        }
      } catch {
        /* keep static fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const legacySlots = useMemo(
    () => ({ front: imageFront, back: imageBack, models: modelImages }),
    [imageBack, imageFront, modelImages],
  );

  const images = useMemo(
    () => primaryProductImages(colors, legacySlots),
    [colors, legacySlots],
  );

  const savedColors = useMemo(() => normalizeColorsForSave(colors, legacySlots), [colors, legacySlots]);

  const usePerColorPhotos = colors.length > 0;

  const previewSlots = useMemo(() => {
    if (usePerColorPhotos) {
      const first = colors.find((c) => c.front?.trim()) ?? colors[0];
      return first ? slotsFromColor(first) : legacySlots;
    }
    return legacySlots;
  }, [colors, legacySlots, usePerColorPhotos]);

  const previewSlug = slug.trim() || (title.trim() ? slugifyTitle(title) : "your-product");
  const skuFormatted = useMemo(() => {
    const gtin = resolveSalvyaGtin13({
      sku,
      slug: slug || previewSlug,
      artistSlug,
      category,
    });
    return gtin ? formatSalvyaSkuHuman(gtin) : null;
  }, [sku, slug, previewSlug, artistSlug, category]);
  const previewPath = artistSlug.trim()
    ? `/artist/${artistSlug.trim()}/${category === "tee" ? "tshirt" : "item"}/${previewSlug}`
    : null;

  const pricePreview = useMemo(() => {
    const price = parseFloat(priceEuros.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(price);
  }, [priceEuros]);

  const comparePreview = useMemo(() => {
    const price = parseFloat(compareAtEuros.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) return null;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(price);
  }, [compareAtEuros]);

  const buildMetadata = useCallback(() => {
    const compareAt = parseFloat(compareAtEuros.replace(",", "."));
    const max = parseInt(maxPerOrder, 10);
    return metadataToDb({
      sku: sku.trim() || undefined,
      compareAtCents: Number.isFinite(compareAt) && compareAt > 0 ? Math.round(compareAt * 100) : undefined,
      sizeFit: sizeFit.trim() || undefined,
      material: material.trim() || undefined,
      featured: featured || undefined,
      subtitle: subtitle.trim() || undefined,
      badge: badge.trim() || undefined,
      sizes: sizes.length ? sizes : undefined,
      colors: savedColors.length ? savedColors : undefined,
      careInstructions: careInstructions.trim() || undefined,
      shippingNote: shippingNote.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      maxPerOrder: Number.isFinite(max) && max > 0 ? max : undefined,
      preorder: preorder || undefined,
      preorderShipDate: preorder && preorderShipDate ? preorderShipDate : undefined,
    });
  }, [
    badge,
    careInstructions,
    savedColors,
    compareAtEuros,
    featured,
    material,
    maxPerOrder,
    metaDescription,
    metaTitle,
    preorder,
    preorderShipDate,
    shippingNote,
    sizeFit,
    sizes,
    sku,
    subtitle,
  ]);

  const checklist = useMemo(() => {
    const price = parseFloat(priceEuros.replace(",", "."));
    const stockN = parseInt(stock, 10);
    return [
      { id: "title", label: "Product title", ok: Boolean(title.trim()), hint: "Add a title" },
      { id: "artist", label: "Artist selected", ok: Boolean(artistSlug.trim()), hint: "Pick from catalog" },
      { id: "price", label: "Valid price", ok: Number.isFinite(price) && price >= 0, hint: "Enter EUR price" },
      {
        id: "front",
        label: usePerColorPhotos ? "Colorway front image" : "Front image",
        ok: usePerColorPhotos ? colors.some((c) => c.front?.trim()) : Boolean(imageFront),
        hint: usePerColorPhotos ? "Upload front for at least one colorway" : "Upload front photo",
      },
      { id: "stock", label: "Stock tracked", ok: Number.isFinite(stockN) && stockN >= 0, hint: "Set quantity" },
    ];
  }, [artistSlug, colors, imageFront, priceEuros, stock, title, usePerColorPhotos]);

  const readyToPublish = checklist.every((c) => c.ok);

  const uploadProductImage = useCallback(
    async (file: File): Promise<string> => {
      if (!artistSlug.trim()) throw new Error("Select an artist before uploading images");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("artistSlug", artistSlug.trim());
      const res = await fetch("/api/admin/upload/product-image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const body = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !body.ok || !body.url) throw new Error(body.error ?? "Upload failed");
      return body.url;
    },
    [artistSlug],
  );

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products/${productId}`, { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; product?: AdminProductDTO; error?: string };
        if (!res.ok || !body.ok || !body.product) throw new Error(body.error ?? "Not found");
        if (cancelled) return;
        const p = body.product;
        setTitle(p.title);
        setDescription(p.description ?? "");
        setArtistSlug(p.artistSlug);
        setSlug(p.slug);
        slugTouched.current = true;
        setPriceEuros(String(p.priceCents / 100));
        setCategory(p.category);
        setStock(String(p.stock));
        const loadedColors = p.colors ?? [];
        if (loadedColors.length) {
          const hydrated = hydrateColorVariants(loadedColors, p.images);
          setColors(hydrated);
          const slots = splitProductImages(p.images);
          if (productHasColorVariantImages(hydrated)) {
            setImageFront(null);
            setImageBack(null);
            setModelImages([]);
          } else {
            setImageFront(slots.front);
            setImageBack(slots.back);
            setModelImages(slots.models);
          }
        } else {
          setColors([]);
          const slots = splitProductImages(p.images);
          setImageFront(slots.front);
          setImageBack(slots.back);
          setModelImages(slots.models);
        }
        setLimited(p.isLimitedDrop);
        setPublishState(p.publishState ?? (p.published ? "published" : "draft"));
        setLowStockThreshold(String(p.lowStockThreshold ?? 5));
        setSku(p.sku ?? "");
        setCompareAtEuros(p.compareAtCents ? String(p.compareAtCents / 100) : "");
        setSizeFit(p.sizeFit ?? "");
        setMaterial(p.material ?? "");
        setFeatured(p.featured ?? false);
        setSubtitle(p.subtitle ?? "");
        setBadge(p.badge ?? "");
        setSizes(p.sizes ?? []);
        setCareInstructions(p.careInstructions ?? "");
        setShippingNote(p.shippingNote ?? "");
        setMetaTitle(p.metaTitle ?? "");
        setMetaDescription(p.metaDescription ?? "");
        setMaxPerOrder(p.maxPerOrder != null ? String(p.maxPerOrder) : "");
        setPreorder(p.preorder ?? false);
        setPreorderShipDate(p.preorderShipDate ?? "");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched.current) setSlug(slugifyTitle(v));
  };

  const applyMagicFill = useCallback(() => {
    const fill = buildAdminProductMagicFill({
      artistSlug: artistSlug || catalogArtists[0]?.slug,
      category,
      title: title.trim() || undefined,
    });
    setTitle(fill.title);
    setSubtitle(fill.subtitle);
    setDescription(fill.description);
    setArtistSlug(fill.artistSlug);
    slugTouched.current = true;
    setSlug(fill.slug);
    setPriceEuros(fill.priceEuros);
    setCategory(fill.category);
    setStock(fill.stock);
    setSku(fill.sku);
    setCompareAtEuros(fill.compareAtEuros);
    setSizeFit(fill.sizeFit);
    setMaterial(fill.material);
    setFeatured(fill.featured);
    setBadge(fill.badge);
    setSizes(fill.sizes);
    setColors(fill.colors);
    setCareInstructions(fill.careInstructions);
    setShippingNote(fill.shippingNote);
    setMetaTitle(fill.metaTitle);
    setMetaDescription(fill.metaDescription);
    setMaxPerOrder(fill.maxPerOrder);
    setLimited(fill.limited);
    setLowStockThreshold(fill.lowStockThreshold);
    setPreorder(false);
    setPreorderShipDate("");
    setMagicMsg("All fields filled — upload front & back photos (per color) to publish.");
    setError(null);
  }, [artistSlug, catalogArtists, category, title]);

  const submit = useCallback(
    async (targetPublish?: PublishState) => {
      setSaving(true);
      setError(null);
      const state = targetPublish ?? publishState;
      try {
        const price = parseFloat(priceEuros.replace(",", "."));
        if (!title.trim()) throw new Error("Title is required");
        if (!artistSlug.trim()) throw new Error("Select an artist from the catalog");
        if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price");
        if (!images.length) {
          throw new Error(
            usePerColorPhotos
              ? "Add a front image for at least one colorway"
              : "Add at least a front product image",
          );
        }

        const metadata = buildMetadata();

        const payload = {
          title: title.trim(),
          description: description.trim() || undefined,
          artistSlug: artistSlug.trim().toLowerCase(),
          slug: slug.trim() || undefined,
          priceEuros: price,
          category,
          stock: parseInt(stock, 10) || 0,
          images,
          isLimitedDrop: limited,
          publishState: state,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          metadata,
        };

        if (mode === "create") {
          const res = await fetch("/api/admin/products", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const body = (await res.json()) as { ok?: boolean; product?: AdminProductDTO; error?: string };
          if (!res.ok || !body.ok || !body.product) throw new Error(body.error ?? "Create failed");
          router.push(`/admin/products/${body.product.id}`);
          router.refresh();
        } else if (productId) {
          const res = await fetch(`/api/admin/products/${productId}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const body = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setSaving(false);
      }
    },
    [
      artistSlug,
      buildMetadata,
      category,
      description,
      images,
      limited,
      lowStockThreshold,
      mode,
      priceEuros,
      productId,
      publishState,
      router,
      slug,
      stock,
      title,
    ],
  );

  const duplicateProduct = useCallback(async () => {
    if (mode !== "edit" || !productId) return;
    setSaving(true);
    setError(null);
    try {
      const price = parseFloat(priceEuros.replace(",", "."));
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title.trim()} (copy)`,
          description: description.trim() || undefined,
          artistSlug: artistSlug.trim().toLowerCase(),
          priceEuros: Number.isFinite(price) ? price : 0,
          category,
          stock: parseInt(stock, 10) || 0,
          images,
          isLimitedDrop: limited,
          publishState: "draft",
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          metadata: buildMetadata(),
        }),
      });
      const body = (await res.json()) as { ok?: boolean; product?: AdminProductDTO; error?: string };
      if (!res.ok || !body.ok || !body.product) throw new Error(body.error ?? "Duplicate failed");
      router.push(`/admin/products/${body.product.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duplicate failed");
    } finally {
      setSaving(false);
    }
  }, [
    artistSlug,
    buildMetadata,
    category,
    description,
    images,
    limited,
    lowStockThreshold,
    mode,
    priceEuros,
    productId,
    router,
    stock,
    title,
  ]);

  const deleteProduct = useCallback(async () => {
    if (!productId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE", credentials: "include" });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Delete failed");
      setShowDeleteConfirm(false);
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [productId, router]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 rounded-xl bg-[#e3e5e7]/60" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="h-[480px] rounded-xl bg-[#e3e5e7]/60" />
          <div className="h-[320px] rounded-xl bg-[#e3e5e7]/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <AdminPageHeader
        title={mode === "create" ? "New product" : "Edit product"}
        description={
          mode === "create"
            ? "Use Magic fill for a full template, add photos, then save or publish."
            : "Update catalog details, inventory, and visibility."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {mode === "create" ? (
              <button
                type="button"
                disabled={saving}
                onClick={applyMagicFill}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 text-[13px] font-semibold text-violet-900 shadow-sm transition-colors hover:from-violet-100 hover:to-indigo-100 disabled:opacity-50"
              >
                <span aria-hidden>✨</span>
                Magic fill
              </button>
            ) : null}
            {mode === "edit" ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void duplicateProduct()}
                  className={`${adminBtnSecondary} min-h-[40px]`}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="min-h-[40px] rounded-lg border border-rose-200 bg-rose-50 px-4 text-[13px] font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </>
            ) : null}
            <Link href="/admin/products" className={`${adminBtnSecondary} min-h-[40px]`}>
              Cancel
            </Link>
          </div>
        }
      />

      {magicMsg ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-[13px] text-violet-900">{magicMsg}</div>
      ) : null}
      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Section title="Product details" subtitle="What customers see on the product page">
            <Field label="Title" hint="Shown on the shop and checkout">
              <input className={fieldClass} value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Oversized hoodie — Night" />
            </Field>
            <Field label="Subtitle" hint="Short line under the title on the product page">
              <input
                className={fieldClass}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Limited tour edition"
                maxLength={120}
              />
            </Field>
            <Field label="Description" hint="Optional — sizing, fabric, story">
              <textarea
                className={`${fieldClass} min-h-[120px] resize-y py-3`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Heavy fleece, relaxed fit…"
              />
            </Field>
            <Field label="Artist" hint="Only artists in your Salvya catalog — shop must already exist">
              <AdminArtistSelect value={artistSlug} onChange={setArtistSlug} artists={catalogArtists} />
            </Field>
            <Field label="URL slug" hint="Auto-generated from title until you edit">
              <input
                className={fieldClass}
                value={slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder={slugifyTitle(title) || "product-slug"}
              />
            </Field>
          </Section>

          <Section title="Pricing & inventory">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (EUR)">
                <input className={fieldClass} inputMode="decimal" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} placeholder="49" />
              </Field>
              <Field label="Stock quantity">
                <input className={fieldClass} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
              </Field>
            </div>
            <Field label="Low stock alert" hint="Shows low-stock badge at or below this count">
              <input
                className={fieldClass}
                inputMode="numeric"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </Field>
            <div>
              <span className={labelClass}>Category</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                      category === c.id
                        ? "border-[#2D6BFF] bg-[#eef4ff] text-[#2D6BFF]"
                        : "border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf] hover:text-[#202223]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-4 py-3">
              <input
                type="checkbox"
                checked={limited}
                onChange={(e) => setLimited(e.target.checked)}
                className="size-4 rounded border-[#c9cccf] text-[#2D6BFF] focus:ring-[#2D6BFF]/25"
              />
              <span className="text-[14px] font-medium text-[#202223]">Limited drop</span>
            </label>
          </Section>

          <Section
            title="Photos & colorways"
            subtitle="Black, White, or other colors — each with its own front, back, and model photos"
          >
            {!artistSlug.trim() ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                Choose an artist above to enable uploads.
              </p>
            ) : null}
            <AdminColorVariantsEditor
              value={colors}
              onChange={setColors}
              onUpload={uploadProductImage}
              disabled={!artistSlug.trim()}
            />
            {!usePerColorPhotos ? (
              <div className="mt-6 space-y-4 border-t border-[#e3e5e7] pt-6">
                <p className={`text-[13px] font-medium text-[#202223]`}>Single-color product</p>
                <p className={`text-[12px] ${adminMuted}`}>
                  No colorways yet — use these fields for one color only, or click <strong>+ Black</strong> /{" "}
                  <strong>+ White</strong> above.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminImageDropzone
                    label="Front (flat lay)"
                    hint="Main card image"
                    value={imageFront}
                    onChange={setImageFront}
                    onUpload={uploadProductImage}
                    disabled={!artistSlug.trim()}
                  />
                  <AdminImageDropzone
                    label="Back"
                    hint="Back of garment"
                    value={imageBack}
                    onChange={setImageBack}
                    onUpload={uploadProductImage}
                    disabled={!artistSlug.trim()}
                  />
                </div>
                <AdminModelImagesDropzone
                  values={modelImages}
                  onChange={setModelImages}
                  onUpload={uploadProductImage}
                  disabled={!artistSlug.trim()}
                />
              </div>
            ) : null}
            <p className={`mt-4 text-[12px] ${adminMuted}`}>
              {images.length} photo{images.length === 1 ? "" : "s"} saved · storefront gallery: front → back → models
              per color
            </p>
          </Section>

          <Section title="Merchandising" subtitle="SKU, compare-at price, and extra copy for the product page">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU / GTIN" hint="13-digit retail code — auto-filled on catalog sync">
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.replace(/\D/g, ""))}
                  placeholder="8437012000145"
                />
                {skuFormatted ? (
                  <p className={`mt-1.5 font-mono text-[12px] tracking-wide tabular-nums text-[#202223]`}>{skuFormatted}</p>
                ) : null}
              </Field>
              <Field label="Compare-at price (EUR)" hint="Shows as strikethrough when higher than sale price">
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  value={compareAtEuros}
                  onChange={(e) => setCompareAtEuros(e.target.value)}
                  placeholder="59"
                />
              </Field>
            </div>
            <ProductBarcodePanel
              sku={sku}
              slug={slug || previewSlug}
              artistSlug={artistSlug}
              category={category}
              title={title}
            />
            <Field label="Material" hint="Fabric composition — optional">
              <input
                className={fieldClass}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="100% organic cotton fleece, 400gsm"
              />
            </Field>
            <Field label="Size & fit" hint="Sizing notes for customers">
              <textarea
                className={`${fieldClass} min-h-[88px] resize-y py-3`}
                value={sizeFit}
                onChange={(e) => setSizeFit(e.target.value)}
                placeholder="Oversized fit — size down for a regular look. Model is 1m82 wearing L."
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-4 py-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 rounded border-[#c9cccf] text-[#2D6BFF] focus:ring-[#2D6BFF]/25"
              />
              <span>
                <span className="block text-[14px] font-medium text-[#202223]">Featured product</span>
                <span className={`text-[12px] ${adminMuted}`}>Highlight in home feed and recommendations (when wired)</span>
              </span>
            </label>
            <div>
              <span className={labelClass}>Product badge</span>
              <p className={`mt-0.5 text-[12px] ${adminMuted}`}>Shown on the product image</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBadge("")}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${
                    !badge.trim() ? "border-[#2D6BFF] bg-[#eef4ff] text-[#2D6BFF]" : "border-[#e3e5e7] text-[#6d7175]"
                  }`}
                >
                  None
                </button>
                {PRODUCT_BADGE_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${
                      badge === b ? "border-[#2D6BFF] bg-[#eef4ff] text-[#2D6BFF]" : "border-[#e3e5e7] text-[#6d7175]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                className={`${fieldClass} mt-2`}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Custom badge"
                maxLength={32}
              />
            </div>
          </Section>

          <Section title="Variants" subtitle="Sizes shoppers can choose at checkout">
            <Field label="Available sizes">
              <AdminSizeSelector value={sizes} onChange={setSizes} />
            </Field>
            <Field label="Max per order" hint="Leave empty for no limit">
              <input
                className={fieldClass}
                inputMode="numeric"
                value={maxPerOrder}
                onChange={(e) => setMaxPerOrder(e.target.value.replace(/\D/g, ""))}
                placeholder="2"
              />
            </Field>
          </Section>

          <Section title="Shipping & care">
            <Field label="Shipping note" hint="Processing time or delivery expectation">
              <input
                className={fieldClass}
                value={shippingNote}
                onChange={(e) => setShippingNote(e.target.value)}
                placeholder="Ships in 3–5 business days from EU"
              />
            </Field>
            <Field label="Care instructions">
              <textarea
                className={`${fieldClass} min-h-[80px] resize-y py-3`}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Machine wash cold, inside out. Do not tumble dry."
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-4 py-3">
              <input
                type="checkbox"
                checked={preorder}
                onChange={(e) => setPreorder(e.target.checked)}
                className="size-4 rounded border-[#c9cccf] text-[#2D6BFF] focus:ring-[#2D6BFF]/25"
              />
              <span className="text-[14px] font-medium text-[#202223]">Preorder</span>
            </label>
            {preorder ? (
              <Field label="Expected ship date">
                <input
                  type="date"
                  className={fieldClass}
                  value={preorderShipDate}
                  onChange={(e) => setPreorderShipDate(e.target.value)}
                />
              </Field>
            ) : null}
          </Section>

          <Section title="SEO" subtitle="Search and social sharing">
            <Field label="SEO title" hint={`${metaTitle.length}/70 — defaults to product title`}>
              <input className={fieldClass} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70} placeholder={title || "Product title"} />
            </Field>
            <Field label="SEO description" hint={`${metaDescription.length}/160`}>
              <textarea
                className={`${fieldClass} min-h-[72px] resize-y py-3`}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                placeholder="Official artist merch — limited run."
              />
            </Field>
          </Section>

          <Section title="Visibility">
            <div className="grid gap-2 sm:grid-cols-3">
              {PUBLISH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPublishState(opt.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    publishState === opt.id
                      ? "border-[#2D6BFF] bg-[#eef4ff] ring-1 ring-[#2D6BFF]/25"
                      : "border-[#e3e5e7] bg-white hover:bg-[#f6f6f7]"
                  }`}
                >
                  <span className="block text-[13px] font-semibold text-[#202223]">{opt.label}</span>
                  <span className={`mt-0.5 block text-[11px] ${adminMuted}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <AdminPublishChecklist items={checklist} readyToPublish={readyToPublish} />
          <AdminProductPreviewGallery
            front={previewSlots.front}
            back={previewSlots.back}
            models={previewSlots.models}
            title={title}
            subtitle={subtitle}
            badge={badge}
            priceLabel={pricePreview}
            compareLabel={comparePreview}
            sizes={sizes}
            colors={colors}
          />
          {previewPath ? (
            <p className="break-all rounded-lg border border-[#e3e5e7] bg-white px-3 py-2 font-mono text-[10px] text-[#8c9196]">{previewPath}</p>
          ) : null}
          <p className={`text-[11px] ${adminMuted}`}>
            {artistSlug || "artist"} · {category} · {stock} in stock · {publishState}
            {limited ? " · limited" : ""}
            {preorder ? " · preorder" : ""}
          </p>
          <section className={`${adminPanelClass} hidden lg:block`}>
            <div className="space-y-2 p-4">
              {mode === "create" ? (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={applyMagicFill}
                    className="w-full min-h-[44px] rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 text-[13px] font-semibold text-violet-900 hover:from-violet-100 hover:to-indigo-100 disabled:opacity-50"
                  >
                    ✨ Magic fill all
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void submit("draft")}
                    className={`w-full ${adminBtnSecondary} min-h-[44px]`}
                  >
                    Save as draft
                  </button>
                  <button
                    type="button"
                    disabled={saving || !readyToPublish}
                    onClick={() => void submit("published")}
                    className={`w-full ${adminBtnPrimary} min-h-[44px]`}
                    title={readyToPublish ? undefined : "Complete the checklist first"}
                  >
                    {saving ? "Saving…" : "Publish product"}
                  </button>
                </>
              ) : (
                <button type="button" disabled={saving} onClick={() => void submit()} className={`w-full ${adminBtnPrimary} min-h-[44px]`}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e3e5e7] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          {mode === "create" ? (
            <>
              <button type="button" disabled={saving} onClick={() => void submit("draft")} className={`flex-1 ${adminBtnSecondary} min-h-[44px]`}>
                Draft
              </button>
              <button
                type="button"
                disabled={saving || !readyToPublish}
                onClick={() => void submit("published")}
                className={`flex-1 ${adminBtnPrimary} min-h-[44px]`}
              >
                {saving ? "…" : "Publish"}
              </button>
            </>
          ) : (
            <button type="button" disabled={saving} onClick={() => void submit()} className={`flex-1 ${adminBtnPrimary} min-h-[44px]`}>
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      <AdminConfirmDialog
        open={showDeleteConfirm}
        tone="danger"
        title="Delete this product?"
        description={
          title.trim()
            ? `“${title.trim()}” will be removed from the catalog permanently.`
            : "This product will be removed from the catalog permanently."
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        busy={deleting}
        onCancel={() => !deleting && setShowDeleteConfirm(false)}
        onConfirm={() => void deleteProduct()}
      />
    </div>
  );
}
