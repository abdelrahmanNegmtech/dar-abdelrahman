create table public.properties (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete restrict,
  public_slug text not null,
  property_type public.property_type not null,
  moderation_status public.property_moderation_status not null default 'draft',
  publication_status public.property_publication_status not null default 'unpublished',
  title text not null,
  description text,
  country_code text not null default 'EG',
  country_name text not null default 'Egypt',
  city text not null,
  area text,
  address_line_1 text not null,
  address_line_2 text,
  building_name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  location_precision public.location_precision not null default 'approximate',
  max_guests integer not null,
  bedrooms_count integer not null default 0,
  beds_count integer not null default 0,
  bathrooms_count integer not null default 0,
  area_size_sqm integer,
  base_nightly_amount integer not null,
  cleaning_fee_amount integer not null default 0,
  security_deposit_amount integer not null default 0,
  currency_code text not null default 'EGP',
  minimum_nights integer not null default 1,
  maximum_nights integer,
  instant_book_enabled boolean not null default false,
  submitted_for_review_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  published_at timestamptz,
  unpublished_at timestamptz,
  suspended_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_public_slug_not_blank check (btrim(public_slug) <> ''),
  constraint properties_title_not_blank check (btrim(title) <> ''),
  constraint properties_max_guests_positive check (max_guests > 0),
  constraint properties_bedrooms_non_negative check (bedrooms_count >= 0),
  constraint properties_beds_non_negative check (beds_count >= 0),
  constraint properties_bathrooms_non_negative check (bathrooms_count >= 0),
  constraint properties_area_size_positive check (area_size_sqm is null or area_size_sqm > 0),
  constraint properties_base_nightly_positive check (base_nightly_amount > 0),
  constraint properties_cleaning_fee_non_negative check (cleaning_fee_amount >= 0),
  constraint properties_security_deposit_non_negative check (security_deposit_amount >= 0),
  constraint properties_minimum_nights_positive check (minimum_nights >= 1),
  constraint properties_maximum_nights_valid check (maximum_nights is null or maximum_nights >= minimum_nights),
  constraint properties_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint properties_longitude_range check (longitude is null or longitude between -180 and 180)
);

comment on table public.properties is 'Canonical listing record. Anonymous visibility requires approved moderation, published publication state, and deleted_at IS NULL.';
comment on column public.properties.moderation_status is 'Admin-controlled review state. Do not collapse this with publication state.';
comment on column public.properties.publication_status is 'Owner-facing publication state, independent from moderation.';
comment on column public.properties.base_nightly_amount is 'Minor currency units. Historical booking snapshots should copy monetary facts from here instead of joining live prices later.';

create unique index properties_public_slug_key on public.properties (public_slug);
create index properties_owner_status_idx
  on public.properties (owner_profile_id, moderation_status, publication_status, updated_at desc);
create index properties_marketplace_search_idx
  on public.properties (moderation_status, publication_status, city, property_type);

create table public.property_photos (
  id uuid primary key default extensions.gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  caption text,
  photo_category public.property_photo_category not null default 'other',
  sort_order integer not null,
  is_cover boolean not null default false,
  width_px integer,
  height_px integer,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_photos_sort_order_non_negative check (sort_order >= 0),
  constraint property_photos_width_positive check (width_px is null or width_px > 0),
  constraint property_photos_height_positive check (height_px is null or height_px > 0)
);

comment on table public.property_photos is 'Ordered gallery metadata for listing images. Files live in storage; this table preserves ordering and cover-photo semantics.';

create index property_photos_property_idx on public.property_photos (property_id);
create unique index property_photos_active_sort_order_key
  on public.property_photos (property_id, sort_order)
  where deleted_at is null;
create unique index property_photos_active_cover_key
  on public.property_photos (property_id)
  where is_cover = true and deleted_at is null;

create table public.property_availability (
  id uuid primary key default extensions.gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  availability_date date not null,
  status public.availability_status not null default 'available',
  reason public.availability_reason,
  booking_id uuid,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_availability_booking_alignment check (
    (status = 'booked' and booking_id is not null)
    or (status <> 'booked' and booking_id is null)
  )
);

comment on table public.property_availability is 'Per-night availability rows avoid overlap ambiguity. booking_id is attached later to avoid circular dependencies.';

create unique index property_availability_property_date_key
  on public.property_availability (property_id, availability_date);
create index property_availability_property_status_idx
  on public.property_availability (property_id, availability_date, status);
create index property_availability_booking_lookup_idx
  on public.property_availability (booking_id, availability_date);

create table public.property_pricing_rules (
  id uuid primary key default extensions.gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  rule_type public.pricing_rule_type not null,
  label text not null,
  starts_on date not null,
  ends_on date not null,
  priority integer not null default 100,
  nightly_amount_override integer,
  percent_adjustment numeric(5, 2),
  minimum_nights_override integer,
  maximum_nights_override integer,
  days_of_week_mask integer,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_pricing_rules_label_not_blank check (btrim(label) <> ''),
  constraint property_pricing_rules_date_range_valid check (ends_on >= starts_on),
  constraint property_pricing_rules_priority_non_negative check (priority >= 0),
  constraint property_pricing_rules_nightly_amount_positive check (
    nightly_amount_override is null or nightly_amount_override > 0
  ),
  constraint property_pricing_rules_percent_adjustment_range check (
    percent_adjustment is null or percent_adjustment between -100.00 and 1000.00
  ),
  constraint property_pricing_rules_minimum_nights_positive check (
    minimum_nights_override is null or minimum_nights_override >= 1
  ),
  constraint property_pricing_rules_maximum_nights_valid check (
    maximum_nights_override is null
    or minimum_nights_override is null
    or maximum_nights_override >= minimum_nights_override
  ),
  constraint property_pricing_rules_days_of_week_mask_range check (
    days_of_week_mask is null or days_of_week_mask between 0 and 127
  ),
  constraint property_pricing_rules_has_effect check (
    nightly_amount_override is not null
    or percent_adjustment is not null
    or minimum_nights_override is not null
    or maximum_nights_override is not null
    or days_of_week_mask is not null
  )
);

comment on table public.property_pricing_rules is 'Layered pricing rules. Cross-row overlap resolution is application logic driven by priority, not a SQL CHECK constraint.';

create index property_pricing_rules_property_window_idx
  on public.property_pricing_rules (property_id, starts_on, ends_on, is_active);
create index property_pricing_rules_property_priority_idx
  on public.property_pricing_rules (property_id, rule_type, priority);
