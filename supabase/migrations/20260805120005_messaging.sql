create table public.conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_type public.conversation_type not null default 'traveler_owner',
  booking_id uuid references public.bookings (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  subject text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conversations is 'Traveler-owner messaging context. Support tickets remain a separate bounded context on purpose.';

create index conversations_booking_idx on public.conversations (booking_id);
create index conversations_property_idx on public.conversations (property_id);
create index conversations_last_message_idx on public.conversations (last_message_at desc);

create table public.conversation_members (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  role public.conversation_member_role not null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  last_read_message_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conversation_members is 'Membership edge table for conversations. last_read_message_id is attached later to avoid a circular dependency.';

create unique index conversation_members_conversation_user_key
  on public.conversation_members (conversation_id, user_id);
create index conversation_members_user_idx on public.conversation_members (user_id, updated_at desc);

create table public.messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  message_type public.message_type not null default 'text',
  body text,
  attachment_path text,
  sent_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  reply_to_message_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_text_requires_body check (
    message_type <> 'text' or (body is not null and btrim(body) <> '')
  ),
  constraint messages_attachment_required_for_binary_types check (
    message_type not in ('image', 'file') or (attachment_path is not null and btrim(attachment_path) <> '')
  )
);

comment on table public.messages is 'Conversation messages. Soft deletion preserves thread history and auditability.';

create index messages_conversation_sent_idx on public.messages (conversation_id, sent_at asc);
create index messages_sender_idx on public.messages (sender_id, sent_at desc);
