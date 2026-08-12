create unique index if not exists conversations_traveler_owner_booking_key
  on public.conversations (booking_id)
  where booking_id is not null
    and conversation_type = 'traveler_owner'::public.conversation_type;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversation_members_conversation_user_key'
  ) then
    alter table public.conversation_members
      add constraint conversation_members_conversation_user_key
      unique using index conversation_members_conversation_user_key;
  end if;
end;
$$;

create or replace function public.create_or_get_booking_conversation(booking_uuid uuid)
returns table (
  conversation_id uuid,
  booking_id uuid,
  property_id uuid,
  subject text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  booking_row public.bookings%rowtype;
  property_title text;
  target_conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  select b.*
  into booking_row
  from public.bookings as b
  where b.id = booking_uuid
    and (
      b.traveler_id = current_user_id
      or b.owner_id = current_user_id
    )
  limit 1;

  if not found then
    raise exception 'Booking not found or not accessible'
      using errcode = 'P0001';
  end if;

  select p.title
  into property_title
  from public.properties as p
  where p.id = booking_row.property_id
  limit 1;

  select c.id
  into target_conversation_id
  from public.conversations as c
  where c.booking_id = booking_row.id
    and c.conversation_type = 'traveler_owner'::public.conversation_type
  limit 1;

  if target_conversation_id is null then
    insert into public.conversations (
      booking_id,
      conversation_type,
      property_id,
      subject,
      last_message_at
    )
    values (
      booking_row.id,
      'traveler_owner'::public.conversation_type,
      booking_row.property_id,
      coalesce(property_title, 'Booking conversation'),
      null
    )
    returning id
    into target_conversation_id;
  end if;

  insert into public.conversation_members (
    conversation_id,
    role,
    user_id
  )
  values
    (
      target_conversation_id,
      'traveler'::public.conversation_member_role,
      booking_row.traveler_id
    ),
    (
      target_conversation_id,
      'owner'::public.conversation_member_role,
      booking_row.owner_id
    )
  on conflict on constraint conversation_members_conversation_user_key do update
    set role = excluded.role;

  return query
  select
    c.id,
    c.booking_id,
    c.property_id,
    c.subject,
    c.created_at,
    c.updated_at
  from public.conversations as c
  where c.id = target_conversation_id;
end;
$$;

create or replace function public.get_my_conversations()
returns table (
  conversation_id uuid,
  conversation_type public.conversation_type,
  booking_id uuid,
  property_id uuid,
  subject text,
  conversation_created_at timestamptz,
  conversation_updated_at timestamptz,
  last_message_at timestamptz,
  member_role public.conversation_member_role,
  participant_id uuid,
  participant_name text,
  participant_avatar_url text,
  participant_role public.conversation_member_role,
  participant_verified boolean,
  property_slug text,
  property_title text,
  property_area text,
  property_city text,
  property_country_name text,
  property_type public.property_type,
  property_max_guests integer,
  property_bedrooms_count integer,
  property_base_nightly_amount integer,
  unread_count bigint,
  last_message_id uuid,
  last_message_body text,
  last_message_created_at timestamptz,
  last_message_deleted boolean,
  last_message_type public.message_type,
  last_message_sender_id uuid,
  last_message_sender_name text,
  last_message_attachment_file_name text,
  last_read_message_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  with my_memberships as (
    select cm.*
    from public.conversation_members as cm
    where cm.user_id = auth.uid()
  )
  select
    c.id as conversation_id,
    c.conversation_type,
    c.booking_id,
    c.property_id,
    c.subject,
    c.created_at as conversation_created_at,
    c.updated_at as conversation_updated_at,
    c.last_message_at,
    my_cm.role as member_role,
    other_profile.id as participant_id,
    coalesce(
      nullif(other_profile.display_name, ''),
      nullif(other_profile.full_name, ''),
      'Conversation participant'
    ) as participant_name,
    other_profile.avatar_url as participant_avatar_url,
    coalesce(other_cm.role, 'owner'::public.conversation_member_role) as participant_role,
    (
      coalesce(other_profile.identity_verified, false)
      or exists (
        select 1
        from public.owner_verifications as ov
        where ov.owner_profile_id = other_profile.id
          and ov.status = 'approved'::public.verification_status
          and ov.deleted_at is null
      )
    ) as participant_verified,
    p.public_slug as property_slug,
    p.title as property_title,
    p.area as property_area,
    p.city as property_city,
    p.country_name as property_country_name,
    p.property_type,
    p.max_guests as property_max_guests,
    p.bedrooms_count as property_bedrooms_count,
    p.base_nightly_amount as property_base_nightly_amount,
    coalesce(unread_stats.unread_count, 0) as unread_count,
    lm.id as last_message_id,
    lm.body as last_message_body,
    lm.created_at as last_message_created_at,
    (lm.deleted_at is not null) as last_message_deleted,
    lm.message_type as last_message_type,
    lm.sender_id as last_message_sender_id,
    coalesce(
      nullif(last_sender.display_name, ''),
      nullif(last_sender.full_name, ''),
      case when lm.sender_id is null then 'DAR system' else 'Conversation participant' end
    ) as last_message_sender_name,
    case
      when lm.attachment_path is null then null
      else regexp_replace(lm.attachment_path, '^.*/', '')
    end as last_message_attachment_file_name,
    my_cm.last_read_message_id
  from my_memberships as my_cm
  join public.conversations as c
    on c.id = my_cm.conversation_id
  left join lateral (
    select cm_other.*
    from public.conversation_members as cm_other
    where cm_other.conversation_id = c.id
      and cm_other.user_id <> auth.uid()
    order by cm_other.created_at asc
    limit 1
  ) as other_cm on true
  left join public.profiles as other_profile
    on other_profile.id = other_cm.user_id
  left join public.properties as p
    on p.id = c.property_id
  left join lateral (
    select m.*
    from public.messages as m
    where m.conversation_id = c.id
    order by m.sent_at desc, m.created_at desc
    limit 1
  ) as lm on true
  left join public.profiles as last_sender
    on last_sender.id = lm.sender_id
  left join lateral (
    select count(*)::bigint as unread_count
    from public.messages as m_unread
    left join public.messages as last_read_message
      on last_read_message.id = my_cm.last_read_message_id
    where m_unread.conversation_id = c.id
      and m_unread.sender_id is distinct from auth.uid()
      and m_unread.deleted_at is null
      and (
        my_cm.last_read_message_id is null
        or m_unread.sent_at > coalesce(last_read_message.sent_at, '-infinity'::timestamptz)
      )
  ) as unread_stats on true
  order by coalesce(c.last_message_at, c.updated_at, c.created_at) desc, c.created_at desc
$$;

create or replace function public.get_conversation_messages(conversation_uuid uuid)
returns table (
  message_id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_name text,
  sender_avatar_url text,
  sender_role public.conversation_member_role,
  body text,
  message_type public.message_type,
  sent_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  reply_to_message_id uuid,
  reply_to_body text,
  reply_to_sender_name text,
  attachment_file_name text,
  attachment_path text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id as message_id,
    m.conversation_id,
    m.sender_id,
    coalesce(
      nullif(sender_profile.display_name, ''),
      nullif(sender_profile.full_name, ''),
      case when m.sender_id is null then 'DAR system' else 'Conversation participant' end
    ) as sender_name,
    sender_profile.avatar_url as sender_avatar_url,
    coalesce(sender_member.role, 'system'::public.conversation_member_role) as sender_role,
    m.body,
    m.message_type,
    m.sent_at,
    m.created_at,
    m.updated_at,
    m.deleted_at,
    m.reply_to_message_id,
    reply_message.body as reply_to_body,
    coalesce(
      nullif(reply_sender.display_name, ''),
      nullif(reply_sender.full_name, ''),
      case when reply_message.sender_id is null then 'DAR system' else 'Conversation participant' end
    ) as reply_to_sender_name,
    case
      when m.attachment_path is null then null
      else regexp_replace(m.attachment_path, '^.*/', '')
    end as attachment_file_name,
    null::text as attachment_path
  from public.messages as m
  left join public.profiles as sender_profile
    on sender_profile.id = m.sender_id
  left join public.conversation_members as sender_member
    on sender_member.conversation_id = m.conversation_id
   and sender_member.user_id = m.sender_id
  left join public.messages as reply_message
    on reply_message.id = m.reply_to_message_id
  left join public.profiles as reply_sender
    on reply_sender.id = reply_message.sender_id
  where m.conversation_id = conversation_uuid
    and public.is_conversation_member(conversation_uuid)
  order by m.sent_at asc, m.created_at asc, m.id asc
$$;

create or replace function public.send_conversation_message(
  conversation_uuid uuid,
  body_input text,
  reply_to_message_uuid uuid default null
)
returns table (
  message_id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_name text,
  sender_avatar_url text,
  sender_role public.conversation_member_role,
  body text,
  message_type public.message_type,
  sent_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  reply_to_message_id uuid,
  reply_to_body text,
  reply_to_sender_name text,
  attachment_file_name text,
  attachment_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_body text := nullif(btrim(body_input), '');
  reply_message_row public.messages%rowtype;
  inserted_message_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_conversation_member(conversation_uuid) then
    raise exception 'Conversation not accessible'
      using errcode = 'P0001';
  end if;

  if normalized_body is null then
    raise exception 'Message body is required'
      using errcode = 'P0001';
  end if;

  if reply_to_message_uuid is not null then
    select m.*
    into reply_message_row
    from public.messages as m
    where m.id = reply_to_message_uuid
    limit 1;

    if not found or reply_message_row.conversation_id <> conversation_uuid then
      raise exception 'Reply target must belong to the same conversation'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.messages (
    body,
    conversation_id,
    message_type,
    reply_to_message_id,
    sender_id
  )
  values (
    normalized_body,
    conversation_uuid,
    'text'::public.message_type,
    reply_to_message_uuid,
    current_user_id
  )
  returning id
  into inserted_message_id;

  update public.conversations as c
  set last_message_at = now()
  where c.id = conversation_uuid;

  return query
  select message_row.*
  from public.get_conversation_messages(conversation_uuid) as message_row
  where message_row.message_id = inserted_message_id;
end;
$$;

create or replace function public.mark_conversation_read(
  conversation_uuid uuid,
  last_read_message_uuid uuid default null
)
returns table (
  conversation_id uuid,
  last_read_message_id uuid,
  last_read_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_message_id uuid := last_read_message_uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_conversation_member(conversation_uuid) then
    raise exception 'Conversation not accessible'
      using errcode = 'P0001';
  end if;

  if target_message_id is not null and not exists (
    select 1
    from public.messages as m
    where m.id = target_message_id
      and m.conversation_id = conversation_uuid
  ) then
    raise exception 'Read target must belong to the same conversation'
      using errcode = 'P0001';
  end if;

  if target_message_id is null then
    select m.id
    into target_message_id
    from public.messages as m
    where m.conversation_id = conversation_uuid
      and m.deleted_at is null
    order by m.sent_at desc, m.created_at desc
    limit 1;
  end if;

  update public.conversation_members as cm
  set
    last_read_at = now(),
    last_read_message_id = target_message_id
  where cm.conversation_id = conversation_uuid
    and cm.user_id = current_user_id;

  return query
  select
    result_row.conversation_id,
    result_row.last_read_message_id,
    result_row.last_read_at
  from (
    select
      cm.conversation_id,
      cm.last_read_message_id,
      cm.last_read_at
    from public.conversation_members as cm
    where cm.conversation_id = conversation_uuid
      and cm.user_id = current_user_id
  ) as result_row;
end;
$$;

create or replace function public.delete_own_conversation_message(message_uuid uuid)
returns table (
  message_id uuid,
  conversation_id uuid,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  return query
  with deleted_row as (
    update public.messages as m
    set
      attachment_path = null,
      body = null,
      deleted_at = now()
    where m.id = message_uuid
      and m.sender_id = current_user_id
      and public.is_conversation_member(m.conversation_id)
    returning
      m.id as message_id,
      m.conversation_id,
      m.deleted_at
  )
  select
    deleted_row.message_id,
    deleted_row.conversation_id,
    deleted_row.deleted_at
  from deleted_row;
end;
$$;

comment on function public.create_or_get_booking_conversation(uuid) is 'Creates or reuses the traveler-owner conversation for a booking the authenticated user belongs to.';
comment on function public.get_my_conversations() is 'Returns member-scoped traveler-owner conversation summaries with safe participant and property context for the authenticated user.';
comment on function public.get_conversation_messages(uuid) is 'Returns member-scoped conversation messages with safe sender and reply metadata. Attachment storage paths stay private.';
comment on function public.send_conversation_message(uuid, text, uuid) is 'Sends a text message into a conversation the authenticated user belongs to and validates same-conversation replies.';
comment on function public.mark_conversation_read(uuid, uuid) is 'Updates only the authenticated member read state for a conversation they belong to.';
comment on function public.delete_own_conversation_message(uuid) is 'Soft-deletes a message only when the authenticated user is the original sender and still a member of the conversation.';

revoke all on function public.create_or_get_booking_conversation(uuid) from public;
revoke all on function public.get_my_conversations() from public;
revoke all on function public.get_conversation_messages(uuid) from public;
revoke all on function public.send_conversation_message(uuid, text, uuid) from public;
revoke all on function public.mark_conversation_read(uuid, uuid) from public;
revoke all on function public.delete_own_conversation_message(uuid) from public;

grant execute on function public.create_or_get_booking_conversation(uuid) to authenticated;
grant execute on function public.get_my_conversations() to authenticated;
grant execute on function public.get_conversation_messages(uuid) to authenticated;
grant execute on function public.send_conversation_message(uuid, text, uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid, uuid) to authenticated;
grant execute on function public.delete_own_conversation_message(uuid) to authenticated;
