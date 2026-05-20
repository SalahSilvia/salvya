-- Public product comments / reviews (one row per user per product).

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  artist_slug text not null,
  product_kind text not null check (product_kind in ('hoodie', 'tshirt')),
  item_slug text not null,
  author_label text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist_slug, product_kind, item_slug)
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (artist_slug, product_kind, item_slug, created_at desc);

create index if not exists product_reviews_user_idx on public.product_reviews (user_id);

alter table public.product_reviews enable row level security;

create policy "Anyone can read product reviews"
  on public.product_reviews
  for select
  using (true);

create policy "Users insert own review"
  on public.product_reviews
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own review"
  on public.product_reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own review"
  on public.product_reviews
  for delete
  using (auth.uid() = user_id);
