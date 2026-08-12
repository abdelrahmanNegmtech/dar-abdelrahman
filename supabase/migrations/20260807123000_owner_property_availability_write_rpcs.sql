create or replace function public.set_owner_property_availability_range(
  property_uuid uuid,
  date_from date,
  date_to date,
  target_status public.availability_status,
  target_reason public.availability_reason default null,
  target_note text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  has_booked_rows boolean;
  affected_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if date_from is null or date_to is null or date_from > date_to then
    raise exception 'Invalid date range';
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

  select exists (
    select 1
    from public.property_availability as a
    where a.property_id = property_uuid
      and a.availability_date between date_from and date_to
      and a.booking_id is not null
  )
  into has_booked_rows;

  if has_booked_rows then
    raise exception 'Booked dates cannot be edited or deleted';
  end if;

  if target_status = 'available'::public.availability_status then
    delete from public.property_availability as a
    where a.property_id = property_uuid
      and a.availability_date between date_from and date_to
      and a.booking_id is null;

    get diagnostics affected_count = row_count;
    return affected_count;
  end if;

  insert into public.property_availability (
    property_id,
    availability_date,
    status,
    reason,
    note
  )
  select
    property_uuid,
    generated_date::date,
    'blocked'::public.availability_status,
    coalesce(target_reason, 'owner_blocked'::public.availability_reason),
    nullif(btrim(target_note), '')
  from generate_series(date_from, date_to, interval '1 day') as generated_date
  on conflict (property_id, availability_date)
  do update
  set status = excluded.status,
      reason = excluded.reason,
      note = excluded.note,
      updated_at = now()
  where public.property_availability.booking_id is null;

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

comment on function public.set_owner_property_availability_range(uuid, date, date, public.availability_status, public.availability_reason, text) is 'Owner-scoped trusted workflow for blocking or reopening manual availability ranges without exposing direct property_availability row identifiers.';

revoke all on function public.set_owner_property_availability_range(uuid, date, date, public.availability_status, public.availability_reason, text) from public;
grant execute on function public.set_owner_property_availability_range(uuid, date, date, public.availability_status, public.availability_reason, text) to authenticated;

create or replace function public.update_owner_property_availability_entry(
  availability_uuid uuid,
  target_status public.availability_status,
  target_reason public.availability_reason default null,
  target_note text default null
)
returns table (
  id uuid,
  property_id uuid,
  availability_date date,
  status public.availability_status,
  reason public.availability_reason,
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

  return query
  update public.property_availability as a
  set status = target_status,
      reason = case
        when target_status = 'blocked'::public.availability_status
          then coalesce(target_reason, 'owner_blocked'::public.availability_reason)
        else null
      end,
      note = nullif(btrim(target_note), ''),
      updated_at = now()
  where a.id = availability_uuid
    and a.booking_id is null
    and exists (
      select 1
      from public.properties as p
      where p.id = a.property_id
        and p.owner_profile_id = current_user_id
        and p.deleted_at is null
    )
  returning
    a.id,
    a.property_id,
    a.availability_date,
    a.status,
    a.reason,
    a.note;

  if not found then
    raise exception 'Availability row not found or is not manually editable';
  end if;
end;
$$;

comment on function public.update_owner_property_availability_entry(uuid, public.availability_status, public.availability_reason, text) is 'Owner-scoped trusted workflow for editing a single manual availability row.';

revoke all on function public.update_owner_property_availability_entry(uuid, public.availability_status, public.availability_reason, text) from public;
grant execute on function public.update_owner_property_availability_entry(uuid, public.availability_status, public.availability_reason, text) to authenticated;

create or replace function public.delete_owner_property_availability_entry(availability_uuid uuid)
returns table (
  id uuid,
  property_id uuid
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
  delete from public.property_availability as a
  where a.id = availability_uuid
    and a.booking_id is null
    and exists (
      select 1
      from public.properties as p
      where p.id = a.property_id
        and p.owner_profile_id = current_user_id
        and p.deleted_at is null
    )
  returning
    a.id,
    a.property_id;

  if not found then
    raise exception 'Availability row not found or is not manually deletable';
  end if;
end;
$$;

comment on function public.delete_owner_property_availability_entry(uuid) is 'Owner-scoped trusted workflow for deleting a single manual availability row.';

revoke all on function public.delete_owner_property_availability_entry(uuid) from public;
grant execute on function public.delete_owner_property_availability_entry(uuid) to authenticated;
