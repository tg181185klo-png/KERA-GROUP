-- Optional: add the column if this database never had it, then refresh the API cache.
-- The app saves sale/rent without this column. Run in the Supabase SQL Editor.

alter table public.properties add column if not exists deal_type text;
alter table public.properties add column if not exists listing_type text;

notify pgrst, 'reload schema';
