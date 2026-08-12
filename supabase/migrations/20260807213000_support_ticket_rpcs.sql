create or replace function public.create_support_ticket(
  category_input public.support_ticket_category,
  subject_input text,
  message_input text,
  priority_input public.support_ticket_priority default 'medium'::public.support_ticket_priority,
  booking_uuid uuid default null
)
returns table (
  booking_id uuid,
  created_at timestamptz,
  property_id uuid,
  status public.support_ticket_status,
  ticket_id uuid,
  ticket_reference text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.account_type;
  now_ts timestamptz := now();
  new_ticket_id uuid := extensions.gen_random_uuid();
  new_ticket_reference text := 'TKT-' || upper(substring(replace(new_ticket_id::text, '-', '') from 1 for 8));
  derived_property_id uuid := null;
  derived_sender_role public.support_sender_role;
begin
  if actor_id is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  actor_role := public.current_account_type();

  if actor_role not in ('guest'::public.account_type, 'owner'::public.account_type) then
    raise exception 'support ticket creation is not allowed for this account'
      using errcode = '42501';
  end if;

  if subject_input is null or btrim(subject_input) = '' then
    raise exception 'subject is required'
      using errcode = '22023';
  end if;

  if message_input is null or btrim(message_input) = '' then
    raise exception 'message is required'
      using errcode = '22023';
  end if;

  if booking_uuid is not null then
    select b.property_id
    into derived_property_id
    from public.bookings as b
    where b.id = booking_uuid
      and (
        (actor_role = 'guest'::public.account_type and b.traveler_id = actor_id)
        or (actor_role = 'owner'::public.account_type and b.owner_id = actor_id)
      )
    limit 1;

    if derived_property_id is null then
      raise exception 'booking is not accessible for support ticket creation'
        using errcode = '42501';
    end if;
  end if;

  derived_sender_role := case
    when actor_role = 'owner'::public.account_type then 'owner'::public.support_sender_role
    else 'traveler'::public.support_sender_role
  end;

  insert into public.support_tickets (
    id,
    ticket_reference,
    user_id,
    booking_id,
    property_id,
    category,
    priority,
    status,
    subject,
    created_at,
    updated_at
  )
  values (
    new_ticket_id,
    new_ticket_reference,
    actor_id,
    booking_uuid,
    derived_property_id,
    category_input,
    priority_input,
    'open'::public.support_ticket_status,
    btrim(subject_input),
    now_ts,
    now_ts
  );

  insert into public.support_ticket_messages (
    ticket_id,
    sender_id,
    sender_role,
    message,
    is_internal,
    created_at,
    updated_at
  )
  values (
    new_ticket_id,
    actor_id,
    derived_sender_role,
    btrim(message_input),
    false,
    now_ts,
    now_ts
  );

  return query
  select
    booking_uuid,
    now_ts,
    derived_property_id,
    'open'::public.support_ticket_status,
    new_ticket_id,
    new_ticket_reference;
end;
$$;

create or replace function public.add_support_ticket_message(
  ticket_uuid uuid,
  message_input text,
  internal_note boolean default false
)
returns table (
  created_at timestamptz,
  is_internal boolean,
  message_id uuid,
  sender_role public.support_sender_role,
  status public.support_ticket_status,
  ticket_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.account_type;
  now_ts timestamptz := now();
  next_status public.support_ticket_status;
  derived_sender_role public.support_sender_role;
  new_message_id uuid := extensions.gen_random_uuid();
begin
  if actor_id is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  if message_input is null or btrim(message_input) = '' then
    raise exception 'message is required'
      using errcode = '22023';
  end if;

  actor_role := public.current_account_type();

  if actor_role in ('guest'::public.account_type, 'owner'::public.account_type) then
    if not public.can_access_support_ticket(ticket_uuid) then
      raise exception 'support ticket is not accessible'
        using errcode = '42501';
    end if;

    if exists (
      select 1
      from public.support_tickets as st
      where st.id = ticket_uuid
        and st.status = 'closed'::public.support_ticket_status
    ) then
      raise exception 'closed tickets cannot receive new messages'
        using errcode = '22023';
    end if;

    if internal_note then
      raise exception 'internal notes are not allowed'
        using errcode = '42501';
    end if;

    derived_sender_role := case
      when actor_role = 'owner'::public.account_type then 'owner'::public.support_sender_role
      else 'traveler'::public.support_sender_role
    end;
    next_status := 'awaiting_support'::public.support_ticket_status;
  elsif actor_role in ('support_staff'::public.account_type, 'admin'::public.account_type) then
    if not public.can_access_support_ticket(ticket_uuid) then
      raise exception 'support ticket is not accessible'
        using errcode = '42501';
    end if;

    if exists (
      select 1
      from public.support_tickets as st
      where st.id = ticket_uuid
        and st.status = 'closed'::public.support_ticket_status
    ) then
      raise exception 'closed tickets cannot receive new messages'
        using errcode = '22023';
    end if;

    derived_sender_role := 'support_staff'::public.support_sender_role;
    next_status := case
      when internal_note then null
      when exists (
        select 1
        from public.support_tickets as st
        where st.id = ticket_uuid
          and st.status = 'open'::public.support_ticket_status
      ) then 'in_progress'::public.support_ticket_status
      else 'awaiting_customer'::public.support_ticket_status
    end;
  else
    raise exception 'support ticket messaging is not allowed for this account'
      using errcode = '42501';
  end if;

  insert into public.support_ticket_messages (
    id,
    ticket_id,
    sender_id,
    sender_role,
    message,
    is_internal,
    created_at,
    updated_at
  )
  values (
    new_message_id,
    ticket_uuid,
    actor_id,
    derived_sender_role,
    btrim(message_input),
    internal_note,
    now_ts,
    now_ts
  );

  if next_status is not null then
    update public.support_tickets as st
    set status = next_status,
        updated_at = now_ts
    where st.id = ticket_uuid
      and st.deleted_at is null
      and st.status <> 'closed'::public.support_ticket_status;
  end if;

  return query
  select
    now_ts,
    internal_note,
    new_message_id,
    derived_sender_role,
    coalesce(next_status, (
      select st.status
      from public.support_tickets as st
      where st.id = ticket_uuid
      limit 1
    )),
    ticket_uuid;
end;
$$;

revoke all on function public.create_support_ticket(
  public.support_ticket_category,
  text,
  text,
  public.support_ticket_priority,
  uuid
) from public;
revoke all on function public.add_support_ticket_message(uuid, text, boolean) from public;

grant execute on function public.create_support_ticket(
  public.support_ticket_category,
  text,
  text,
  public.support_ticket_priority,
  uuid
) to authenticated;
grant execute on function public.add_support_ticket_message(uuid, text, boolean) to authenticated;
