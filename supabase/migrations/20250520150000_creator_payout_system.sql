-- Creator Phase 5 — production payout system, wallet cache, audit logs, export quota.

-- ---------------------------------------------------------------------------
-- Materialized wallet (fast reads, no heavy joins on dashboard)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_wallet_balance (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  available_balance_minor integer not null default 0 check (available_balance_minor >= 0),
  pending_balance_minor integer not null default 0 check (pending_balance_minor >= 0),
  pending_lock_minor integer not null default 0 check (pending_lock_minor >= 0),
  lifetime_earnings_minor integer not null default 0 check (lifetime_earnings_minor >= 0),
  currency text not null default 'EUR',
  updated_at timestamptz not null default now()
);

create index if not exists creator_wallet_balance_updated_idx
  on public.creator_wallet_balance (updated_at desc);

-- ---------------------------------------------------------------------------
-- Enhance creator_payouts (canonical withdrawal records)
-- ---------------------------------------------------------------------------

alter table public.creator_payouts
  add column if not exists requested_at timestamptz,
  add column if not exists external_reference text;

update public.creator_payouts
set requested_at = coalesce(requested_at, created_at)
where requested_at is null;

alter table public.creator_payouts drop constraint if exists creator_payouts_status_check;

alter table public.creator_payouts
  add constraint creator_payouts_status_check
  check (status in (
    'pending', 'approved', 'processing', 'paid', 'rejected', 'failed', 'completed'
  ));

-- ---------------------------------------------------------------------------
-- Audit trail (financial + fraud + reconciliation)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_audit_logs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  action_type text not null,
  entity_type text not null check (entity_type in ('order', 'payout', 'event', 'campaign', 'earning', 'wallet', 'reconciliation')),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_audit_logs_creator_created_idx
  on public.creator_audit_logs (creator_id, created_at desc);

create index if not exists creator_audit_logs_entity_idx
  on public.creator_audit_logs (creator_id, entity_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Data export rate limit (max 3/day per creator)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_data_exports (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  format text not null default 'json' check (format in ('json', 'csv')),
  created_at timestamptz not null default now()
);

create index if not exists creator_data_exports_creator_created_idx
  on public.creator_data_exports (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.creator_wallet_balance enable row level security;
alter table public.creator_audit_logs enable row level security;
alter table public.creator_data_exports enable row level security;

drop policy if exists "creator_wallet_balance_own" on public.creator_wallet_balance;
create policy "creator_wallet_balance_own"
  on public.creator_wallet_balance for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_wallet_balance_admin" on public.creator_wallet_balance;
create policy "creator_wallet_balance_admin"
  on public.creator_wallet_balance for all
  using (public.is_admin());

drop policy if exists "creator_audit_logs_own" on public.creator_audit_logs;
create policy "creator_audit_logs_own"
  on public.creator_audit_logs for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_audit_logs_admin" on public.creator_audit_logs;
create policy "creator_audit_logs_admin"
  on public.creator_audit_logs for all
  using (public.is_admin());

drop policy if exists "creator_data_exports_own" on public.creator_data_exports;
create policy "creator_data_exports_own"
  on public.creator_data_exports for select
  using (auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- Refresh wallet from earnings + payout locks
-- ---------------------------------------------------------------------------

create or replace function public.refresh_creator_wallet_balance(p_creator_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer := 0;
  v_pending integer := 0;
  v_lifetime integer := 0;
  v_lock integer := 0;
  v_currency text := 'EUR';
begin
  select coalesce(sum(
    case
      when self_referral or fraud_status = 'void' or status = 'void' then 0
      when status = 'available' and fraud_status = 'valid' and not locked then amount_minor
      else 0
    end
  ), 0),
  coalesce(sum(
    case
      when self_referral or fraud_status = 'void' or status = 'void' then 0
      when status = 'pending' and fraud_status = 'valid' and not locked then amount_minor
      else 0
    end
  ), 0),
  coalesce(sum(
    case
      when self_referral or status = 'void' or fraud_status = 'void' then 0
      else amount_minor
    end
  ), 0),
  coalesce(max(currency), 'EUR')
  into v_available, v_pending, v_lifetime, v_currency
  from public.creator_earnings
  where creator_id = p_creator_id;

  select coalesce(sum(amount_minor), 0)
  into v_lock
  from public.creator_payouts
  where creator_id = p_creator_id
    and status in ('pending', 'approved', 'processing');

  v_available := greatest(v_available - v_lock, 0);

  insert into public.creator_wallet_balance (
    creator_id,
    available_balance_minor,
    pending_balance_minor,
    pending_lock_minor,
    lifetime_earnings_minor,
    currency,
    updated_at
  )
  values (
    p_creator_id,
    v_available,
    v_pending,
    v_lock,
    v_lifetime,
    v_currency,
    now()
  )
  on conflict (creator_id) do update set
    available_balance_minor = excluded.available_balance_minor,
    pending_balance_minor = excluded.pending_balance_minor,
    pending_lock_minor = excluded.pending_lock_minor,
    lifetime_earnings_minor = excluded.lifetime_earnings_minor,
    currency = excluded.currency,
    updated_at = now();
end;
$$;

grant execute on function public.refresh_creator_wallet_balance(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Freeze balance for payout request (atomic)
-- ---------------------------------------------------------------------------

create or replace function public.freeze_creator_payout_amount(
  p_creator_id uuid,
  p_amount_minor integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
begin
  if p_amount_minor is null or p_amount_minor <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  perform public.refresh_creator_wallet_balance(p_creator_id);

  select available_balance_minor into v_available
  from public.creator_wallet_balance
  where creator_id = p_creator_id;

  if v_available is null or v_available < p_amount_minor then
    return jsonb_build_object('ok', false, 'error', 'insufficient_balance', 'available', coalesce(v_available, 0));
  end if;

  update public.creator_wallet_balance
  set
    available_balance_minor = available_balance_minor - p_amount_minor,
    pending_lock_minor = pending_lock_minor + p_amount_minor,
    updated_at = now()
  where creator_id = p_creator_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.freeze_creator_payout_amount(uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Release lock on rejected payout
-- ---------------------------------------------------------------------------

create or replace function public.release_creator_payout_lock(
  p_creator_id uuid,
  p_amount_minor integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.creator_wallet_balance
  set
    available_balance_minor = available_balance_minor + greatest(p_amount_minor, 0),
    pending_lock_minor = greatest(pending_lock_minor - greatest(p_amount_minor, 0), 0),
    updated_at = now()
  where creator_id = p_creator_id;

  perform public.refresh_creator_wallet_balance(p_creator_id);
end;
$$;

grant execute on function public.release_creator_payout_lock(uuid, integer) to service_role;
