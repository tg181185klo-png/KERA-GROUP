-- KERA GROUP — Step 1: Create profiles table (run BEFORE 004)
-- Supabase SQL Editor → New query → Paste ALL → Run
-- Project: https://supabase.com/dashboard/project/rtseufuxngkgwmaipqui/sql/new

create extension if not exists "pgcrypto";

-- ─── Profiles (linked to auth.users) ─────────────────────────────────────────
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

-- Auto-create profile when user registers
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

-- Import existing registered users into profiles
insert into public.profiles (id, email, first_name, last_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ─── RLS for profiles ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

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

notify pgrst, 'reload schema';

-- ✅ Step 1 done. Now run: supabase/migrations/004_dashboard_listings_rpc.sql
