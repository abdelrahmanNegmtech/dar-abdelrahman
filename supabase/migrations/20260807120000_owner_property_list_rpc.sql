create or replace function public.list_owner_properties()
returns table (
  id uuid,
  title text,
  city text,
  area text,
  country_name text,
  moderation_status public.property_moderation_status,
  publication_status public.property_publication_status,
  updated_at timestamptz,
  photo_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    p.id,
    p.title,
    p.city,
    p.area,
    p.country_name,
    p.moderation_status,
    p.publication_status,
    p.updated_at,
    count(photo.id) as photo_count
  from public.properties as p
  left join public.property_photos as photo
    on photo.property_id = p.id
   and photo.deleted_at is null
  where p.owner_profile_id = current_user_id
    and p.deleted_at is null
  group by
    p.id,
    p.title,
    p.city,
    p.area,
    p.country_name,
    p.moderation_status,
    p.publication_status,
    p.updated_at
  order by p.updated_at desc;
end;
$$;

comment on function public.list_owner_properties() is 'Owner-scoped trusted list query for property management dashboards without broadening direct properties grants.';

revoke all on function public.list_owner_properties() from public;
grant execute on function public.list_owner_properties() to authenticated;
