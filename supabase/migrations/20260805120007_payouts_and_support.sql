create table public.payouts (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  booking_id uuid unique references public.bookings (id) on delete restrict,
  status public.payout_status not null default 'pending',
  method public.payout_method not null,
  gross_amount integer not null,
  commission_amount integer not null default 0,
  net_amount integer not null,
  currency_code text not null default 'EGP',
  scheduled_for date,
  processed_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  external_reference text,
  failure_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payouts_gross_amount_non_negative check (gross_amount >= 0),
  constraint payouts_commission_non_negative check (commission_amount >= 0),
  constraint payouts_net_amount_non_negative check (net_amount >= 0),
  constraint payouts_net_matches_components check (net_amount = gross_amount - commission_amount)
);

comment on table public.payouts is 'Owner settlement records. Amounts are historical financial facts and should remain immutable after payment processing.';

create index payouts_owner_status_schedule_idx
  on public.payouts (owner_id, status, scheduled_for);

create table public.support_tickets (
  id uuid primary key default extensions.gen_random_uuid(),
  ticket_reference text not null,
  user_id uuid not null references public.profiles (id) on delete restrict,
  booking_id uuid references public.bookings (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  category public.support_ticket_category not null,
  priority public.support_ticket_priority not null default 'medium',
  status public.support_ticket_status not null default 'open',
  subject text not null,
  assigned_to_profile_id uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  closed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_reference_not_blank check (btrim(ticket_reference) <> ''),
  constraint support_tickets_subject_not_blank check (btrim(subject) <> '')
);

comment on table public.support_tickets is 'Customer support cases remain separate from traveler-owner conversations by design.';

create unique index support_tickets_reference_key on public.support_tickets (ticket_reference);
create index support_tickets_user_status_created_idx
  on public.support_tickets (user_id, status, created_at desc);
create index support_tickets_assignee_queue_idx
  on public.support_tickets (assigned_to_profile_id, status, priority);

create table public.support_ticket_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_role public.support_sender_role not null default 'traveler',
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_ticket_messages_message_not_blank check (btrim(message) <> '')
);

comment on table public.support_ticket_messages is 'Support thread messages. Internal staff notes should rely on is_internal and later Phase 4 RLS, not a separate table yet.';

create index support_ticket_messages_ticket_created_idx
  on public.support_ticket_messages (ticket_id, created_at asc);

