# Production launch — Supabase + Salvya web

## 1. Bundle migrations (local, 5 seconds)

```bash
cd web
npm run db:bundle
```

This refreshes `APPLY-ALL-MIGRATIONS.sql` (40 files, oldest → newest).

## 2. Apply on Supabase (required)

1. **Supabase Dashboard → SQL Editor → New query**
2. Paste the full file: [`APPLY-ALL-MIGRATIONS.sql`](./APPLY-ALL-MIGRATIONS.sql)
3. **Run** (one batch; may take 1–2 minutes)
4. Edit and run [`PROMOTE-ADMIN.sql`](./PROMOTE-ADMIN.sql) for your admin account
5. Move all lines in `MIGRATIONS-LOG.txt` from PENDING → APPLIED

## 3. Environment (Vercel / host)

Set in production:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server routes, admin, webhooks |

## 4. Verify

```bash
cd web
npm run db:verify
```

Expect **all tables ✓** and `Schema looks ready for launch.`

## 5. Deploy web

```bash
npm run build
```

Deploy to Vercel (or your host) with the env vars above.

## 6. Smoke checklist

- [ ] `/login` — sign in works
- [ ] `/shop` — products load
- [ ] `/track-order` — lookup works
- [ ] `/creator/apply` — application saves
- [ ] `/creator/dashboard` — approved creator sees workspace
- [ ] `/admin` — admin role can open console
- [ ] `/help-center`, `/faq` — public help pages
- [ ] Checkout + payment (PayPal) on staging order

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `relation does not exist` | Run `APPLY-ALL-MIGRATIONS.sql` or missing slice from `migrations/` |
| `already exists` on re-run | Usually safe — migrations use `if not exists` |
| `db:verify` fails | Compare missing table names; run from that migration file onward |
| RLS / permission errors | Confirm `PROMOTE-ADMIN.sql` ran for your user |
