# Production roadmap — Admin profile & identity

**Code status:** Phase 1 complete in repo. **Database:** you must run SQL once (see `supabase/RUN-TODAY.md`).

## Phase 1 — Identity bridge ✅ (code)

| Task | Status |
|------|--------|
| Server-backed profile (`user_profiles.profile` jsonb) | ✅ + fallback to auth metadata if column missing |
| `GET/PATCH /api/me/profile` | ✅ |
| `GET /api/auth/me` (role, caps, email, displayName, profile) | ✅ |
| `god_admin` admin layout + APIs | ✅ Fixed — was blocked by `role !== "admin"` |
| Middleware: `/account`, `/account/profile`, `/account/settings`, `/api/me` | ✅ |
| Admin ↔ storefront profile sync | ✅ |
| Email center in System nav | ✅ |
| Compact nav preference | ✅ Wired to sidebar width |
| Admin account menu + audit on profile save | ✅ |

## Phase 2 — UX polish (optional next)

| Task | Status |
|------|--------|
| Avatars in Supabase Storage | Pending |
| Customer prefs in DB (not localStorage) | Pending |
| Rate limits on profile PATCH | Pending |

## Phase 4 — You run today

See **`supabase/RUN-TODAY.md`** — apply `APPLY-ALL-MIGRATIONS.sql`, promote admin, verify checklist.
