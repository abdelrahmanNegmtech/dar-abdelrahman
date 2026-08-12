do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'property_availability_property_date_unique'
      and conrelid = 'public.property_availability'::regclass
  ) then
    alter table public.property_availability
      add constraint property_availability_property_date_unique
      unique using index property_availability_property_date_key;
  end if;
end;
$$;

create or replace function public.generate_booking_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'DAR-'
      || to_char(timezone('utc', now()), 'YYMMDD')
      || '-'
      || upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 6));

    exit when not exists (
      select 1
      from public.bookings as b
      where b.booking_reference = candidate
    );
  end loop;

  return candidate;
end;
$$;

comment on function public.generate_booking_reference() is 'Generates a unique human-readable booking reference for trusted booking workflows.';

revoke all on function public.generate_booking_reference() from public;
grant execute on function public.generate_booking_reference() to authenticated;

create or replace function public.create_traveler_booking(
  property_lookup text,
  requested_check_in date,
  requested_check_out date,
  requested_guests integer,
  traveler_full_name_input text default null,
  traveler_email_input text default null,
  traveler_phone_input text default null,
  special_requests_input text default null,
  payment_method_input text default null
)
returns table (
  id uuid,
  booking_reference text,
  property_id uuid,
  owner_id uuid,
  status public.booking_status,
  payment_status public.booking_payment_status,
  check_in_date date,
  check_out_date date,
  guests_count integer,
  nightly_amount integer,
  cleaning_fee_amount integer,
  service_fee_amount integer,
  discount_amount integer,
  subtotal_amount integer,
  total_amount integer,
  currency_code text,
  payment_reference text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  traveler_profile public.profiles%rowtype;
  target_property public.properties%rowtype;
  active_booking_id uuid := extensions.gen_random_uuid();
  active_booking_reference text;
  active_payment_reference text;
  stay_nights integer;
  current_night date;
  weekday_index integer;
  nightly_price integer;
  base_subtotal integer := 0;
  computed_subtotal integer := 0;
  computed_discount integer := 0;
  computed_service_fee integer := 0;
  effective_minimum_nights integer;
  effective_maximum_nights integer;
  inserted_nights integer := 0;
  rule_summary record;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if property_lookup is null or btrim(property_lookup) = '' then
    raise exception 'Property is required'
      using errcode = 'P0001';
  end if;

  if requested_check_in is null or requested_check_out is null or requested_check_out <= requested_check_in then
    raise exception 'Check-out must be after check-in'
      using errcode = 'P0001';
  end if;

  if requested_guests is null or requested_guests < 1 then
    raise exception 'At least one guest is required'
      using errcode = 'P0001';
  end if;

  select p.*
  into traveler_profile
  from public.profiles as p
  where p.id = current_user_id
    and p.deleted_at is null
    and p.is_active = true
  limit 1;

  if traveler_profile.id is null then
    raise exception 'Traveler profile not found'
      using errcode = 'P0001';
  end if;

  select p.*
  into target_property
  from public.properties as p
  where p.deleted_at is null
    and p.moderation_status = 'approved'::public.property_moderation_status
    and p.publication_status = 'published'::public.property_publication_status
    and (
      p.id = public.uuid_or_null(property_lookup)
      or p.public_slug = property_lookup
    )
  limit 1;

  if target_property.id is null then
    raise exception 'Property is not available for booking'
      using errcode = 'P0001';
  end if;

  if requested_guests > target_property.max_guests then
    raise exception 'Guest count exceeds the property capacity'
      using errcode = 'P0001';
  end if;

  stay_nights := requested_check_out - requested_check_in;
  effective_minimum_nights := target_property.minimum_nights;
  effective_maximum_nights := target_property.maximum_nights;

  if exists (
    select 1
    from public.bookings as b
    where b.property_id = target_property.id
      and b.status in (
        'pending_payment_verification'::public.booking_status,
        'pending_owner_approval'::public.booking_status,
        'confirmed'::public.booking_status
      )
      and requested_check_in < b.check_out_date
      and requested_check_out > b.check_in_date
  ) then
    raise exception 'Selected dates are no longer available'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.property_availability as a
    where a.property_id = target_property.id
      and a.availability_date >= requested_check_in
      and a.availability_date < requested_check_out
      and a.status in (
        'blocked'::public.availability_status,
        'booked'::public.availability_status
      )
  ) then
    raise exception 'Selected dates are blocked or already booked'
      using errcode = 'P0001';
  end if;

  for current_night in
    select generate_series(requested_check_in, requested_check_out - 1, interval '1 day')::date
  loop
    weekday_index := extract(isodow from current_night)::integer - 1;
    base_subtotal := base_subtotal + target_property.base_nightly_amount;

    select
      max(r.minimum_nights_override) as minimum_nights_override,
      min(r.maximum_nights_override) filter (where r.maximum_nights_override is not null) as maximum_nights_override,
      (
        array_agg(r.nightly_amount_override order by r.priority asc, r.created_at asc)
        filter (where r.nightly_amount_override is not null)
      )[1] as nightly_amount_override,
      coalesce(sum(r.percent_adjustment), 0) as percent_adjustment_total
    into rule_summary
    from public.property_pricing_rules as r
    where r.property_id = target_property.id
      and r.deleted_at is null
      and r.is_active = true
      and current_night between r.starts_on and r.ends_on
      and (
        r.days_of_week_mask is null
        or ((r.days_of_week_mask >> weekday_index) & 1) = 1
      );

    effective_minimum_nights := greatest(
      effective_minimum_nights,
      coalesce(rule_summary.minimum_nights_override, 0)
    );

    if rule_summary.maximum_nights_override is not null then
      effective_maximum_nights := case
        when effective_maximum_nights is null then rule_summary.maximum_nights_override
        else least(effective_maximum_nights, rule_summary.maximum_nights_override)
      end;
    end if;

    nightly_price := coalesce(rule_summary.nightly_amount_override, target_property.base_nightly_amount);
    nightly_price := round(nightly_price * (100 + coalesce(rule_summary.percent_adjustment_total, 0)) / 100.0);

    if nightly_price <= 0 then
      raise exception 'Computed nightly price is invalid'
        using errcode = 'P0001';
    end if;

    computed_subtotal := computed_subtotal + nightly_price;
  end loop;

  if stay_nights < effective_minimum_nights then
    raise exception 'Booking does not meet the minimum stay requirement'
      using errcode = 'P0001';
  end if;

  if effective_maximum_nights is not null and stay_nights > effective_maximum_nights then
    raise exception 'Booking exceeds the maximum stay limit'
      using errcode = 'P0001';
  end if;

  computed_discount := greatest(base_subtotal - computed_subtotal, 0);
  computed_service_fee := round(computed_subtotal * 0.05);
  active_booking_reference := public.generate_booking_reference();
  active_payment_reference := upper(coalesce(nullif(regexp_replace(payment_method_input, '[^a-z0-9]+', '', 'gi'), ''), 'manual'))
    || '-'
    || upper(substr(replace(active_booking_id::text, '-', ''), 1, 10));

  insert into public.bookings (
    id,
    booking_reference,
    property_id,
    traveler_id,
    owner_id,
    status,
    payment_status,
    check_in_date,
    check_out_date,
    guests_count,
    nightly_amount,
    cleaning_fee_amount,
    service_fee_amount,
    discount_amount,
    subtotal_amount,
    total_amount,
    currency_code,
    traveler_full_name,
    traveler_email,
    traveler_phone,
    special_requests,
    payment_reference,
    requested_at,
    payment_submitted_at
  )
  values (
    active_booking_id,
    active_booking_reference,
    target_property.id,
    current_user_id,
    target_property.owner_profile_id,
    'pending_owner_approval'::public.booking_status,
    'under_review'::public.booking_payment_status,
    requested_check_in,
    requested_check_out,
    requested_guests,
    round(computed_subtotal / stay_nights::numeric),
    target_property.cleaning_fee_amount,
    computed_service_fee,
    computed_discount,
    computed_subtotal,
    computed_subtotal + target_property.cleaning_fee_amount + computed_service_fee,
    target_property.currency_code,
    coalesce(nullif(btrim(traveler_full_name_input), ''), traveler_profile.full_name),
    coalesce(nullif(btrim(traveler_email_input), ''), traveler_profile.email::text),
    coalesce(nullif(btrim(traveler_phone_input), ''), traveler_profile.phone),
    nullif(btrim(special_requests_input), ''),
    active_payment_reference,
    now(),
    now()
  );

  insert into public.property_availability (
    property_id,
    availability_date,
    status,
    reason,
    booking_id,
    note
  )
  select
    target_property.id,
    generated_date::date,
    'booked'::public.availability_status,
    'booking_hold'::public.availability_reason,
    active_booking_id,
    'Reserved pending owner approval.'
  from generate_series(requested_check_in, requested_check_out - 1, interval '1 day') as generated_date
  on conflict on constraint property_availability_property_date_unique do nothing;

  get diagnostics inserted_nights = row_count;

  if inserted_nights <> stay_nights then
    raise exception 'Selected dates were reserved by another booking. Please choose new dates.'
      using errcode = 'P0001';
  end if;

  return query
  select
    b.id,
    b.booking_reference,
    b.property_id,
    b.owner_id,
    b.status,
    b.payment_status,
    b.check_in_date,
    b.check_out_date,
    b.guests_count,
    b.nightly_amount,
    b.cleaning_fee_amount,
    b.service_fee_amount,
    b.discount_amount,
    b.subtotal_amount,
    b.total_amount,
    b.currency_code,
    b.payment_reference
  from public.bookings as b
  where b.id = active_booking_id;
