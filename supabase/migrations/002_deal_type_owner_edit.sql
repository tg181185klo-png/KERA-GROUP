-- KERA GROUP — deal_type column + owner can edit own listings
-- Run in Supabase SQL Editor after 001_property_listing_system.sql

alter table public.properties add column if not exists deal_type text;

update public.properties
set deal_type = case
  when listing_type in ('daily_rent', 'pledge') then listing_type
  when listing_type = 'rent' then 'rent'
  when deal_type in ('sale', 'rent', 'daily_rent', 'pledge') then deal_type
  else 'sale'
end
where deal_type is null or deal_type = '';

-- Allow owners to edit their listings (API resets status to pending after edit)
drop policy if exists "Owners can update own pending properties" on public.properties;
create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = user_id);
