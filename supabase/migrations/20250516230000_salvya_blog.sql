-- Salvya blog posts (admin CMS + public magazine).

create table if not exists public.salvya_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  excerpt text not null default '',
  body_md text not null default '',
  cover_image text not null default '',
  author_name text not null default 'Salvya',
  author_role text not null default '',
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  read_time_minutes integer not null default 1 check (read_time_minutes >= 1),
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_blog_posts_status_published_idx
  on public.salvya_blog_posts (status, published_at desc nulls last);

create index if not exists salvya_blog_posts_featured_idx
  on public.salvya_blog_posts (featured, published_at desc)
  where status = 'published';

alter table public.salvya_blog_posts enable row level security;

drop policy if exists "salvya_blog_posts_public_read_published" on public.salvya_blog_posts;
create policy "salvya_blog_posts_public_read_published"
  on public.salvya_blog_posts for select
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
  );

drop policy if exists "salvya_blog_posts_admin_all" on public.salvya_blog_posts;
create policy "salvya_blog_posts_admin_all"
  on public.salvya_blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());
