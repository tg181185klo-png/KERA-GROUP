-- KERA GROUP — Map visibility expiry (30 days after approval)
-- Run in Supabase SQL Editor after 005–007

alter table public.properties
  add column if not exists approved_at timestamptz,
  add column if not exists map_expires_at timestamptz;

-- Extend status check to include `expired` (keep legacy archived/blocked values)
alter table public.properties drop constraint if exists properties_status_check;

alter table public.properties
  add constraint properties_status_check
  check (status in ('pending', 'active', 'blocked', 'archived', 'expired'));

-- Backfill approval window for listings already on the map
update public.properties
set
  approved_at = coalesce(approved_at, updated_at, created_at),
  map_expires_at = coalesce(
    map_expires_at,
    coalesce(approved_at, updated_at, created_at) + interval '30 days'
  )
where status in ('active', 'approved');

-- Mark listings whose map window has already passed
update public.properties
set status = 'expired'
where status in ('active', 'approved')
  and map_expires_at is not null
  and map_expires_at < now();

create index if not exists properties_map_expires_at_idx
  on public.properties (map_expires_at)
  where status = 'active';

create index if not exists properties_status_map_expires_idx
  on public.properties (status, map_expires_at);

notify pgrst, 'reload schema';
