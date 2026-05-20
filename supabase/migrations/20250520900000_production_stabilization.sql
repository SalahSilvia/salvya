-- Production stabilization: stock restore, RPC lockdown, RLS tightening

-- ---------------------------------------------------------------------------
-- Restore variant stock (refund / failed order rollback)
-- ---------------------------------------------------------------------------

create or replace function public.restore_variant_stock_qty(
  p_variant_id uuid,
  p_qty integer
)
returns table(ok boolean, remaining_stock integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_remaining integer;
begin
  v_qty := greatest(1, coalesce(p_qty, 1));
  if p_variant_id is null then
    return query select false, 0, 'invalid_args';
    return;
  end if;

  update public.product_variants
  set stock = stock + v_qty, updated_at = now()
  where id = p_variant_id;

  if not found then
    return query select false, 0, 'variant_not_found';
    return;
  end if;

  select stock into v_remaining from public.product_variants where id = p_variant_id;
  return query select true, coalesce(v_remaining, 0), 'restored';
end;
$$;

revoke all on function public.restore_variant_stock_qty(uuid, integer) from public;
grant execute on function public.restore_variant_stock_qty(uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Lock down creator event RPC (service_role only)
-- ---------------------------------------------------------------------------

revoke all on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) from public, authenticated;

grant execute on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) to service_role;

revoke all on function public.creator_event_metrics_bucket(text) from public, authenticated;
grant execute on function public.creator_event_metrics_bucket(text) to service_role;

-- ---------------------------------------------------------------------------
-- Remove public RLS on creator revenue / growth aggregates
-- ---------------------------------------------------------------------------

drop policy if exists "creator_virality_public_read" on public.creator_virality_snapshots;
drop policy if exists "creator_growth_scores_public" on public.creator_growth_scores;
drop policy if exists "creator_boost_candidates_public" on public.creator_boost_candidates;
drop policy if exists "creator_leaderboard_public" on public.creator_leaderboard_weekly;

drop policy if exists "creator_virality_own_read" on public.creator_virality_snapshots;
create policy "creator_virality_own_read"
  on public.creator_virality_snapshots for select to authenticated
  using (
    creator_id in (select id from public.creator_profiles where user_id = auth.uid())
  );

drop policy if exists "creator_virality_admin_read" on public.creator_virality_snapshots;
create policy "creator_virality_admin_read"
  on public.creator_virality_snapshots for select to authenticated
  using (public.is_admin());

drop policy if exists "creator_growth_scores_own_read" on public.creator_growth_scores;
create policy "creator_growth_scores_own_read"
  on public.creator_growth_scores for select to authenticated
  using (
    creator_id in (select id from public.creator_profiles where user_id = auth.uid())
  );

drop policy if exists "creator_growth_scores_admin_read" on public.creator_growth_scores;
create policy "creator_growth_scores_admin_read"
  on public.creator_growth_scores for select to authenticated
  using (public.is_admin());

drop policy if exists "creator_boost_candidates_admin_read" on public.creator_boost_candidates;
create policy "creator_boost_candidates_admin_read"
  on public.creator_boost_candidates for select to authenticated
  using (public.is_admin());

drop policy if exists "creator_leaderboard_own_read" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_own_read"
  on public.creator_leaderboard_weekly for select to authenticated
  using (
    creator_id in (select id from public.creator_profiles where user_id = auth.uid())
  );

drop policy if exists "creator_leaderboard_admin_read" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_admin_read"
  on public.creator_leaderboard_weekly for select to authenticated
  using (public.is_admin());
