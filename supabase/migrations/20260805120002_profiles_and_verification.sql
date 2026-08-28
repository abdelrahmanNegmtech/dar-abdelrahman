create table public.profiles (
  id uuid primary key references auth.users (id) on delete restrict,
  account_type public.account_type not null default 'guest',
  full_name text not null,
  display_name text,
  email extensions.citext not null,
  phone text,
  avatar_url text,
  country_code text,
  country_name text,
  dialing_code text,
  date_of_birth date,
  nationality text,
  preferred_language text,
  preferred_currency text,
  city text,
  country text,
  address text,
  address_line_1 text,
  address_line_2 text,
  profile_completion integer not null default 0,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  phone_verified boolean not null default false,
  phone_verified_at timestamptz,
  identity_verified boolean not null default false,
  emergency_contact_name text,
  emergency_contact_phone text,
  is_active boolean not null default true,
  deactivated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (btrim(email::text) <> ''),
  constraint profiles_profile_completion_range check (profile_completion >= 0 and profile_completion <= 100)
);

comment on table public.profiles is 'Application profile linked 1:1 with auth.users. Prefer deactivation or soft deletion over destructive deletion.';
comment on column public.profiles.account_type is 'Compatibility-preserving single-role account classification used by the current app.';
comment on column public.profiles.address is 'Current app compatibility field. Normalized address fields can coexist during the transition.';

create unique index profiles_email_key on public.profiles (email);
create index profiles_account_type_idx on public.profiles (account_type);
create index profiles_active_account_type_idx
  on public.profiles (account_type, is_active)
  where deleted_at is null;

create table public.owner_verifications (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete restrict,
  verification_type public.owner_verification_type not null,
  status public.verification_status not null default 'not_started',
  legal_full_name text,
  business_name text,
  business_registration_number text,
  tax_identifier text,
  date_of_birth date,
  review_notes text,
  rejection_reason_code public.verification_rejection_reason,
  submitted_at timestamptz,
  under_review_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  reviewed_by_profile_id uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.owner_verifications is 'Owner verification submissions retain historical attempts instead of overwriting one mutable row.';

create index owner_verifications_owner_status_idx
  on public.owner_verifications (owner_profile_id, status, created_at desc);
create index owner_verifications_status_idx on public.owner_verifications (status);

create table public.owner_verification_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_verification_id uuid not null references public.owner_verifications (id) on delete cascade,
  document_type public.verification_document_type not null,
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  review_status public.document_review_status not null default 'pending',
  rejection_reason text,
  uploaded_by_profile_id uuid not null references public.profiles (id) on delete restrict,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_verification_documents_file_size_positive check (file_size_bytes > 0)
);

comment on table public.owner_verification_documents is 'Private document metadata only. Raw file contents belong in object storage, not Postgres.';
comment on column public.owner_verification_documents.storage_path is 'Sensitive private storage location. RLS and signed URL policies should protect access in Phase 4.';

create index owner_verification_documents_verification_type_idx
  on public.owner_verification_documents (owner_verification_id, document_type, created_at desc);
create index owner_verification_documents_review_status_idx
  on public.owner_verification_documents (review_status);
create unique index owner_verification_documents_active_type_key
  on public.owner_verification_documents (owner_verification_id, document_type)
  where deleted_at is null;
