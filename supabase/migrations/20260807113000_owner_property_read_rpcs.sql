create or replace function public.get_owner_property(property_uuid uuid)
returns table (
  id uuid,
  owner_profile_id uuid,
  public_slug text,
  title text,
  description text,
  property_type public.property_type,
  moderation_status public.property_moderation_status,
  publication_status public.property_publication_status,
  country_code text,
  country_name text,
  city text,
  area text,
  address_line_1 text,
  address_line_2 text,
  building_name text,
  latitude numeric,
  longitude numeric,
  location_precision public.location_precision,
  max_guests integer,
  bedrooms_count integer,
  beds_count integer,
  bathrooms_count integer,
  area_size_sqm integer,
  base_nightly_amount integer,
  cleaning_fee_amount integer,
  security_deposit_amount integer,
  currency_code text,
  minimum_nights integer,
  maximum_nights integer,
  instant_book_enabled boolean,
  submitted_for_review_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  published_at timestamptz,
  unpublished_at timestamptz,
  suspended_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
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
    p.owner_profile_id,
    p.public_slug,
    p.title,
    p.description,
    p.property_type,
    p.moderation_status,
    p.publication_status,
    p.country_code,
    p.country_name,
    p.city,
    p.area,
    p.address_line_1,
    p.address_line_2,
    p.building_name,
    p.latitude,
    p.longitude,
    p.location_precision,
    p.max_guests,
    p.bedrooms_count,
    p.beds_count,
    p.bathrooms_count,
    p.area_size_sqm,
    p.base_nightly_amount,
    p.cleaning_fee_amount,
    p.security_deposit_amount,
    p.currency_code,
    p.minimum_nights,
    p.maximum_nights,
    p.instant_book_enabled,
    p.submitted_for_review_at,
    p.approved_at,
    p.rejected_at,
    p.published_at,
    p.unpublished_at,
    p.suspended_at,
    p.archived_at,
    p.created_at,
    p.updated_at
  from public.properties as p
  where p.id = property_uuid
    and p.owner_profile_id = current_user_id
    and p.deleted_at is null;
end;
$$;

comment on function public.get_owner_property(uuid) is 'Owner-scoped trusted read for full property management details without broadening direct table column grants.';

revoke all on function public.get_owner_property(uuid) from public;
grant execute on function public.get_owner_property(uuid) to authenticated;

create or replace function public.get_owner_property_availability(
  property_uuid uuid,
  date_from date default null,
  date_to date default null
)
returns table (
  id uuid,
  availability_date date,
  status public.availability_status,
  reason public.availability_reason,
  booking_id uuid,
  note text
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
    a.id,
    a.availability_date,
    a.status,
    a.reason,
    a.booking_id,
    a.note
  from public.property_availability as a
  where a.property_id = property_uuid
    and (date_from is null or a.availability_date >= date_from)
    and (date_to is null or a.availability_date <= date_to)
  order by a.availability_date asc;
end;
$$;

comment on function public.get_owner_property_availability(uuid, date, date) is 'Owner-scoped trusted read for property availability metadata, including booking-derived rows that remain read-only to owners.';

revoke all on function public.get_owner_property_availability(uuid, date, date) from public;
grant execute on function public.get_owner_property_availability(uuid, date, date) to authenticated;
