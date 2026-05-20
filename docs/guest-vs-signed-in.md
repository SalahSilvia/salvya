# Salvya · Guest vs signed-in (internal)

Short source of truth for product and UI. Update when cart, addresses, or orders change.

## Guests (no Supabase session)

- Browse home, shop, artist pages, product detail, size guide, policies, help, blogs.
- **Bag** (`/preview-bag`): device-local + optional server sync when API configured; uses `BagProvider` + `useAccountSyncedResource`.
- **Checkout preview** (`sessionStorage`): contact + payment step on **this browser**; PayPal requires server verification before order is `paid`.
- **Sign in** / **Create account** from header, menu, auth pages (`?next=` where implemented).

## Signed-in members (Supabase session)

- Same shopping surfaces, plus **member shell** (bottom nav on `/`, `/shop`): Home, Likes, Search, Alerts, Menu.
- **Gated routes** (redirect to `/login?next=…`): `/menu`, `/search`, `/likes`, `/notifications`, `/account/profile`, etc. (see `lib/auth/route-policy.ts`).
- **Notifications** (`/notifications`): synced inbox via `customer_notifications` + local merge; mark-read pushes immediately.
- **Profile** (`/account/profile`): identity + settings; `/account` redirects here.
- **Orders**: placed via `POST /api/orders`; listed when signed in via same API.
- **Bag**: merges guest cart on login; syncs to `/api/cart` when configured.

## Checkout policy

- **COD** (Morocco): `cod_pending` — no PayPal required.
- **PayPal**: order created only after PayPal API verification on server; client cannot force `paid`.
- Checkout `sessionStorage` expires after **48 hours** — stale sessions rejected at place-order.
- Promo codes: server re-validates `couponCode` + `discountCents`.

## Creator vs influencer URLs

- Public hub: **`/creator`** (program, apply flow).
- Dashboard: **`/creator/dashboard`** (preview/demo metrics — see UI badge).
- Legacy **`/influencer/*`** redirects to **`/creator/*`** (301).

## Sign-out

- Session cleared via Supabase; **local bag may remain** on device until user clears it — intentional for shared devices; revisit if product policy changes.

## Admin

- Routes under `/admin/*` require admin role (middleware + RLS).
- “Influencer applications” in admin refers to **creator program applications** (`salvya_influencer_applications` table name is legacy).
