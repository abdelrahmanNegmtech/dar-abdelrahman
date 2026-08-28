create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  entity_type public.notification_entity_type,
  entity_id uuid,
  title text not null,
  body text,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (btrim(title) <> '')
);

comment on table public.notifications is 'Recipient-owned notification inbox. Soft deletion is allowed to support user cleanup without losing operational audit trails elsewhere.';

create index notifications_user_read_created_idx
  on public.notifications (user_id, is_read, created_at desc);

create table public.reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  traveler_id uuid not null references public.profiles (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  status public.review_status not null default 'pending',
  rating numeric(2, 1) not null,
  cleanliness_rating numeric(2, 1),
  communication_rating numeric(2, 1),
  location_rating numeric(2, 1),
  accuracy_rating numeric(2, 1),
  value_rating numeric(2, 1),
  comment text,
  owner_response text,
  submitted_at timestamptz,
  hidden_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1.0 and 5.0),
  constraint reviews_cleanliness_rating_range check (
    cleanliness_rating is null or cleanliness_rating between 1.0 and 5.0
  ),
  constraint reviews_communication_rating_range check (
    communication_rating is null or communication_rating between 1.0 and 5.0
  ),
  constraint reviews_location_rating_range check (
    location_rating is null or location_rating between 1.0 and 5.0
  ),
  constraint reviews_accuracy_rating_range check (
    accuracy_rating is null or accuracy_rating between 1.0 and 5.0
  ),
  constraint reviews_value_rating_range check (
    value_rating is null or value_rating between 1.0 and 5.0
  )
);

comment on table public.reviews is 'One traveler review per booking. Owner responses are additive text, not separate review entities.';

create unique index reviews_booking_traveler_key on public.reviews (booking_id, traveler_id);
create index reviews_property_status_submitted_idx
  on public.reviews (property_id, status, submitted_at desc);
create index reviews_owner_submitted_idx
  on public.reviews (owner_id, submitted_at desc);

create table public.payment_methods (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  method_type public.payment_method_type not null,
  provider public.payment_provider not null,
  brand text,
  display_name text,
  last_four text,
  expiry_month integer,
  expiry_year integer,
  wallet_identifier text,
  is_default boolean not null default false,
  verification_status public.payment_method_verification_status not null default 'unverified',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_expiry_month_range check (
    expiry_month is null or expiry_month between 1 and 12
  ),
  constraint payment_methods_expiry_year_range check (
    expiry_year is null or expiry_year between 1000 and 9999
  ),
  constraint payment_methods_last_four_format check (
    last_four is null or last_four ~ '^[0-9]{4}$'
  )
);

comment on table public.payment_methods is 'Stored traveler payment instrument metadata. Never store raw PAN, CVV, or other secrets in this table.';

create index payment_methods_user_idx on public.payment_methods (user_id, created_at desc);
create unique index payment_methods_one_default_per_user_key
  on public.payment_methods (user_id)
  where is_default = true and deleted_at is null;

