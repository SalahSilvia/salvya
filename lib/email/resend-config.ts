import { ensureLocalEnvLoaded } from "@/lib/env/load-local-env";
import type { EmailTemplateId } from "@/lib/email/types";
import {
  formatResendFrom,
  resolveAliasAddress,
  resolveFromEmailForTemplate,
  SALVYA_EMAIL_ALIASES,
  TEMPLATE_SENDER_ALIAS,
  type ResendDeliveryStatus,
  type SalvyaEmailAlias,
} from "@/lib/email/resend-brand";

export {
  formatResendFrom,
  resolveAliasAddress,
  resolveFromEmailForTemplate,
  SALVYA_EMAIL_ALIASES,
  SALVYA_EMAIL_DOMAIN,
  TEMPLATE_SENDER_ALIAS,
  type ResendDeliveryStatus,
  type SalvyaEmailAlias,
} from "@/lib/email/resend-brand";

export type ResendEnvConfig = {
  apiKey: string;
  fromName: string;
  defaultFromEmail: string;
  replyTo: string;
  supportEmail: string;
};

export function getResendEnv(): ResendEnvConfig | null {
  ensureLocalEnvLoaded();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    fromName: process.env.RESEND_FROM_NAME?.trim() || "Salvya Team",
    defaultFromEmail:
      process.env.RESEND_FROM_EMAIL?.trim().toLowerCase() || SALVYA_EMAIL_ALIASES.hello.address,
    replyTo: process.env.RESEND_REPLY_TO?.trim().toLowerCase() || SALVYA_EMAIL_ALIASES.support.address,
    supportEmail:
      process.env.RESEND_SUPPORT_EMAIL?.trim().toLowerCase() || SALVYA_EMAIL_ALIASES.support.address,
  };
}

export function isResendConfigured(): boolean {
  return Boolean(getResendEnv()?.apiKey);
}

export function resolveReplyTo(bundleReplyTo?: string): string {
  const env = getResendEnv();
  const reply = bundleReplyTo?.trim() || env?.replyTo || SALVYA_EMAIL_ALIASES.support.address;
  return reply.toLowerCase();
}

export function resolveSupportEmail(bundleSupport?: string): string {
  const env = getResendEnv();
  return (bundleSupport?.trim() || env?.supportEmail || SALVYA_EMAIL_ALIASES.support.address).toLowerCase();
}

export function getResendDeliveryStatus(): ResendDeliveryStatus {
  const env = getResendEnv();
  const fromName = env?.fromName ?? "Salvya Team";
  const templateSenders = {} as ResendDeliveryStatus["templateSenders"];

  for (const [id, alias] of Object.entries(TEMPLATE_SENDER_ALIAS) as [EmailTemplateId, SalvyaEmailAlias][]) {
    const email = resolveAliasAddress(alias);
    templateSenders[id] = {
      alias,
      from: formatResendFrom(fromName, email),
    };
  }

  return {
    configured: Boolean(env),
    fromName,
    defaultFrom: formatResendFrom(fromName, env?.defaultFromEmail ?? SALVYA_EMAIL_ALIASES.hello.address),
    replyTo: env?.replyTo ?? SALVYA_EMAIL_ALIASES.support.address,
    supportEmail: env?.supportEmail ?? SALVYA_EMAIL_ALIASES.support.address,
    aliases: SALVYA_EMAIL_ALIASES,
    templateSenders,
  };
}
