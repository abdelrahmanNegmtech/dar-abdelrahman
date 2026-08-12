create or replace function public.get_owner_property_photos(property_uuid uuid)
returns table (
  id uuid,
  property_id uuid,
  storage_path text,
  caption text,
  photo_category public.property_photo_category,
  sort_order integer,
  is_cover boolean
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

  if not exists (
    select 1
    from public.properties as p
    where p.id = property_uuid
      and p.owner_profile_id = current_user_id
      and p.deleted_at is null
  ) then
    raise exception 'Property not found';
  end if;

  return query
  select
    photo.id,
    photo.property_id,
    photo.storage_path,
    photo.caption,
    photo.photo_category,
    photo.sort_order,
    photo.is_cover
  from public.property_photos as photo
  where photo.property_id = property_uuid
    and photo.deleted_at is null
  order by photo.sort_order asc, photo.created_at asc;
end;
$$;

comment on function public.get_owner_property_photos(uuid) is 'Owner-scoped trusted read for active property photo metadata without broadening direct deleted_at visibility.';

revoke all on function public.get_owner_property_photos(uuid) from public;
grant execute on function public.get_owner_property_photos(uuid) to authenticated;
