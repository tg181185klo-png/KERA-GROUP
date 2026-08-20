-- KERA GROUP — Profile change history (run in Supabase SQL Editor after 005)
-- Tracks old/new values when users update name or phone from dashboard.

create table if not exists public.profile_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  field text not null check (field in ('first_name', 'last_name', 'phone')),
  old_value text,
  new_value text,
  changed_by uuid references auth.users (id),
  changed_at timestamptz not null default now()
);

create index if not exists profile_changes_user_id_idx
  on public.profile_changes (user_id, changed_at desc);

alter table public.profile_changes enable row level security;

drop policy if exists "Users can read own profile changes" on public.profile_changes;
create policy "Users can read own profile changes"
  on public.profile_changes for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all profile changes" on public.profile_changes;
create policy "Admins can read all profile changes"
  on public.profile_changes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

notify pgrst, 'reload schema';
