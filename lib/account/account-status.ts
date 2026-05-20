export const ACCOUNT_STATUS_ACTIVE = "active" as const;
export const ACCOUNT_STATUS_DEACTIVATED = "deactivated" as const;

export type AccountStatus = typeof ACCOUNT_STATUS_ACTIVE | typeof ACCOUNT_STATUS_DEACTIVATED;

export const DELETE_CONFIRM_PHRASE = "DELETE MY ACCOUNT";
export const DEACTIVATE_CONFIRM_PHRASE = "DEACTIVATE";

export function accountStatusFromMetadata(meta: Record<string, unknown> | undefined): AccountStatus {
  if (!meta) return ACCOUNT_STATUS_ACTIVE;
  return meta.account_status === ACCOUNT_STATUS_DEACTIVATED ? ACCOUNT_STATUS_DEACTIVATED : ACCOUNT_STATUS_ACTIVE;
}

export function isAccountDeactivated(meta: Record<string, unknown> | undefined): boolean {
  return accountStatusFromMetadata(meta) === ACCOUNT_STATUS_DEACTIVATED;
}
