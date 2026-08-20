-- KERA GROUP — Listing query performance indexes (run in Supabase SQL Editor after 006)
-- Covers admin filters, dashboard queries, map/geo search, and cadastral lookups.

create index if not exists properties_deal_type_idx
  on public.properties (deal_type);

create index if not exists properties_status_created_at_idx
  on public.properties (status, created_at desc);

create index if not exists properties_user_status_idx
  on public.properties (user_id, status);

create index if not exists properties_status_deal_type_idx
  on public.properties (status, deal_type)
  where status = 'active';

-- Geo index (safe if coordinates column already indexed in 001)
create index if not exists properties_coordinates_gist_idx
  on public.properties using gist (coordinates);

notify pgrst, 'reload schema';
