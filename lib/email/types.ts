export type EmailTemplateCategory = "order" | "lifecycle" | "account" | "marketing";

export type EmailTemplateId =
  | "order_confirmation"
  | "order_preparing"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_payment_failed"
  | "order_delay_notice"
  | "order_review_request"
  | "welcome_account"
  | "profile_complete_nudge"
  | "cart_abandoned"
  | "cart_reminder_final"
  | "restock_interest"
  | "post_purchase_cross_sell"
  | "account_security_alert"
  | "password_reset_info"
  | "new_collection"
  | "seasonal_sale"
  | "vip_early_access"
  | "flash_sale"
  | "win_back"
  | "newsletter_welcome"
  | "artist_drop_alert"
  | "free_shipping_promo";

export type CustomerEmailTemplate = {
  id: EmailTemplateId;
  category: EmailTemplateCategory;
  name: string;
  description: string;
  /** When this email is sent automatically */
  trigger: string;
  enabled: boolean;
  subject: string;
  previewText: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
};

export type CustomerEmailGlobalSettings = {
  emailsEnabled: boolean;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  supportEmail: string;
  brandAccent: string;
};

export type CustomerEmailsBundle = {
  global: CustomerEmailGlobalSettings;
  templates: Record<EmailTemplateId, CustomerEmailTemplate>;
};

export type EmailSendLogRow = {
  id: string;
  templateId: EmailTemplateId;
  toEmail: string;
  subject: string;
  status: "sent" | "queued" | "failed" | "skipped";
  error: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export const EMAIL_MERGE_TAGS = [
  { tag: "{{customer_name}}", desc: "First name from shipping or account" },
  { tag: "{{customer_email}}", desc: "Buyer email" },
  { tag: "{{order_number}}", desc: "SVY-… reference" },
  { tag: "{{product_title}}", desc: "Line item or featured product" },
  { tag: "{{order_total}}", desc: "Formatted total" },
  { tag: "{{tracking_number}}", desc: "Carrier tracking ID" },
  { tag: "{{tracking_url}}", desc: "Tracking link" },
  { tag: "{{store_name}}", desc: "Brand name" },
  { tag: "{{track_order_url}}", desc: "Track order page link" },
  { tag: "{{cart_url}}", desc: "Checkout or bag link" },
  { tag: "{{discount_code}}", desc: "Promo code (campaigns)" },
  { tag: "{{artist_name}}", desc: "Artist or drop name" },
  { tag: "{{collection_name}}", desc: "Collection title" },
  { tag: "{{support_email}}", desc: "Support inbox" },
  { tag: "{{unsubscribe_url}}", desc: "Contact / preferences link" },
] as const;
