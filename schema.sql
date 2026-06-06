-- Percy — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─── VOUCHERS TABLE ─────────────────────────────────────────────
create table public.vouchers (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,
  store       text        not null,
  barcode     text        not null default '',
  amount      numeric     not null default 0,
  remaining   numeric     not null default 0,
  currency    text        not null default '₪',
  location    text        not null default '',
  expired_by  date,
  status      text        not null default 'active'
              check (status in ('active', 'partial', 'used')),
  category    text        not null default '',
  color       text        not null default '#C7CEEA',
  notes       text        not null default '',
  favorite    boolean     not null default false,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────
-- Each user can only see and modify their own rows.
-- The user_id column stores the Auth0 "sub" claim from the JWT.

alter table public.vouchers enable row level security;

create policy "own select"
  on public.vouchers for select
  using (user_id = auth.jwt() ->> 'sub');

create policy "own insert"
  on public.vouchers for insert
  with check (user_id = auth.jwt() ->> 'sub');

create policy "own update"
  on public.vouchers for update
  using (user_id = auth.jwt() ->> 'sub');

create policy "own delete"
  on public.vouchers for delete
  using (user_id = auth.jwt() ->> 'sub');

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vouchers_updated_at
  before update on public.vouchers
  for each row execute procedure public.set_updated_at();

-- ─── STORAGE BUCKET ─────────────────────────────────────────────
-- Run these separately in the Supabase Dashboard → Storage → New Bucket
-- OR uncomment and run here (requires storage extension):

-- insert into storage.buckets (id, name, public)
-- values ('percy-photos', 'percy-photos', false);

-- Storage RLS policies (run after creating the bucket):
-- create policy "owner upload"
--   on storage.objects for insert
--   with check (bucket_id = 'percy-photos' and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]);

-- create policy "owner read"
--   on storage.objects for select
--   using (bucket_id = 'percy-photos' and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]);

-- create policy "owner delete"
--   on storage.objects for delete
--   using (bucket_id = 'percy-photos' and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]);
