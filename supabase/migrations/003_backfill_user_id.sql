-- KERA GROUP — Backfill user_id on legacy listings from owner_email
-- Run in Supabase SQL Editor when registered users cannot see old listings.

-- Ensure user_id column exists on hybrid/legacy properties table
alter table public.properties add column if not exists user_id uuid references public.profiles (id) on delete set null;

create index if not exists properties_user_id_idx on public.properties (user_id);

-- Link orphan listings to profiles by matching owner_email (case-insensitive)
update public.properties p
set user_id = pr.id
from public.profiles pr
where p.user_id is null
  and p.owner_email is not null
  and lower(trim(p.owner_email)) = lower(trim(pr.email));

-- Optional: link by phone when profile.phone matches owner_phone / phone_number
update public.properties p
set user_id = pr.id
from public.profiles pr
where p.user_id is null
  and pr.phone is not null
  and pr.phone <> ''
  and (
    regexp_replace(coalesce(p.owner_phone, ''), '\D', '', 'g') like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
    or regexp_replace(coalesce(p.phone_number, ''), '\D', '', 'g') like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
  );

-- RLS: allow owners to view listings matched by user_id (already in 001/FIX-RUN-THIS)
drop policy if exists "Owners can view own properties" on public.properties;
create policy "Owners can view own properties"
  on public.properties for select
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
