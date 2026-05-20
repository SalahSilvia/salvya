import type { AnalyticsEventType } from "@/lib/analytics/event-types";
import { isAnalyticsEventType } from "@/lib/analytics/event-types";
import { shouldEnableAnalytics } from "@/lib/cookie-consent";
import { getOrCreateSessionId, readAttributionSnapshot } from "@/lib/analytics/session";
import { getSessionUtm } from "@/lib/analytics/utm";

const QUEUE_STORAGE = "salvya_analytics_offline_queue_v1";
const MAX_QUEUE = 100;
const MAX_BATCH = 25;
const FLUSH_MS = 4500;
const MAX_RETRIES = 3;

export type OutboundAnalyticsEvent = {
  event_type: AnalyticsEventType;
  page: string;
  product_id?: string | null;
  artist_slug?: string | null;
  metadata?: Record<string, unknown>;
};

type CollectBody = {
  sessionId: string;
  events: OutboundAnalyticsEvent[];
  utm?: Record<string, string | null | undefined>;
};

function loadPersistedQueue(): OutboundAnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(QUEUE_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OutboundAnalyticsEvent[]).slice(-MAX_QUEUE) : [];
  } catch {
    return [];
  }
}

function savePersistedQueue(q: OutboundAnalyticsEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(QUEUE_STORAGE, JSON.stringify(q.slice(-MAX_QUEUE)));
  } catch {
    /* ignore */
  }
}

class AnalyticsTracker {
  private queue: OutboundAnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;

  constructor() {
    this.queue = loadPersistedQueue();
  }

  private scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, FLUSH_MS);
  }

  enqueue(ev: OutboundAnalyticsEvent) {
    if (!shouldEnableAnalytics()) return;
    if (!ev.page || !isAnalyticsEventType(ev.event_type)) return;
    this.queue.push({
      ...ev,
      metadata: ev.metadata && typeof ev.metadata === "object" ? ev.metadata : {},
    });
    savePersistedQueue(this.queue);
    if (this.queue.length >= MAX_BATCH) {
      void this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  trackEvent(
    eventType: AnalyticsEventType,
    page: string,
    opts?: { productId?: string | null; artistSlug?: string | null; metadata?: Record<string, unknown> },
  ) {
    try {
      this.enqueue({
        event_type: eventType,
        page: page.slice(0, 2000),
        product_id: opts?.productId ?? null,
        artist_slug: opts?.artistSlug ?? null,
        metadata: opts?.metadata ?? {},
      });
    } catch {
      /* never block UI */
    }
  }

  trackPageView(page: string) {
    this.trackEvent("page_view", page);
  }

  trackProductView(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("product_view", page, { productId, artistSlug, metadata });
  }

  trackArtistView(page: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("artist_view", page, { artistSlug, metadata });
  }

  trackAddToCart(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("add_to_cart", page, { productId, artistSlug, metadata });
  }

  trackBeginCheckout(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("begin_checkout", page, { productId, artistSlug, metadata });
  }

  trackPurchase(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("purchase", page, { productId, artistSlug, metadata });
  }

  trackSearch(page: string, metadata: Record<string, unknown>) {
    this.trackEvent("search", page, { metadata });
  }

  trackLike(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("like", page, { productId, artistSlug, metadata });
  }

  trackFollowArtist(page: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("follow_artist", page, { artistSlug, metadata });
  }

  trackComment(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("comment", page, { productId, artistSlug, metadata });
  }

  trackRemoveFromCart(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("remove_from_cart", page, { productId, artistSlug, metadata });
  }

  trackApplyCoupon(page: string, productId: string | null, artistSlug: string | null, metadata?: Record<string, unknown>) {
    this.trackEvent("apply_coupon", page, { productId, artistSlug, metadata });
  }

  trackShippingSelected(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("shipping_selected", page, { productId, artistSlug, metadata });
  }

  trackPaymentMethodSelected(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("payment_method_selected", page, { productId, artistSlug, metadata });
  }

  trackCheckoutError(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("checkout_error", page, { productId, artistSlug, metadata });
  }

  trackCollectionView(page: string, metadata: Record<string, unknown>) {
    this.trackEvent("collection_view", page, { metadata });
  }

  trackArtistProfileView(page: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("artist_profile_view", page, { artistSlug, metadata });
  }

  trackSearchZeroResults(page: string, metadata: Record<string, unknown>) {
    this.trackEvent("search_zero_results", page, { metadata });
  }

  trackRecommendationClick(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("recommendation_click", page, { productId, artistSlug, metadata });
  }

  trackWishlistAdd(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("wishlist_add", page, { productId, artistSlug, metadata });
  }

  trackShareProduct(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("share_product", page, { productId, artistSlug, metadata });
  }

  trackNotificationSignup(page: string, productId: string, artistSlug: string, metadata?: Record<string, unknown>) {
    this.trackEvent("notification_signup", page, { productId, artistSlug, metadata });
  }

  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;
    const batch = this.queue.slice(0, MAX_BATCH);
    const sessionId = getOrCreateSessionId();
    if (!sessionId) {
      this.flushing = false;
      return;
    }
    const snap = readAttributionSnapshot();
    const utm = getSessionUtm();
    const body: CollectBody = {
      sessionId,
      events: batch,
      utm: {
        utm_source: snap.utm_source ?? utm.utm_source,
        utm_campaign: snap.utm_campaign ?? utm.utm_campaign,
        utm_medium: snap.utm_medium ?? utm.utm_medium,
        referrer: snap.referrer,
      },
    };

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      attempt += 1;
      try {
        const res = await fetch("/api/analytics/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
          keepalive: true,
        });
        if (res.ok) {
          this.queue = this.queue.slice(batch.length);
          savePersistedQueue(this.queue);
          break;
        }
      } catch {
        /* network / offline */
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    this.flushing = false;
    if (this.queue.length > 0) this.scheduleFlush();
  }
}

let singleton: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!singleton) singleton = new AnalyticsTracker();
  return singleton;
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void getAnalyticsTracker().flush();
    }
  });
  window.addEventListener("pagehide", () => {
    void getAnalyticsTracker().flush();
  });
}
