create or replace function public.submit_property_for_review(property_uuid uuid)
returns table (
  id uuid,
  moderation_status public.property_moderation_status,
  publication_status public.property_publication_status,
  submitted_for_review_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  property_row public.properties%rowtype;
  active_photo_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select p.*
  into property_row
  from public.properties as p
  where p.id = property_uuid
    and p.owner_profile_id = current_user_id
    and p.deleted_at is null
  for update;

  if not found then
    raise exception 'Property not found';
  end if;

  if property_row.publication_status <> 'unpublished'::public.property_publication_status then
    raise exception 'Property is not eligible for submission';
  end if;

  if property_row.moderation_status not in (
    'draft'::public.property_moderation_status,
    'rejected'::public.property_moderation_status
  ) then
    raise exception 'Property is not eligible for submission';
  end if;

  if property_row.title is null
    or btrim(property_row.title) = ''
    or property_row.city is null
    or btrim(property_row.city) = ''
    or property_row.address_line_1 is null
    or btrim(property_row.address_line_1) = ''
    or property_row.max_guests < 1
    or property_row.base_nightly_amount < 1 then
    raise exception 'Property is incomplete';
  end if;

  select count(*)
  into active_photo_count
  from public.property_photos as photo
  where photo.property_id = property_row.id
    and photo.deleted_at is null;

  if active_photo_count < 1 then
    raise exception 'Property must include at least one photo';
  end if;

  update public.properties as p
  set moderation_status = 'submitted'::public.property_moderation_status,
      publication_status = 'unpublished'::public.property_publication_status,
      submitted_for_review_at = now(),
      rejected_at = null,
      updated_at = now()
  where p.id = property_row.id
  returning
    p.id,
    p.moderation_status,
    p.publication_status,
    p.submitted_for_review_at
  into id, moderation_status, publication_status, submitted_for_review_at;

  return next;
end;
$$;

comment on function public.submit_property_for_review(uuid) is 'Owner-scoped trusted workflow for moving a draft or rejected property into the submitted moderation state without exposing broader moderation writes.';

revoke all on function public.submit_property_for_review(uuid) from public;
grant execute on function public.submit_property_for_review(uuid) to authenticated;
