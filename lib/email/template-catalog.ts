import type { EmailTemplateCategory, EmailTemplateId } from "@/lib/email/types";

export type EmailTemplateGroup = {
  id: EmailTemplateCategory;
  label: string;
  description: string;
};

export const EMAIL_TEMPLATE_GROUPS: EmailTemplateGroup[] = [
  {
    id: "order",
    label: "Order status",
    description: "Transactional updates as fulfillment and payment change (like Nike, Zara).",
  },
  {
    id: "lifecycle",
    label: "Customer journey",
    description: "Automations when shoppers sign up, leave carts, or complete purchases.",
  },
  {
    id: "account",
    label: "Account & security",
    description: "Sign-in, profile, and trust emails.",
  },
  {
    id: "marketing",
    label: "Marketing & drops",
    description: "Campaigns, sales, VIP access, and artist launches — use List-Unsubscribe.",
  },
];

export const TEMPLATE_CATEGORY: Record<EmailTemplateId, EmailTemplateCategory> = {
  order_confirmation: "order",
  order_preparing: "order",
  order_shipped: "order",
  order_delivered: "order",
  order_cancelled: "order",
  order_payment_failed: "order",
  order_delay_notice: "order",
  order_review_request: "lifecycle",
  welcome_account: "lifecycle",
  profile_complete_nudge: "lifecycle",
  cart_abandoned: "lifecycle",
  cart_reminder_final: "lifecycle",
  restock_interest: "lifecycle",
  post_purchase_cross_sell: "lifecycle",
  account_security_alert: "account",
  password_reset_info: "account",
  new_collection: "marketing",
  seasonal_sale: "marketing",
  vip_early_access: "marketing",
  flash_sale: "marketing",
  win_back: "marketing",
  newsletter_welcome: "marketing",
  artist_drop_alert: "marketing",
  free_shipping_promo: "marketing",
};

export function getTemplateCategory(id: EmailTemplateId): EmailTemplateCategory {
  return TEMPLATE_CATEGORY[id];
}

export function groupTemplateIds(ids: EmailTemplateId[]): Record<EmailTemplateCategory, EmailTemplateId[]> {
  const out: Record<EmailTemplateCategory, EmailTemplateId[]> = {
    order: [],
    lifecycle: [],
    account: [],
    marketing: [],
  };
  for (const id of ids) {
    out[getTemplateCategory(id)].push(id);
  }
  return out;
}
