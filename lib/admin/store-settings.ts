import type { SupabaseClient } from "@supabase/supabase-js";

export type PlatformSettings = {
  storeName: string;
  defaultLocale: string;
  currency: string;
  supportEmail: string;
  publicSiteUrl: string;
  maintenanceMode: boolean;
  maintenanceBanner: string;
};

export type PaymentsSettings = {
  codEnabled: boolean;
  paypalEnabled: boolean;
  paypalMode: "sandbox" | "live";
};

export type ShippingSettings = {
  defaultCarrier: string;
  estimatedProcessingDays: number;
  freeShippingThresholdLabel: string;
};

export type FeaturesSettings = {
  metaPixelEnabled: boolean;
  creatorPayoutsPreview: boolean;
  influencerApplicationsOpen: boolean;
  blogPublic: boolean;
};

export type NotificationsSettings = {
  adminAlertEmail: string;
  emailOnNewOrder: boolean;
  emailOnInfluencerApplication: boolean;
};

export type StoreSettingsBundle = {
  platform: PlatformSettings;
  payments: PaymentsSettings;
  shipping: ShippingSettings;
  features: FeaturesSettings;
  notifications: NotificationsSettings;
};

export const DEFAULT_STORE_SETTINGS: StoreSettingsBundle = {
  platform: {
    storeName: "Salvya",
    defaultLocale: "en",
    currency: "EUR",
    supportEmail: "support@salvya.com",
    publicSiteUrl: "https://salvya.com",
    maintenanceMode: false,
    maintenanceBanner: "We are performing scheduled maintenance. Check back shortly.",
  },
  payments: {
    codEnabled: true,
    paypalEnabled: true,
    paypalMode: "sandbox",
  },
  shipping: {
    defaultCarrier: "dhl",
    estimatedProcessingDays: 3,
    freeShippingThresholdLabel: "",
  },
  features: {
    metaPixelEnabled: false,
    creatorPayoutsPreview: false,
    influencerApplicationsOpen: true,
    blogPublic: true,
  },
  notifications: {
    adminAlertEmail: "ops@salvya.com",
    emailOnNewOrder: true,
    emailOnInfluencerApplication: true,
  },
};

const KEYS = ["platform", "payments", "shipping", "features", "notifications"] as const;

export type StoreSettingsSection = keyof StoreSettingsBundle;

