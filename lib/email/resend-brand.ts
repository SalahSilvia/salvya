import type { EmailTemplateId } from "@/lib/email/types";

/** Verified domain on Resend — salvyastore.com */
export const SALVYA_EMAIL_DOMAIN = "salvyastore.com";

export type SalvyaEmailAlias = "hello" | "orders" | "support" | "contact" | "security";

export const SALVYA_EMAIL_ALIASES: Record<
  SalvyaEmailAlias,
  { address: string; label: string; purpose: string }
> = {
  hello: {
    address: `hello@${SALVYA_EMAIL_DOMAIN}`,
    label: "Main",
    purpose: "General & welcome",
  },
  orders: {
    address: `orders@${SALVYA_EMAIL_DOMAIN}`,
    label: "Orders",
    purpose: "Order confirmations, shipping, delivery",
  },
  support: {
    address: `support@${SALVYA_EMAIL_DOMAIN}`,
    label: "Support",
    purpose: "Reply-to & customer help",
  },
  contact: {
    address: `contact@${SALVYA_EMAIL_DOMAIN}`,
    label: "Contact",
    purpose: "Restock, campaigns & general inquiries",
  },
  security: {
    address: `security@${SALVYA_EMAIL_DOMAIN}`,
    label: "Security",
    purpose: "Account & password notices",
  },
};

/** Which alias sends each template (must be verified in Resend). */
export const TEMPLATE_SENDER_ALIAS: Record<EmailTemplateId, SalvyaEmailAlias> = {
  order_confirmation: "orders",
  order_preparing: "orders",
  order_shipped: "orders",
  order_delivered: "orders",
  order_cancelled: "orders",
  order_payment_failed: "orders",
  order_delay_notice: "orders",
  order_review_request: "hello",
  welcome_account: "hello",
  profile_complete_nudge: "hello",
  cart_abandoned: "hello",
  cart_reminder_final: "hello",
  restock_interest: "contact",
  post_purchase_cross_sell: "hello",
  account_security_alert: "security",
  password_reset_info: "security",
  new_collection: "contact",
  seasonal_sale: "contact",
  vip_early_access: "contact",
  flash_sale: "contact",
  win_back: "contact",
  newsletter_welcome: "hello",
  artist_drop_alert: "contact",
  free_shipping_promo: "contact",
};

export type ResendDeliveryStatus = {
  configured: boolean;
  fromName: string;
  defaultFrom: string;
  replyTo: string;
  supportEmail: string;
  aliases: typeof SALVYA_EMAIL_ALIASES;
  templateSenders: Record<EmailTemplateId, { from: string; alias: SalvyaEmailAlias }>;
};

export function resolveAliasAddress(alias: SalvyaEmailAlias): string {
  return SALVYA_EMAIL_ALIASES[alias].address;
}

export function formatResendFrom(fromName: string, fromEmail: string): string {
  const name = fromName.trim() || "Salvya Team";
  const email = fromEmail.trim().toLowerCase();
  return `${name} <${email}>`;
}

/** From address for a template — uses alias map, then optional fallback / hello@ default. */
export function resolveFromEmailForTemplate(templateId: EmailTemplateId, fallbackFrom?: string): string {
  const alias = TEMPLATE_SENDER_ALIAS[templateId];
  if (alias) return resolveAliasAddress(alias);
  const fb = fallbackFrom?.trim().toLowerCase();
  if (fb && fb.includes("@")) return fb;
  return SALVYA_EMAIL_ALIASES.hello.address;
}
