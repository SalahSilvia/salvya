/**
 * Placeholder for Meta Conversion API (server-side events).
 *
 * When implemented:
 * - POST to `https://graph.facebook.com/v.../{pixel-id}/events`
 * - Reuse the same `event_id` as browser `Purchase` (`salvya_order_{orderNumber}`) for deduplication
 * - Forward `utm_*` from order metadata or checkout payload
 *
 * Do not put access tokens in `NEXT_PUBLIC_*` variables.
 */
export type MetaCapiPlaceholder = {
  readonly status: "not_implemented";
};

export const metaCapi: MetaCapiPlaceholder = { status: "not_implemented" };
