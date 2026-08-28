create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Shared trigger function that stamps updated_at on mutable rows.';

