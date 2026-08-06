-- KERA GROUP — Dashboard listings visibility for registered users
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rtseufuxngkgwmaipqui/sql

-- Ensure user_id exists on hybrid/legacy properties table
alter table public.properties add column if not exists user_id uuid references public.profiles (id) on delete set null;
alter table public.properties add column if not exists owner_email text;

create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists properties_owner_email_idx on public.properties (lower(trim(owner_email)));

-- Backfill user_id from owner_email
update public.properties p
set user_id = pr.id
from public.profiles pr
where p.user_id is null
  and p.owner_email is not null
  and p.owner_email <> ''
  and lower(trim(p.owner_email)) = lower(trim(pr.email));

-- Backfill user_id from phone
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

-- Backfill user_id from owner name
update public.properties p
set user_id = pr.id
from public.profiles pr
where p.user_id is null
  and p.owner_name is not null
  and trim(p.owner_name) <> ''
  and lower(trim(p.owner_name)) = lower(trim(pr.first_name || ' ' || pr.last_name));

-- RLS: owners can view by user_id, owner_email, or phone
drop policy if exists "Owners can view own properties" on public.properties;
create policy "Owners can view own properties"
  on public.properties for select
  using (
    auth.uid() = user_id
    or (
      owner_email is not null
      and owner_email <> ''
      and lower(trim(owner_email)) = lower(trim(coalesce(
        (select email from public.profiles where id = auth.uid()),
        ''
      )))
    )
    or (
      exists (
        select 1 from public.profiles pr
        where pr.id = auth.uid()
          and pr.phone is not null
          and pr.phone <> ''
          and (
            regexp_replace(coalesce(owner_phone, ''), '\D', '', 'g')
              like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
            or regexp_replace(coalesce(phone_number, ''), '\D', '', 'g')
              like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
          )
      )
    )
  );

-- RPC: fetch all listings for a user's dashboard (bypasses RLS safely)
create or replace function public.get_dashboard_listings(p_user_id uuid)
returns setof public.properties
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.properties p
  cross join public.profiles pr
  where pr.id = p_user_id
    and (
      p.user_id = p_user_id
      or (
        p.owner_email is not null
        and p.owner_email <> ''
        and lower(trim(p.owner_email)) = lower(trim(pr.email))
      )
      or (
        pr.phone is not null
        and pr.phone <> ''
        and (
          regexp_replace(coalesce(p.owner_phone, ''), '\D', '', 'g')
            like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
          or regexp_replace(coalesce(p.phone_number, ''), '\D', '', 'g')
            like '%' || right(regexp_replace(pr.phone, '\D', '', 'g'), 9)
        )
      )
      or (
        p.owner_name is not null
        and trim(p.owner_name) <> ''
        and lower(trim(p.owner_name)) = lower(trim(pr.first_name || ' ' || pr.last_name))
      )
    )
  order by p.created_at desc;
$$;

revoke all on function public.get_dashboard_listings(uuid) from public;
grant execute on function public.get_dashboard_listings(uuid) to authenticated;

notify pgrst, 'reload schema';
