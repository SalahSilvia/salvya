"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  DEFAULT_ADMIN_PREFERENCES,
  type AdminUserPreferences,
} from "@/lib/admin/admin-preferences";
import type { StoreSettingsBundle } from "@/lib/admin/store-settings";
import { SHIPPING_CARRIER_OPTIONS } from "@/lib/admin/shipping-carriers";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SettingsSection = "account" | keyof StoreSettingsBundle;

const STORE_SECTIONS: { id: keyof StoreSettingsBundle; title: string; blurb: string }[] = [
  { id: "platform", title: "Platform", blurb: "Brand, locale, maintenance, and public URLs." },
  { id: "payments", title: "Payments", blurb: "Checkout methods and PayPal environment." },
  { id: "shipping", title: "Shipping", blurb: "Default carrier and fulfillment copy." },
  { id: "features", title: "Features", blurb: "Roll out product capabilities." },
  { id: "notifications", title: "Store alerts", blurb: "Operational email targets for the team." },
];

function initials(name: string, email: string | null) {
  const src = name.trim() || email || "A";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function AdminSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: meUser, preferences: mePrefs, refresh: refreshMe } = useAdminPreferences();
  const sectionParam = searchParams.get("section");
  const initialSection: SettingsSection =
    sectionParam === "account" || STORE_SECTIONS.some((s) => s.id === sectionParam)
      ? (sectionParam as SettingsSection)
      : "account";

  const [active, setActive] = useState<SettingsSection>(initialSection);
  const [settings, setSettings] = useState<StoreSettingsBundle | null>(null);
  const [prefsDraft, setPrefsDraft] = useState<AdminUserPreferences | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const setSection = (id: SettingsSection) => {
    setActive(id);
    setSaved(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", id);
    router.replace(`/admin/settings?${params.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes] = await Promise.all([
        fetch("/api/admin/settings", { credentials: "include", cache: "no-store" }),
        refreshMe(),
      ]);
      const settingsBody = (await settingsRes.json()) as { ok?: boolean; settings?: StoreSettingsBundle; error?: string };
      if (!settingsRes.ok || !settingsBody.ok || !settingsBody.settings) {
        throw new Error(settingsBody.error ?? "Failed to load store settings");
      }
      setSettings(settingsBody.settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [refreshMe]);

  const prefs = prefsDraft ?? mePrefs ?? DEFAULT_ADMIN_PREFERENCES;

  useEffect(() => {
    if (mePrefs) setPrefsDraft((current) => current ?? mePrefs);
  }, [mePrefs]);

  useEffect(() => {
    if (meUser) setDisplayName(meUser.displayName || "");
  }, [meUser]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (sectionParam && sectionParam !== active) {
      if (sectionParam === "account" || STORE_SECTIONS.some((s) => s.id === sectionParam)) {
        setActive(sectionParam as SettingsSection);
      }
    }
  }, [sectionParam, active]);

  const saveStoreSection = async () => {
    if (!settings || active === "account") return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: active, value: settings[active] }),
      });
      const body = (await res.json()) as { ok?: boolean; settings?: StoreSettingsBundle; error?: string };
      if (!res.ok || !body.ok || !body.settings) throw new Error(body.error ?? "Save failed");
      setSettings(body.settings);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAccount = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, preferences: prefs }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");
      await refreshMe();
      setSaved(true);
      window.dispatchEvent(new Event("salvya-admin-prefs-changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const copyId = async () => {
    if (!meUser?.id) return;
    try {
      await navigator.clipboard.writeText(meUser.id);
    } catch {
      /* ignore */
    }
  };

  const navItems = useMemo(
    () => [{ id: "account" as const, title: "Your account", blurb: "Profile, security, and alerts." }, ...STORE_SECTIONS],
    [],
  );

  const current = navItems.find((s) => s.id === active);
  const p = settings?.platform;
  const pay = settings?.payments;
  const ship = settings?.shipping;
  const feat = settings?.features;
  const notif = settings?.notifications;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Manage your admin account, store configuration, and operational alerts in one place."
        actions={
          <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
            Refresh
          </button>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      {loading ? <p className={adminMuted}>Loading settings…</p> : null}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className={`${adminPanelClass} flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible`}>
          {navItems.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`shrink-0 rounded-lg px-3 py-2.5 text-left transition-colors lg:w-full ${
                active === s.id
                  ? "bg-[#eef4ff] text-[#1a5ae8] shadow-[inset_0_0_0_1px_rgba(45,107,255,0.2)]"
                  : "text-[#6d7175] hover:bg-[#f6f6f7] hover:text-[#202223]"
              }`}
            >
              <p className="text-[13px] font-semibold">{s.title}</p>
              <p className="mt-0.5 hidden text-[11px] leading-snug opacity-80 lg:block">{s.blurb}</p>
            </button>
          ))}
        </nav>

        <section className={`${adminPanelClass} p-6 sm:p-8`}>
          {current ? (
            <>
              <h2 className="text-[17px] font-semibold text-[#202223]">{current.title}</h2>
              <p className={`mt-2 max-w-xl text-[13px] leading-relaxed ${adminMuted}`}>{current.blurb}</p>
            </>
          ) : null}

          {active === "account" && meUser ? (
            <div className="mt-8 space-y-8">
              <div className="flex flex-col gap-4 rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-5 sm:flex-row sm:items-center">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2D6BFF] text-[18px] font-bold text-white">
                  {initials(displayName, meUser.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#202223]">{displayName || meUser.email}</p>
                  <p className={`truncate text-[13px] ${adminMuted}`}>{meUser.email}</p>
                  <p className="mt-1 text-[12px] capitalize text-[#6d7175]">
                    {meUser.role} · {meUser.emailConfirmedAt ? "Email verified" : "Email not verified"}
                  </p>
                </div>
                <button type="button" onClick={() => void signOut()} className={adminBtnSecondary}>
                  Sign out
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] sm:col-span-2">
                  <span className="font-medium text-[#202223]">Display name</span>
                  <input
                    className={`mt-1 w-full ${adminInputClass}`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How your name appears in admin"
                  />
                </label>
                <div className="rounded-lg border border-[#e3e5e7] bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">User ID</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="truncate text-[12px] text-[#202223]">{meUser.id}</code>
                    <button type="button" onClick={() => void copyId()} className="shrink-0 text-[12px] font-semibold text-[#2D6BFF]">
                      Copy
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-[#e3e5e7] bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Last sign-in</p>
                  <p className="mt-1 text-[13px] text-[#202223]">{formatWhen(meUser.lastSignInAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[14px] font-semibold text-[#202223]">Your notification preferences</p>
                <p className={`mt-1 text-[12px] ${adminMuted}`}>Controls what you want highlighted in admin (email digests coming soon).</p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={prefs.notifyNewOrders}
                      onChange={(e) => setPrefsDraft({ ...prefs, notifyNewOrders: e.target.checked })}
                    />
                    <span className="font-medium text-[#202223]">Highlight new orders</span>
                  </label>
                  <label className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={prefs.notifyInfluencerApplications}
                      onChange={(e) => setPrefsDraft({ ...prefs, notifyInfluencerApplications: e.target.checked })}
                    />
                    <span className="font-medium text-[#202223]">Highlight creator applications</span>
                  </label>
                  <label className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={prefs.notifyLowStock}
                      onChange={(e) => setPrefsDraft({ ...prefs, notifyLowStock: e.target.checked })}
                    />
                    <span className="font-medium text-[#202223]">Highlight low stock</span>
                  </label>
                  <label className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={prefs.compactNav}
                      onChange={(e) => setPrefsDraft({ ...prefs, compactNav: e.target.checked })}
                    />
                    <span className="font-medium text-[#202223]">Compact navigation (preview)</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[14px] font-semibold text-[#202223]">Security</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/update-password" className={adminBtnSecondary}>
                    Change password
                  </Link>
                  <Link href="/forgot-password" className={adminBtnSecondary}>
                    Reset via email
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[14px] font-semibold text-[#202223]">Quick links</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/admin/emails" className={adminBtnSecondary}>
                    Email center
                  </Link>
                  <Link href="/admin/creator-applications" className={adminBtnSecondary}>
                    Influencers
                  </Link>
                  <Link href="/account/profile" className={adminBtnSecondary}>
                    Storefront profile
                  </Link>
                  <Link href="/" className={adminBtnSecondary}>
                    Storefront home
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[#e3e5e7] pt-6">
                <button type="button" disabled={saving} onClick={() => void saveAccount()} className={adminBtnPrimary}>
                  {saving ? "Saving…" : "Save account"}
                </button>
                {saved ? <span className="text-[13px] font-medium text-emerald-700">Saved</span> : null}
              </div>
            </div>
          ) : null}

          {settings && active === "platform" && p ? (
            <div className="mt-8 space-y-4">
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Store name</span>
                <input
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={p.storeName}
                  onChange={(e) => setSettings({ ...settings, platform: { ...p, storeName: e.target.value } })}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px]">
                  <span className="font-medium text-[#202223]">Default locale</span>
                  <input
                    className={`mt-1 w-full ${adminInputClass}`}
                    value={p.defaultLocale}
                    onChange={(e) => setSettings({ ...settings, platform: { ...p, defaultLocale: e.target.value } })}
                  />
                </label>
                <label className="block text-[13px]">
                  <span className="font-medium text-[#202223]">Currency</span>
                  <input
                    className={`mt-1 w-full ${adminInputClass}`}
                    value={p.currency}
                    onChange={(e) => setSettings({ ...settings, platform: { ...p, currency: e.target.value } })}
                  />
                </label>
              </div>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Support email</span>
                <input
                  type="email"
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={p.supportEmail}
                  onChange={(e) => setSettings({ ...settings, platform: { ...p, supportEmail: e.target.value } })}
                />
              </label>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Public site URL</span>
                <input
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={p.publicSiteUrl}
                  onChange={(e) => setSettings({ ...settings, platform: { ...p, publicSiteUrl: e.target.value } })}
                />
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={p.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, platform: { ...p, maintenanceMode: e.target.checked } })}
                />
                <span className="font-medium text-[#202223]">Maintenance mode</span>
              </label>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Maintenance banner</span>
                <textarea
                  className={`mt-1 min-h-[80px] w-full ${adminInputClass}`}
                  value={p.maintenanceBanner}
                  onChange={(e) => setSettings({ ...settings, platform: { ...p, maintenanceBanner: e.target.value } })}
                />
              </label>
            </div>
          ) : null}

          {settings && active === "payments" && pay ? (
            <div className="mt-8 space-y-4">
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={pay.codEnabled}
                  onChange={(e) => setSettings({ ...settings, payments: { ...pay, codEnabled: e.target.checked } })}
                />
                <span className="font-medium text-[#202223]">Cash on delivery enabled</span>
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={pay.paypalEnabled}
                  onChange={(e) => setSettings({ ...settings, payments: { ...pay, paypalEnabled: e.target.checked } })}
                />
                <span className="font-medium text-[#202223]">PayPal checkout enabled</span>
              </label>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">PayPal mode</span>
                <select
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={pay.paypalMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...pay, paypalMode: e.target.value as "sandbox" | "live" },
                    })
                  }
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live</option>
                </select>
              </label>
              <p className={`text-[12px] ${adminMuted}`}>
                PayPal client ID and secret stay in environment variables — this toggle only controls storefront availability.
              </p>
            </div>
          ) : null}

          {settings && active === "shipping" && ship ? (
            <div className="mt-8 space-y-4">
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Default carrier</span>
                <select
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={ship.defaultCarrier}
                  onChange={(e) => setSettings({ ...settings, shipping: { ...ship, defaultCarrier: e.target.value } })}
                >
                  {SHIPPING_CARRIER_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Estimated processing days</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={ship.estimatedProcessingDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: { ...ship, estimatedProcessingDays: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Free shipping label (optional)</span>
                <input
                  className={`mt-1 w-full ${adminInputClass}`}
                  placeholder="e.g. Free shipping over €75"
                  value={ship.freeShippingThresholdLabel}
                  onChange={(e) =>
                    setSettings({ ...settings, shipping: { ...ship, freeShippingThresholdLabel: e.target.value } })
                  }
                />
              </label>
            </div>
          ) : null}

          {settings && active === "features" && feat ? (
            <div className="mt-8 space-y-4">
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={feat.metaPixelEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, features: { ...feat, metaPixelEnabled: e.target.checked } })
                  }
                />
                <span className="font-medium text-[#202223]">Meta Pixel enabled</span>
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={feat.creatorPayoutsPreview}
                  onChange={(e) =>
                    setSettings({ ...settings, features: { ...feat, creatorPayoutsPreview: e.target.checked } })
                  }
                />
                <span className="font-medium text-[#202223]">Creator payouts (preview)</span>
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={feat.influencerApplicationsOpen}
                  onChange={(e) =>
                    setSettings({ ...settings, features: { ...feat, influencerApplicationsOpen: e.target.checked } })
                  }
                />
                <span className="font-medium text-[#202223]">Accept new creator applications</span>
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={feat.blogPublic}
                  onChange={(e) => setSettings({ ...settings, features: { ...feat, blogPublic: e.target.checked } })}
                />
                <span className="font-medium text-[#202223]">Public blog / magazine</span>
              </label>
            </div>
          ) : null}

          {settings && active === "notifications" && notif ? (
            <div className="mt-8 space-y-4">
              <label className="block text-[13px]">
                <span className="font-medium text-[#202223]">Team alert email</span>
                <input
                  type="email"
                  className={`mt-1 w-full ${adminInputClass}`}
                  value={notif.adminAlertEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...notif, adminAlertEmail: e.target.value } })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={notif.emailOnNewOrder}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...notif, emailOnNewOrder: e.target.checked } })
                  }
                />
                <span className="font-medium text-[#202223]">Email on new order (when wired)</span>
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={notif.emailOnInfluencerApplication}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...notif, emailOnInfluencerApplication: e.target.checked },
                    })
                  }
                />
                <span className="font-medium text-[#202223]">Email on creator application (when wired)</span>
              </label>
            </div>
          ) : null}

          {settings && active !== "account" ? (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#e3e5e7] pt-6">
              <button type="button" disabled={saving} onClick={() => void saveStoreSection()} className={adminBtnPrimary}>
                {saving ? "Saving…" : `Save ${current?.title ?? "section"}`}
              </button>
              {saved ? <span className="text-[13px] font-medium text-emerald-700">Saved</span> : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
