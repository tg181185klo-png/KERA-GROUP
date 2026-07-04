-- KERA GROUP — Supabase schema
-- Run in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_name text not null,
  owner_phone text not null,
  owner_email text,
  address text not null,
  property_type text not null check (property_type in ('apartment', 'house', 'commercial', 'land')),
  deal_type text not null check (deal_type in ('sale', 'rent')),
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  description text,
  images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'active', 'archived')),
  bedrooms integer,
  area_sqm numeric,
  features text[] default '{}',
  listing_type text default 'seller' check (listing_type in ('seller', 'developer'))
);

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_created_at_idx on public.properties (created_at desc);

alter table public.properties enable row level security;

-- Public read: active listings only (archived = hidden from site)
drop policy if exists "Public can view active properties" on public.properties;
create policy "Public can view active properties"
  on public.properties for select
  using (status = 'active');

-- Storage bucket for property images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Allow public uploads to property-images bucket (submit form)
drop policy if exists "Anyone can upload property images" on storage.objects;
create policy "Anyone can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images');

drop policy if exists "Public can view property images" on storage.objects;
create policy "Public can view property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- Note: Admin CRUD (approve, hide, delete) uses SUPABASE_SERVICE_ROLE_KEY via API routes.
