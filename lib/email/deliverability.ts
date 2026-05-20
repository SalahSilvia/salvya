import type { EmailTemplateId } from "@/lib/email/types";

/** Templates that are promotional — Yahoo & Gmail expect List-Unsubscribe. */
const MARKETING_TEMPLATE_IDS = new Set<EmailTemplateId>([
  "welcome_account",
  "profile_complete_nudge",
  "cart_abandoned",
  "cart_reminder_final",
  "restock_interest",
  "post_purchase_cross_sell",
  "order_review_request",
  "new_collection",
  "seasonal_sale",
  "vip_early_access",
  "flash_sale",
  "win_back",
  "newsletter_welcome",
  "artist_drop_alert",
  "free_shipping_promo",
]);

export function isMarketingEmailTemplate(templateId: EmailTemplateId): boolean {
  return MARKETING_TEMPLATE_IDS.has(templateId);
}

export function postalAddressLine(): string {
  const fromEnv = process.env.SALVYA_POSTAL_ADDRESS?.trim();
  if (fromEnv) return fromEnv;
  return "Salvya · salvyastore.com · Customer support: support@salvyastore.com";
}

export function buildResendHeaders(opts: {
  templateId: EmailTemplateId;
  supportEmail: string;
  siteOrigin: string;
}): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Entity-Ref-ID": opts.templateId,
  };

  if (isMarketingEmailTemplate(opts.templateId)) {
    const mailto = `mailto:${opts.supportEmail}?subject=${encodeURIComponent("Unsubscribe")}`;
    const https = `${opts.siteOrigin.replace(/\/$/, "")}/contact`;
    headers["List-Unsubscribe"] = `<${mailto}>, <${https}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  return headers;
}

export function buildResendTags(templateId: EmailTemplateId): { name: string; value: string }[] {
  return [
    { name: "template", value: templateId },
    { name: "stream", value: isMarketingEmailTemplate(templateId) ? "marketing" : "transactional" },
  ];
}
