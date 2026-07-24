-- ═══════════════════════════════════════════════════════════════════════════
-- KERA GROUP — გაუშვი Supabase SQL Editor-ში (ერთხელ)
-- Dashboard → SQL → New query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "postgis" schema extensions;

-- 2. Profiles (auth.users-თან დაკავშირება)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for existing auth users
insert into public.profiles (id, email, first_name, last_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- 3. Properties — ძველი ცხრილის გადატანა (თუ ახალი სქემა არ არის)

-- აკლია სვეტების დამატება ძველ ცხრილზე
alter table public.properties add column if not exists area_sqm numeric;
alter table public.properties add column if not exists currency text default 'USD';
alter table public.properties add column if not exists latitude double precision;
alter table public.properties add column if not exists longitude double precision;
alter table public.properties add column if not exists geojson_polygon jsonb;

-- არსებული pending → active (რუკაზე გამოსაჩენად)
update public.properties set status = 'active' where status = 'pending';

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'properties'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'cadastral_code'
  ) then
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'properties_legacy'
    ) then
      drop table public.properties;
    else
      alter table public.properties rename to properties_legacy;
    end if;
  end if;
end $$;

-- 4. ახალი properties ცხრილი
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  cadastral_code text not null,
  owner_first_name text not null,
  owner_last_name text not null,
  address text not null,
  phone_number text not null,
  total_price numeric not null check (total_price >= 0),
  area_sqm numeric not null check (area_sqm > 0),
  price_per_sqm numeric generated always as (
    case when area_sqm > 0 then round(total_price / area_sqm, 2) else null end
  ) stored,
  listing_type text not null check (listing_type in ('sale', 'rent')),
  status text not null default 'pending' check (status in ('pending', 'active', 'blocked')),
  latitude double precision,
  longitude double precision,
  coordinates extensions.geography(POINT, 4326),
  geojson_polygon jsonb,
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Unique cadastral (ignore if already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'properties_cadastral_code_key'
  ) then
    alter table public.properties add constraint properties_cadastral_code_key unique (cadastral_code);
  end if;
exception when others then
  null;
end $$;

create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_listing_type_idx on public.properties (listing_type);
create index if not exists properties_cadastral_idx on public.properties (cadastral_code);
create index if not exists properties_created_at_idx on public.properties (created_at desc);

-- PostGIS coordinates sync
create or replace function public.sync_property_coordinates()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.coordinates := extensions.st_setsrid(
      extensions.st_makepoint(new.longitude, new.latitude),
      4326
    )::extensions.geography;
  end if;
  return new;
end;
$$;

drop trigger if exists properties_sync_coordinates on public.properties;
create trigger properties_sync_coordinates
  before insert or update of latitude, longitude on public.properties
  for each row execute function public.sync_property_coordinates();

-- 5. RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Anyone can view active properties" on public.properties;
create policy "Anyone can view active properties"
  on public.properties for select using (status = 'active');

drop policy if exists "Owners can view own properties" on public.properties;
create policy "Owners can view own properties"
  on public.properties for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all properties" on public.properties;
create policy "Admins can view all properties"
  on public.properties for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Authenticated users can insert own properties" on public.properties;
create policy "Authenticated users can insert own properties"
  on public.properties for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Owners can update own pending properties" on public.properties;
create policy "Owners can update own pending properties"
  on public.properties for update
  using (auth.uid() = user_id and status = 'pending');

drop policy if exists "Admins can update any property" on public.properties;
create policy "Admins can update any property"
  on public.properties for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Owners can delete own pending properties" on public.properties;
create policy "Owners can delete own pending properties"
  on public.properties for delete
  using (auth.uid() = user_id and status = 'pending');

drop policy if exists "Admins can delete any property" on public.properties;
create policy "Admins can delete any property"
  on public.properties for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 6. Storage
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images"
  on storage.objects for select using (bucket_id = 'property-images');

drop policy if exists "Authenticated users upload property images" on storage.objects;
create policy "Authenticated users upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

drop policy if exists "Users delete own property images" on storage.objects;
create policy "Users delete own property images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- 7. Map helper
create or replace function public.get_active_properties_for_map()
returns table (
  id uuid,
  title text,
  cadastral_code text,
  owner_first_name text,
  owner_last_name text,
  address text,
  phone_number text,
  total_price numeric,
  area_sqm numeric,
  price_per_sqm numeric,
  listing_type text,
  latitude double precision,
  longitude double precision,
  geojson_polygon jsonb,
  images text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.title, p.cadastral_code,
    p.owner_first_name, p.owner_last_name,
    p.address, p.phone_number,
    p.total_price, p.area_sqm, p.price_per_sqm,
    p.listing_type, p.latitude, p.longitude,
    p.geojson_polygon, p.images
  from public.properties p
  where p.status = 'active'
    and p.latitude is not null
    and p.longitude is not null;
$$;

grant execute on function public.get_active_properties_for_map() to anon, authenticated;

-- 8. Schema cache reload (PostgREST)
notify pgrst, 'reload schema';

-- ✅ დასრულდა! ახლა სცადე რეგისტრაცია და განცხადების დამატება.
