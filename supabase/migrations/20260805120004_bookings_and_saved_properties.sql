create table public.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  booking_reference text not null,
  property_id uuid not null references public.properties (id) on delete restrict,
  traveler_id uuid not null references public.profiles (id) on delete restrict,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  status public.booking_status not null default 'pending_payment_verification',
  payment_status public.booking_payment_status not null default 'pending',
  check_in_date date not null,
  check_out_date date not null,
  guests_count integer not null,
  nightly_amount integer not null,
  cleaning_fee_amount integer not null default 0,
  service_fee_amount integer not null default 0,
  discount_amount integer not null default 0,
  subtotal_amount integer not null,
  total_amount integer not null,
  currency_code text not null default 'EGP',
  traveler_full_name text,
  traveler_email text,
  traveler_phone text,
  special_requests text,
  owner_response_message text,
  cancellation_reason text,
  payment_reference text,
  requested_at timestamptz not null default now(),
  payment_submitted_at timestamptz,
  owner_actioned_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  expired_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_reference_not_blank check (btrim(booking_reference) <> ''),
  constraint bookings_date_range_valid check (check_out_date > check_in_date),
  constraint bookings_guests_positive check (guests_count > 0),
  constraint bookings_nightly_amount_non_negative check (nightly_amount >= 0),
  constraint bookings_cleaning_fee_non_negative check (cleaning_fee_amount >= 0),
  constraint bookings_service_fee_non_negative check (service_fee_amount >= 0),
  constraint bookings_discount_non_negative check (discount_amount >= 0),
  constraint bookings_subtotal_non_negative check (subtotal_amount >= 0),
  constraint bookings_total_non_negative check (total_amount >= 0)
);

comment on table public.bookings is 'Historical booking facts. Money fields are immutable snapshots in minor units and should not be recomputed from current property prices.';
comment on column public.bookings.booking_reference is 'Human-readable booking lookup identifier distinct from the UUID primary key.';

create unique index bookings_reference_key on public.bookings (booking_reference);
create index bookings_traveler_created_idx on public.bookings (traveler_id, created_at desc);
create index bookings_owner_status_checkin_idx on public.bookings (owner_id, status, check_in_date);
create index bookings_property_date_range_idx on public.bookings (property_id, check_in_date, check_out_date);
create index bookings_status_payment_status_idx on public.bookings (status, payment_status);

create table public.saved_properties (
  id uuid primary key default extensions.gen_random_uuid(),
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.saved_properties is 'Traveler-owned saved listings. Hard deletion is acceptable because rows are user-preference edges, not primary historical records.';

create unique index saved_properties_traveler_property_key
  on public.saved_properties (traveler_id, property_id);
create index saved_properties_traveler_idx on public.saved_properties (traveler_id, created_at desc);
create index saved_properties_property_idx on public.saved_properties (property_id, created_at desc);

