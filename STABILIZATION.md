# Salvya stabilization — soft launch readiness

**Mode:** Stability before new storefront features. **Priority:** STABILITY > NEW FEATURES.

Last reviewed: May 2026 (cleanup sprint).

## Platform snapshot

| Layer | Status |
|-------|--------|
| Customer storefront (browse, bag, checkout, track) | Production-capable MVP |
| Account sync (bag, likes, follows, notifications) | Unified `useAccountSyncedResource` |
| Orders | Server-led (`POST /api/orders`); PayPal **server-verified**; COD unchanged |
| PayPal | Server create-order + verify; idempotency on `paypal_order_id` / capture |
| Admin dashboard | **Live** under `app/admin/*` (orders, products, artists, blog, emails, analytics) |
| Creator hub | `/creator` + onboarding; dashboard is **labeled preview** (demo metrics) |
| Influencer URLs | Legacy `/influencer/*` → **301 to `/creator/*`** |

## Route map (canonical)

| Path | Purpose |
|------|---------|
| `/` | Home feed |
| `/shop` | Shop index |
| `/artist/[slug]` | Artist storefront |
| `/artist/.../checkout/*` | Checkout wizard (details → payment → confirm) |
| `/blogs` | Blog index |
| `/blog/[slug]` | Articles (`/blog` index redirects to `/blogs`) |
| `/preview-bag` | **Canonical bag UI** (synced via `BagProvider`, not a dead route) |
| `/payment` | **Payment terms** (legal), not checkout |
| `/track-order` | Guest order lookup |
| `/creator`, `/creator/dashboard` | Creator program + demo dashboard |
| `/influencer/*` | Redirects to `/creator/*` |
| `/account` | Redirects to `/account/profile` |
| `/signup`, `/signup/create` | Redirect to `/register` |

## Shared sync core

| Domain | Config | Provider | Guest | Login merge |
|--------|--------|----------|-------|-------------|
| Bag | `lib/cart/bag-sync-config.ts` | `BagProvider` | Yes | Yes |
| Likes | `lib/likes/likes-sync-config.ts` | `LikesProvider` | Yes | Yes |
| Follows | `lib/follows/follows-sync-config.ts` | `ArtistFollowsProvider` | Yes | Yes |
| Notifications | `lib/notifications/notifications-sync-config.ts` | `NotificationsProvider` | No | N/A |

**Hook:** `lib/sync/useAccountSyncedResource.ts`

## Payments (production)

- Client never marks orders `paid` — `POST /api/orders` verifies with PayPal API.
- Rate limits on order + PayPal create endpoints.
- Server validates promo `discountCents` + `couponCode`.
- Checkout session expires after 48h (`checkoutSavedAt`).
- Idempotency: `placement_key` + unique `paypal_order_id` / `paypal_capture_id`.
- Structured logs: `[payments]` events on verify reject, duplicate block, order placed.
- Env audit: `lib/paypal/env-validation.ts` (warns on credential mismatch).
- Migration: `supabase/migrations/20250516290000_paypal_payment_verification.sql`
- QA doc: `docs/PAYMENTS-PRODUCTION-QA.md`

## QA commands (`web/`)

```bash
npm test          # vitest — must pass
npm run build     # production build — must pass
npm run lint      # ESLint — errors must be 0 (React 19 hook rules = warn during stabilization)
```

## Pre-launch manual checklist

### Checkout
- [ ] Morocco: COD path → confirm → `cod_pending`
- [ ] International: PayPal wallet + card → verify loader → `paid`
- [ ] Cannot continue to confirm without PayPal when online-only
- [ ] Duplicate PayPal order id rejected (409)
- [ ] Promo code tamper rejected server-side

### Auth
- [ ] Register → email confirm (if enabled) → login
- [ ] OAuth callback lands on safe `next` path
- [ ] Admin routes 403 for non-admin

### Sync
- [ ] Guest bag → sign-in merge
- [ ] Notifications mark-read persists after reload
- [ ] Sign-out: no orphan PUTs to cart API

### Creator
- [ ] `/influencer` redirects to `/creator`
- [ ] Dashboard shows **Dashboard · preview** badge

## Known gaps (documented, not blockers for soft launch)

- Creator dashboard metrics are **demo** (`CreatorDashboardExperience`).
- Live carrier tracking API (internal `fulfillment_status` only).
- Guest order → account linking.
- ESLint: `set-state-in-effect` warnings in auth/checkout (incremental cleanup).
- Next.js: middleware → proxy migration advisory.

## SQL migrations

See `web/supabase/SUPABASE-MIGRATIONS-GUIDE.txt` and `supabase/RUN-TODAY.md`. Apply all migrations before production PayPal go-live.

## Docs

- `docs/guest-vs-signed-in.md` — account behavior
- `docs/CATALOG-SOURCES.md` — mixed catalog sources + safe migration
- `salvya.local.env.template` — env keys including `PAYPAL_MODE`

## Cleanup sprint (May 2026)

- Locale-aware `/influencer` → `/creator` redirects in `next.config.ts`
- Removed redundant `app/[locale]/influencer/layout.tsx` (redirect-only pages remain)
- Storefront loading: skeletons replace plain `Loading…` on shop, account, auth redirect overlay
- Admin tables: `SkTableRows` skeleton while fetching; nav labels unified to **Creators**
- `SalvyaBusyOverlay` for session redirect gates