export function sanitizeStoreSettingsSection(section: "platform", value: unknown): PlatformSettings;
export function sanitizeStoreSettingsSection(section: "payments", value: unknown): PaymentsSettings;
export function sanitizeStoreSettingsSection(section: "shipping", value: unknown): ShippingSettings;
export function sanitizeStoreSettingsSection(section: "features", value: unknown): FeaturesSettings;
export function sanitizeStoreSettingsSection(section: "notifications", value: unknown): NotificationsSettings;
export function sanitizeStoreSettingsSection(
  section: StoreSettingsSection,
  value: unknown,
): StoreSettingsBundle[StoreSettingsSection] {
  if (!value || typeof value !== "object") return { ...DEFAULT_STORE_SETTINGS[section] };

  const v = value as Record<string, unknown>;

  switch (section) {
    case "platform": {
      const b = DEFAULT_STORE_SETTINGS.platform;
      return {
        storeName: typeof v.storeName === "string" ? v.storeName.trim().slice(0, 80) || b.storeName : b.storeName,
        defaultLocale: typeof v.defaultLocale === "string" ? v.defaultLocale.trim().slice(0, 12) || "en" : b.defaultLocale,
        currency: typeof v.currency === "string" ? v.currency.trim().slice(0, 8).toUpperCase() || "EUR" : b.currency,
        supportEmail: typeof v.supportEmail === "string" ? v.supportEmail.trim().slice(0, 120) : b.supportEmail,
        publicSiteUrl: typeof v.publicSiteUrl === "string" ? v.publicSiteUrl.trim().slice(0, 200) : b.publicSiteUrl,
        maintenanceMode: Boolean(v.maintenanceMode),
        maintenanceBanner: typeof v.maintenanceBanner === "string" ? v.maintenanceBanner.trim().slice(0, 500) : b.maintenanceBanner,
      };
    }
    case "payments":
      return {
        codEnabled: v.codEnabled !== false,
        paypalEnabled: v.paypalEnabled !== false,
        paypalMode: v.paypalMode === "live" ? "live" : "sandbox",
      };
    case "shipping": {
      const b = DEFAULT_STORE_SETTINGS.shipping;
      return {
        defaultCarrier: typeof v.defaultCarrier === "string" ? v.defaultCarrier.trim().slice(0, 32) : b.defaultCarrier,
        estimatedProcessingDays:
          typeof v.estimatedProcessingDays === "number" && Number.isFinite(v.estimatedProcessingDays)
            ? Math.min(30, Math.max(0, Math.round(v.estimatedProcessingDays)))
            : b.estimatedProcessingDays,
        freeShippingThresholdLabel:
          typeof v.freeShippingThresholdLabel === "string" ? v.freeShippingThresholdLabel.trim().slice(0, 80) : "",
      };
    }
    case "features":
      return {
        metaPixelEnabled: Boolean(v.metaPixelEnabled),
        creatorPayoutsPreview: Boolean(v.creatorPayoutsPreview),
        influencerApplicationsOpen: v.influencerApplicationsOpen !== false,
        blogPublic: v.blogPublic !== false,
      };
    case "notifications": {
      const b = DEFAULT_STORE_SETTINGS.notifications;
      return {
        adminAlertEmail: typeof v.adminAlertEmail === "string" ? v.adminAlertEmail.trim().slice(0, 120) : b.adminAlertEmail,
        emailOnNewOrder: v.emailOnNewOrder !== false,
        emailOnInfluencerApplication: v.emailOnInfluencerApplication !== false,
      };
    }
  }
  return { ...DEFAULT_STORE_SETTINGS.platform };
}

export async function loadStoreSettings(service: SupabaseClient): Promise<StoreSettingsBundle> {
  const { data, error } = await service.from("store_settings").select("key,value");
  if (error) {
    if (error.message.includes("store_settings") || error.code === "42P01") {
      return { ...DEFAULT_STORE_SETTINGS };
    }
    throw new Error(error.message);
  }
  const out: StoreSettingsBundle = structuredClone(DEFAULT_STORE_SETTINGS);
  for (const row of data ?? []) {
    if (row.key === "platform" && row.value && typeof row.value === "object") {
      out.platform = { ...out.platform, ...(row.value as Partial<PlatformSettings>) };
    } else if (row.key === "payments" && row.value && typeof row.value === "object") {
      out.payments = { ...out.payments, ...(row.value as Partial<PaymentsSettings>) };
    } else if (row.key === "shipping" && row.value && typeof row.value === "object") {
      out.shipping = { ...out.shipping, ...(row.value as Partial<ShippingSettings>) };
    } else if (row.key === "features" && row.value && typeof row.value === "object") {
      out.features = { ...out.features, ...(row.value as Partial<FeaturesSettings>) };
    } else if (row.key === "notifications" && row.value && typeof row.value === "object") {
      out.notifications = { ...out.notifications, ...(row.value as Partial<NotificationsSettings>) };
    }
  }
  return out;
}

export async function saveStoreSettingsSection(
  service: SupabaseClient,
  section: StoreSettingsSection,
  value: StoreSettingsBundle[StoreSettingsSection],
): Promise<void> {
  let sanitized: StoreSettingsBundle[StoreSettingsSection];
  switch (section) {
    case "platform":
      sanitized = sanitizeStoreSettingsSection("platform", value);
      break;
    case "payments":
      sanitized = sanitizeStoreSettingsSection("payments", value);
      break;
    case "shipping":
      sanitized = sanitizeStoreSettingsSection("shipping", value);
      break;
    case "features":
      sanitized = sanitizeStoreSettingsSection("features", value);
      break;
    case "notifications":
      sanitized = sanitizeStoreSettingsSection("notifications", value);
      break;
    default:
      sanitized = value;
  }
  const { error } = await service.from("store_settings").upsert({ key: section, value: sanitized }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
