-- Keep sale/rent editable on both legacy and current properties schemas.
-- Run in Supabase SQL Editor. App deploys do not apply this file automatically.

alter table public.properties add column if not exists deal_type text;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'properties'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%listing_type%'
  loop
    execute format('alter table public.properties drop constraint %I', constraint_name);
  end loop;

  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'properties'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%deal_type%'
  loop
    execute format('alter table public.properties drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.properties
  drop constraint if exists properties_listing_type_check;

alter table public.properties
  add constraint properties_listing_type_check
  check (
    listing_type is null
    or listing_type in ('sale', 'rent', 'seller', 'developer')
  );

update public.properties
set listing_type = 'rent'
where deal_type in ('rent', 'daily_rent')
  and listing_type is distinct from 'rent';