end;
$$;

comment on function public.create_traveler_booking(text, date, date, integer, text, text, text, text, text) is 'Traveler-scoped trusted workflow that creates a booking, snapshots safe pricing facts, and holds availability without trusting client-supplied owner or monetary fields.';

revoke all on function public.create_traveler_booking(text, date, date, integer, text, text, text, text, text) from public;
grant execute on function public.create_traveler_booking(text, date, date, integer, text, text, text, text, text) to authenticated;

create or replace function public.owner_decide_booking(
  booking_uuid uuid,
  owner_decision text,
  response_message text default null
)
returns table (
  id uuid,
  booking_reference text,
  status public.booking_status,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  owner_response_message text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_booking public.bookings%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if owner_decision not in ('approve', 'decline') then
    raise exception 'Unsupported booking decision'
      using errcode = 'P0001';
  end if;

  select b.*
  into target_booking
  from public.bookings as b
  where b.id = booking_uuid
    and b.owner_id = current_user_id
  limit 1;

  if target_booking.id is null then
    raise exception 'Booking not found for this owner'
      using errcode = 'P0001';
  end if;

  if target_booking.status <> 'pending_owner_approval'::public.booking_status then
    raise exception 'Booking is not eligible for this owner decision'
      using errcode = 'P0001';
  end if;

  if owner_decision = 'approve' then
    update public.bookings as b
    set
      status = 'confirmed'::public.booking_status,
      payment_status = case
        when b.payment_status in (
          'pending'::public.booking_payment_status,
          'under_review'::public.booking_payment_status
        ) then 'authorized'::public.booking_payment_status
        else b.payment_status
      end,
      owner_actioned_at = now(),
      confirmed_at = now(),
      owner_response_message = nullif(btrim(response_message), '')
    where b.id = booking_uuid;

    update public.property_availability as a
    set
      status = 'booked'::public.availability_status,
      reason = 'confirmed_booking'::public.availability_reason,
      note = 'Confirmed booking hold.'
    where a.booking_id = booking_uuid;
  else
    update public.bookings as b
    set
      status = 'declined'::public.booking_status,
      owner_actioned_at = now(),
      owner_response_message = nullif(btrim(response_message), '')
    where b.id = booking_uuid;

    delete from public.property_availability as a
    where a.booking_id = booking_uuid;
  end if;

  return query
  select
    b.id,
    b.booking_reference,
    b.status,
    b.owner_actioned_at,
    b.confirmed_at,
    b.owner_response_message
  from public.bookings as b
  where b.id = booking_uuid;
end;
$$;

comment on function public.owner_decide_booking(uuid, text, text) is 'Owner-scoped trusted booking transition workflow for approving or declining pending booking requests while safely updating linked availability.';

revoke all on function public.owner_decide_booking(uuid, text, text) from public;
grant execute on function public.owner_decide_booking(uuid, text, text) to authenticated;

create or replace function public.traveler_cancel_booking(
  booking_uuid uuid,
  cancellation_note text default null
)
returns table (
  id uuid,
  booking_reference text,
  status public.booking_status,
  cancelled_at timestamptz,
  cancellation_reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_booking public.bookings%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  select b.*
  into target_booking
  from public.bookings as b
  where b.id = booking_uuid
    and b.traveler_id = current_user_id
  limit 1;

  if target_booking.id is null then
    raise exception 'Booking not found for this traveler'
      using errcode = 'P0001';
  end if;

  if target_booking.status not in (
    'pending_payment_verification'::public.booking_status,
    'pending_owner_approval'::public.booking_status,
    'confirmed'::public.booking_status
  ) then
    raise exception 'Booking cannot be cancelled in its current state'
      using errcode = 'P0001';
  end if;

  update public.bookings as b
  set
    status = 'cancelled'::public.booking_status,
    cancellation_reason = nullif(btrim(cancellation_note), ''),
    cancelled_at = now()
  where b.id = booking_uuid;

  delete from public.property_availability as a
  where a.booking_id = booking_uuid;

  return query
  select
    b.id,
    b.booking_reference,
    b.status,
    b.cancelled_at,
    b.cancellation_reason
  from public.bookings as b
  where b.id = booking_uuid;
end;
$$;

comment on function public.traveler_cancel_booking(uuid, text) is 'Traveler-scoped trusted booking cancellation workflow that stamps cancellation metadata and safely releases booking-held availability.';

revoke all on function public.traveler_cancel_booking(uuid, text) from public;
grant execute on function public.traveler_cancel_booking(uuid, text) to authenticated;

create or replace function public.get_traveler_bookings()
returns table (
  id uuid,
  booking_reference text,
  property_id uuid,
  property_slug text,
  property_title text,
  property_type public.property_type,
  property_city text,
  property_area text,
  property_country_name text,
  property_max_guests integer,
  property_bedrooms_count integer,
  property_bathrooms_count integer,
  property_area_size_sqm integer,
  property_base_nightly_amount integer,
  check_in_date date,
  check_out_date date,
  guests_count integer,
  nightly_amount integer,
  cleaning_fee_amount integer,
  service_fee_amount integer,
  discount_amount integer,
  subtotal_amount integer,
  total_amount integer,
  currency_code text,
  status public.booking_status,
  payment_status public.booking_payment_status,
  payment_reference text,
  traveler_full_name text,
  traveler_email text,
  traveler_phone text,
  special_requests text,
  owner_id uuid,
  owner_full_name text,
  owner_display_name text,
  owner_avatar_url text,
  owner_response_message text,
  requested_at timestamptz,
  payment_submitted_at timestamptz,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    b.id,
    b.booking_reference,
    p.id as property_id,
    p.public_slug as property_slug,
    p.title as property_title,
    p.property_type,
    p.city as property_city,
    p.area as property_area,
    p.country_name as property_country_name,
    p.max_guests as property_max_guests,
    p.bedrooms_count as property_bedrooms_count,
    p.bathrooms_count as property_bathrooms_count,
    p.area_size_sqm as property_area_size_sqm,
    p.base_nightly_amount as property_base_nightly_amount,
    b.check_in_date,
    b.check_out_date,
    b.guests_count,
    b.nightly_amount,
    b.cleaning_fee_amount,
    b.service_fee_amount,
    b.discount_amount,
    b.subtotal_amount,
    b.total_amount,
    b.currency_code,
    b.status,
    b.payment_status,
    b.payment_reference,
    b.traveler_full_name,
    b.traveler_email,
    b.traveler_phone,
    b.special_requests,
    owner_profile.id as owner_id,
    owner_profile.full_name as owner_full_name,
    owner_profile.display_name as owner_display_name,
    owner_profile.avatar_url as owner_avatar_url,
    b.owner_response_message,
    b.requested_at,
    b.payment_submitted_at,
    b.owner_actioned_at,
    b.confirmed_at,
    b.cancelled_at,
    b.completed_at,
    b.created_at,
    b.updated_at
  from public.bookings as b
  join public.properties as p
    on p.id = b.property_id
  join public.profiles as owner_profile
    on owner_profile.id = b.owner_id
  where b.traveler_id = auth.uid()
  order by b.created_at desc
$$;

comment on function public.get_traveler_bookings() is 'Traveler-scoped trusted read for booking list and detail surfaces without broadening direct property joins.';

revoke all on function public.get_traveler_bookings() from public;
grant execute on function public.get_traveler_bookings() to authenticated;

create or replace function public.get_traveler_booking_details(booking_uuid uuid)
returns table (
  id uuid,
  booking_reference text,
  property_id uuid,
  property_slug text,
  property_title text,
  property_type public.property_type,
  property_city text,
  property_area text,
  property_country_name text,
  property_max_guests integer,
  property_bedrooms_count integer,
  property_bathrooms_count integer,
  property_area_size_sqm integer,
  property_base_nightly_amount integer,
  check_in_date date,
  check_out_date date,
  guests_count integer,
  nightly_amount integer,
  cleaning_fee_amount integer,
  service_fee_amount integer,
  discount_amount integer,
  subtotal_amount integer,
  total_amount integer,
  currency_code text,
  status public.booking_status,
  payment_status public.booking_payment_status,
  payment_reference text,
  traveler_full_name text,
  traveler_email text,
  traveler_phone text,
  special_requests text,
  owner_id uuid,
  owner_full_name text,
  owner_display_name text,
  owner_avatar_url text,
  owner_response_message text,
  requested_at timestamptz,
  payment_submitted_at timestamptz,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.get_traveler_bookings()
  where id = booking_uuid
$$;

comment on function public.get_traveler_booking_details(uuid) is 'Traveler-scoped trusted read for a single booking detail record.';

revoke all on function public.get_traveler_booking_details(uuid) from public;
grant execute on function public.get_traveler_booking_details(uuid) to authenticated;

create or replace function public.get_owner_bookings()
returns table (
  id uuid,
  booking_reference text,
  property_id uuid,
  property_slug text,
  property_title text,
  property_type public.property_type,
  property_city text,
  property_area text,
  property_country_name text,
  property_max_guests integer,
  check_in_date date,
  check_out_date date,
  guests_count integer,
  nightly_amount integer,
  cleaning_fee_amount integer,
  service_fee_amount integer,
  discount_amount integer,
  subtotal_amount integer,
  total_amount integer,
  currency_code text,
  status public.booking_status,
  payment_status public.booking_payment_status,
  payment_reference text,
  traveler_id uuid,
  traveler_full_name text,
  traveler_email text,
  traveler_phone text,
  special_requests text,
  owner_response_message text,
  requested_at timestamptz,
  payment_submitted_at timestamptz,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    b.id,
    b.booking_reference,
    p.id as property_id,
    p.public_slug as property_slug,
    p.title as property_title,
    p.property_type,
    p.city as property_city,
    p.area as property_area,
    p.country_name as property_country_name,
    p.max_guests as property_max_guests,
    b.check_in_date,
    b.check_out_date,
    b.guests_count,
    b.nightly_amount,
    b.cleaning_fee_amount,
    b.service_fee_amount,
    b.discount_amount,
    b.subtotal_amount,
    b.total_amount,
    b.currency_code,
    b.status,
    b.payment_status,
    b.payment_reference,
    b.traveler_id,
    coalesce(b.traveler_full_name, traveler_profile.full_name) as traveler_full_name,
    coalesce(b.traveler_email, traveler_profile.email::text) as traveler_email,
    coalesce(b.traveler_phone, traveler_profile.phone) as traveler_phone,
    b.special_requests,
    b.owner_response_message,
    b.requested_at,
    b.payment_submitted_at,
    b.owner_actioned_at,
    b.confirmed_at,
    b.cancelled_at,
    b.completed_at,
    b.created_at,
    b.updated_at
  from public.bookings as b
  join public.properties as p
    on p.id = b.property_id
  left join public.profiles as traveler_profile
    on traveler_profile.id = b.traveler_id
  where b.owner_id = auth.uid()
  order by b.created_at desc
$$;

comment on function public.get_owner_bookings() is 'Owner-scoped trusted read for booking management list and detail surfaces without broadening direct traveler joins.';

revoke all on function public.get_owner_bookings() from public;
grant execute on function public.get_owner_bookings() to authenticated;

create or replace function public.get_owner_booking_details(booking_uuid uuid)
returns table (
  id uuid,
  booking_reference text,
  property_id uuid,
  property_slug text,
  property_title text,
  property_type public.property_type,
  property_city text,
  property_area text,
  property_country_name text,
  property_max_guests integer,
  check_in_date date,
  check_out_date date,
  guests_count integer,
  nightly_amount integer,
  cleaning_fee_amount integer,
  service_fee_amount integer,
  discount_amount integer,
  subtotal_amount integer,
  total_amount integer,
  currency_code text,
  status public.booking_status,
  payment_status public.booking_payment_status,
  payment_reference text,
  traveler_id uuid,
  traveler_full_name text,
  traveler_email text,
  traveler_phone text,
  special_requests text,
  owner_response_message text,
  requested_at timestamptz,
  payment_submitted_at timestamptz,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.get_owner_bookings()
  where id = booking_uuid
$$;

comment on function public.get_owner_booking_details(uuid) is 'Owner-scoped trusted read for a single owner-facing booking detail record.';

revoke all on function public.get_owner_booking_details(uuid) from public;
grant execute on function public.get_owner_booking_details(uuid) to authenticated;

revoke update on table public.bookings from authenticated;
drop policy if exists bookings_traveler_cancel_own on public.bookings;
