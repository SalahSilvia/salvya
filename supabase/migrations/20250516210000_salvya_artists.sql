-- Artist profiles managed from admin (storefront + catalog).

create table if not exists public.salvya_artists (
  slug text primary key,
  name text not null,
  status_tag text not null default 'AVAILABLE'
    check (status_tag in ('AVAILABLE', 'LIMITED DROP', 'COMING SOON')),
  gradient text not null default 'from-[#241840] via-[#0c1a45] to-[#05060c]',
  ambient text not null default 'from-[#2D6BFF]/25 to-transparent',
  profile_image text not null,
  cover_image text not null,
  about_lead text not null default '',
  about_more text,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_artists_archived_sort_idx
  on public.salvya_artists (archived, sort_order, name);

alter table public.salvya_artists enable row level security;

drop policy if exists "salvya_artists_public_read_active" on public.salvya_artists;
create policy "salvya_artists_public_read_active"
  on public.salvya_artists for select
  using (archived = false);

drop policy if exists "salvya_artists_admin_all" on public.salvya_artists;
create policy "salvya_artists_admin_all"
  on public.salvya_artists for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed built-in artists (safe to re-run).
insert into public.salvya_artists (
  slug, name, status_tag, gradient, ambient, profile_image, cover_image, about_lead, about_more, sort_order
) values
  (
    'elgrandetoto', 'ElGrandeToto', 'AVAILABLE',
    'from-[#241840] via-[#0c1a45] to-[#05060c]', 'from-[#2D6BFF]/25 to-transparent',
    '/api/artist-avatar/elgrandetoto', '/api/artist-cover/elgrandetoto',
    'Rap from Casablanca with a worldwide audience — ElGrandeToto''s Salvya shop mirrors the energy of his stage sets in fabric and print.',
    'Expect heavyweight hoodies, clean typography, and graphics that reference the culture around his music. Stock is intentionally limited: when a run sells out, the next design may take a different direction. Check back after singles and tours for new waves.',
    10
  ),
  (
    'babygang', 'BabyGang', 'LIMITED DROP',
    'from-[#301018] via-[#120a14] to-[#050508]', 'from-[#ff4d6d]/12 to-transparent',
    '/api/artist-avatar/babygang', '/api/artist-cover/babygang',
    'Italian street rap with melody and bite — BabyGang''s line on Salvya leans dark palettes, sharp cuts, and graphics that read from a distance.',
    'Capsules are produced in small quantities so quality stays consistent. Limited tags mean the piece may not be restocked in the same color or print. If you see something you want, grab your size while it is still listed.',
    20
  ),
  (
    'tchubi', 'Tchubi', 'AVAILABLE',
    'from-[#0a2230] via-[#081018] to-[#040608]', 'from-white/5 to-transparent',
    '/api/artist-avatar/tchubi', '/api/artist-cover/tchubi',
    'Tchubi keeps silhouettes relaxed and colors restrained — pieces that work on tour, at home, or layered under a coat.',
    'Fabrics are chosen for hand-feel and longevity rather than seasonal gimmicks. Graphics stay minimal so the fit stays the focus. New items appear in quiet drops; bookmark this shop if you like a calmer wardrobe with a music edge.',
    30
  ),
  (
    'inkonnu', 'Inkonnu', 'AVAILABLE',
    'from-[#1a1025] via-[#0d1520] to-[#050508]', 'from-violet-400/15 to-transparent',
    '/api/artist-avatar/inkonnu', '/api/artist-cover/inkonnu',
    'Inkonnu sits between shadow and spotlight — Salvya pieces follow that mood with layered graphics and roomy fits.',
    'Look for washed blacks, off-whites, and occasional color hits tied to release artwork. Runs are modest in size so logistics stay tight. When a listing disappears, it is usually gone for good rather than held back for a restock.',
    40
  ),
  (
    'billie-eilish', 'Billie Eilish', 'LIMITED DROP',
    'from-[#0c1814] via-[#081210] to-[#050508]', 'from-emerald-400/12 to-transparent',
    '/media/artists/billie-eilish/profile.webp', '/media/artists/billie-eilish/cover.webp',
    'Billie''s Salvya lane mirrors her world — soft-dark palettes, oversized silhouettes, and graphics that feel personal rather than loud.',
    'Capsules land in small waves. When a colorway or print leaves the shop, the next drop may take a different visual direction. Follow the feed for tour-adjacent releases and limited collabs.',
    50
  ),
  (
    'drake', 'Drake', 'AVAILABLE',
    'from-[#1a1408] via-[#0f0c06] to-[#050508]', 'from-amber-200/10 to-transparent',
    '/media/artists/drake/profile.webp', '/media/artists/drake/cover.webp',
    'OVO energy on fabric — clean typography, premium blanks, and pieces that read as well courtside as they do on night drives.',
    'Expect restrained color stories with occasional gold hits and iconography that nods to Toronto and the broader OVO universe. Limited runs keep quality consistent; grab your size while it is listed.',
    60
  ),
  (
    'the-weeknd', 'The Weeknd', 'AVAILABLE',
    'from-[#220814] via-[#10060c] to-[#050508]', 'from-red-500/14 to-transparent',
    '/media/artists/the-weeknd/profile.webp', '/media/artists/the-weeknd/cover.webp',
    'After-hours aesthetics — deep reds, noir blacks, and merch that feels like a sequel to the show you just left.',
    'Graphics pull from era-specific artwork; fits stay roomy for layering. When a design cycles out, it may not return in the same form — bookmark this shop around tours and surprise releases.',
    70
  )
on conflict (slug) do nothing;
