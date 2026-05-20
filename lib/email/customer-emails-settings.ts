import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CUSTOMER_EMAILS, EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
import { getResendEnv, SALVYA_EMAIL_ALIASES } from "@/lib/email/resend-config";
import { TEMPLATE_CATEGORY } from "@/lib/email/template-catalog";
import type { CustomerEmailsBundle, CustomerEmailTemplate, EmailTemplateId } from "@/lib/email/types";

/** Align stored settings with Resend env + salvyastore.com aliases when domain is outdated. */
export function applyResendBrandDefaults(bundle: CustomerEmailsBundle): CustomerEmailsBundle {
  const env = getResendEnv();
  const domain = "salvyastore.com";
  const usesBrandDomain = (email: string) => email.toLowerCase().endsWith(`@${domain}`);

  return {
    ...bundle,
    global: {
      ...bundle.global,
      fromName: env?.fromName || bundle.global.fromName || "Salvya Team",
      fromEmail: usesBrandDomain(bundle.global.fromEmail)
        ? bundle.global.fromEmail
        : env?.defaultFromEmail || SALVYA_EMAIL_ALIASES.hello.address,
      replyTo: usesBrandDomain(bundle.global.replyTo)
        ? bundle.global.replyTo
        : env?.replyTo || SALVYA_EMAIL_ALIASES.support.address,
      supportEmail: usesBrandDomain(bundle.global.supportEmail)
        ? bundle.global.supportEmail
        : env?.supportEmail || SALVYA_EMAIL_ALIASES.support.address,
    },
  };
}

const STORE_KEY = "customer_emails";

function isTemplateId(v: string): v is EmailTemplateId {
  return EMAIL_TEMPLATE_IDS.includes(v as EmailTemplateId);
}

function sanitizeTemplate(raw: unknown, fallback: CustomerEmailTemplate): CustomerEmailTemplate {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const category =
    o.category === "order" || o.category === "lifecycle" || o.category === "account" || o.category === "marketing"
      ? o.category
      : fallback.category ?? TEMPLATE_CATEGORY[fallback.id];

  return {
    id: fallback.id,
    category,
    name: typeof o.name === "string" ? o.name.trim().slice(0, 120) || fallback.name : fallback.name,
    description: typeof o.description === "string" ? o.description.trim().slice(0, 400) : fallback.description,
    trigger: typeof o.trigger === "string" ? o.trigger.trim().slice(0, 200) : fallback.trigger,
    enabled: o.enabled === false ? false : true,
    subject: typeof o.subject === "string" ? o.subject.trim().slice(0, 200) : fallback.subject,
    previewText: typeof o.previewText === "string" ? o.previewText.trim().slice(0, 200) : fallback.previewText,
    headline: typeof o.headline === "string" ? o.headline.trim().slice(0, 200) : fallback.headline,
    body: typeof o.body === "string" ? o.body.slice(0, 8000) : fallback.body,
    ctaLabel: typeof o.ctaLabel === "string" ? o.ctaLabel.trim().slice(0, 80) : fallback.ctaLabel,
    ctaUrl: typeof o.ctaUrl === "string" ? o.ctaUrl.trim().slice(0, 500) : fallback.ctaUrl,
    footerNote: typeof o.footerNote === "string" ? o.footerNote.trim().slice(0, 500) : fallback.footerNote,
  };
}

export function sanitizeCustomerEmailsBundle(raw: unknown): CustomerEmailsBundle {
  const base = structuredClone(DEFAULT_CUSTOMER_EMAILS);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  if (o.global && typeof o.global === "object") {
    const g = o.global as Record<string, unknown>;
    base.global = {
      emailsEnabled: g.emailsEnabled === false ? false : true,
      fromName: typeof g.fromName === "string" ? g.fromName.trim().slice(0, 80) || base.global.fromName : base.global.fromName,
      fromEmail: typeof g.fromEmail === "string" ? g.fromEmail.trim().slice(0, 120) : base.global.fromEmail,
      replyTo: typeof g.replyTo === "string" ? g.replyTo.trim().slice(0, 120) : base.global.replyTo,
      supportEmail:
        typeof g.supportEmail === "string" ? g.supportEmail.trim().slice(0, 120) : base.global.supportEmail,
      brandAccent: typeof g.brandAccent === "string" ? g.brandAccent.trim().slice(0, 32) : base.global.brandAccent,
    };
  }

  if (o.templates && typeof o.templates === "object") {
    const t = o.templates as Record<string, unknown>;
    for (const id of EMAIL_TEMPLATE_IDS) {
      if (t[id]) base.templates[id] = sanitizeTemplate(t[id], base.templates[id]);
    }
  }

  return base;
}

export async function loadCustomerEmails(service: SupabaseClient): Promise<CustomerEmailsBundle> {
  const { data, error } = await service.from("store_settings").select("value").eq("key", STORE_KEY).maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return structuredClone(DEFAULT_CUSTOMER_EMAILS);
    }
    throw new Error(error.message);
  }
  if (!data?.value) return applyResendBrandDefaults(structuredClone(DEFAULT_CUSTOMER_EMAILS));
  return applyResendBrandDefaults(sanitizeCustomerEmailsBundle(data.value));
}

export async function saveCustomerEmails(service: SupabaseClient, bundle: CustomerEmailsBundle): Promise<void> {
  const value = sanitizeCustomerEmailsBundle(bundle);
  const { error } = await service.from("store_settings").upsert({ key: STORE_KEY, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export function patchEmailTemplate(
  bundle: CustomerEmailsBundle,
  id: EmailTemplateId,
  patch: Partial<CustomerEmailTemplate>,
): CustomerEmailsBundle {
  if (!isTemplateId(id)) return bundle;
  return {
    ...bundle,
    templates: {
      ...bundle.templates,
      [id]: sanitizeTemplate({ ...bundle.templates[id], ...patch }, bundle.templates[id]),
    },
  };
}
