# Apply all Supabase migrations (production launch)

## One-shot (recommended)

1. Regenerate the bundle (after any new migration files):

   ```bash
   cd web
   npm run db:bundle
   ```

2. Open **Supabase Dashboard → SQL Editor → New query**.

3. Paste the **entire** file [`supabase/APPLY-ALL-MIGRATIONS.sql`](../../supabase/APPLY-ALL-MIGRATIONS.sql) and click **Run**.

4. Edit and run [`supabase/PROMOTE-ADMIN.sql`](../../supabase/PROMOTE-ADMIN.sql) with your admin user UUID or email.

5. Verify from `web/`:

   ```bash
   npm run db:verify
   ```

6. In [`supabase/MIGRATIONS-LOG.txt`](../../supabase/MIGRATIONS-LOG.txt), move all `[PENDING]` lines to **APPLIED** with today’s date.

## Migration count

The bundle includes **40** ordered files in `supabase/migrations/` (customer → catalog → payments → creator programme → growth).

## If the batch fails mid-run

- Read the error line number and note which `-- ========== filename.sql ==========` section failed.
- Fix the underlying issue (often: object already exists — safe to re-run idempotent `create if not exists` sections).
- For a **fresh** project, run the full `APPLY-ALL-MIGRATIONS.sql` again.
- For a **partially applied** project, run only the remaining individual `.sql` files from `supabase/migrations/` in filename order.

## Supabase CLI (optional)

If the project is linked (`supabase link`):

```bash
cd web
npx supabase db push
```

The SQL Editor bundle is the supported path when CLI is not linked.

## Environment (Vercel / production)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## After migrations

| Check | URL / command |
|-------|----------------|
| Schema | `npm run db:verify` |
| Sign in | `/login` |
| Admin | `/admin` |
| Creator workspace | `/creator/dashboard` |
| Help / FAQ | `/help-center`, `/faq` |
