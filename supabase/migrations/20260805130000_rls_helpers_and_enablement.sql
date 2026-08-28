create or replace function public.current_account_type()
returns public.account_type
language sql
stable
security definer
set search_path = ''
as $$
  select p.account_type
  from public.profiles as p
  where p.id = auth.uid()
    and p.deleted_at is null
    and p.is_active = true
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_account_type() = 'admin'::public.account_type
$$;

create or replace function public.is_support_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_account_type() = 'support_staff'::public.account_type
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_account_type() in (
    'admin'::public.account_type,
    'support_staff'::public.account_type
  )
$$;

create or replace function public.is_property_public(property_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.properties as p
    where p.id = property_uuid
      and p.moderation_status = 'approved'::public.property_moderation_status
      and p.publication_status = 'published'::public.property_publication_status
      and p.deleted_at is null
  )
$$;

create or replace function public.owns_property(property_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.properties as p
    where p.id = property_uuid
      and p.owner_profile_id = auth.uid()
      and p.deleted_at is null
  )
$$;

create or replace function public.owns_owner_verification(verification_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.owner_verifications as ov
    where ov.id = verification_uuid
      and ov.owner_profile_id = auth.uid()
      and ov.deleted_at is null
  )
$$;

create or replace function public.is_conversation_member(conversation_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members as cm
    where cm.conversation_id = conversation_uuid
      and cm.user_id = auth.uid()
  )
$$;

create or replace function public.can_access_booking(booking_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bookings as b
    where b.id = booking_uuid
      and (
        b.traveler_id = auth.uid()
        or b.owner_id = auth.uid()
        or public.is_admin()
        or (
          public.is_support_staff()
          and exists (
            select 1
            from public.support_tickets as st
            where st.booking_id = b.id
              and st.deleted_at is null
              and (
                st.assigned_to_profile_id = auth.uid()
                or st.assigned_to_profile_id is null
              )
          )
        )
      )
  )
$$;

create or replace function public.can_access_support_ticket(ticket_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.support_tickets as st
    where st.id = ticket_uuid
      and st.deleted_at is null
      and (
        st.user_id = auth.uid()
        or public.is_admin()
        or (
          public.is_support_staff()
          and (
            st.assigned_to_profile_id = auth.uid()
            or st.assigned_to_profile_id is null
          )
        )
      )
  )
$$;

comment on function public.current_account_type() is 'Minimal role lookup for the authenticated profile. Returns null for inactive or soft-deleted profiles.';
comment on function public.is_admin() is 'Boolean helper for admin-only row policies.';
comment on function public.is_support_staff() is 'Boolean helper for support-staff-only row policies.';
comment on function public.is_staff() is 'Boolean helper that distinguishes staff accounts from guest and owner accounts.';
comment on function public.is_property_public(uuid) is 'Boolean helper for public property visibility checks used by child-table RLS.';
comment on function public.owns_property(uuid) is 'Boolean helper that checks authenticated ownership of a property without recursive RLS.';
comment on function public.owns_owner_verification(uuid) is 'Boolean helper that checks authenticated ownership of an owner verification record.';
comment on function public.is_conversation_member(uuid) is 'Boolean helper for traveler-owner conversation membership checks.';
comment on function public.can_access_booking(uuid) is 'Boolean helper for traveler, owner, admin, and ticket-scoped support booking access.';
comment on function public.can_access_support_ticket(uuid) is 'Boolean helper for ticket opener, admin, and operational support queue access.';

revoke all on function public.current_account_type() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_support_staff() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.is_property_public(uuid) from public;
revoke all on function public.owns_property(uuid) from public;
revoke all on function public.owns_owner_verification(uuid) from public;
revoke all on function public.is_conversation_member(uuid) from public;
revoke all on function public.can_access_booking(uuid) from public;
revoke all on function public.can_access_support_ticket(uuid) from public;

grant execute on function public.current_account_type() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_support_staff() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_property_public(uuid) to anon, authenticated;
grant execute on function public.owns_property(uuid) to authenticated;
grant execute on function public.owns_owner_verification(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_access_booking(uuid) to authenticated;
grant execute on function public.can_access_support_ticket(uuid) to authenticated;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.owner_verifications from anon, authenticated;
revoke all on table public.owner_verification_documents from anon, authenticated;
revoke all on table public.properties from anon, authenticated;
revoke all on table public.property_photos from anon, authenticated;
revoke all on table public.property_availability from anon, authenticated;
revoke all on table public.property_pricing_rules from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.saved_properties from anon, authenticated;
revoke all on table public.conversations from anon, authenticated;
revoke all on table public.conversation_members from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.reviews from anon, authenticated;
revoke all on table public.payment_methods from anon, authenticated;
revoke all on table public.payouts from anon, authenticated;
revoke all on table public.support_tickets from anon, authenticated;
revoke all on table public.support_ticket_messages from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.owner_verifications enable row level security;
alter table public.owner_verification_documents enable row level security;
alter table public.properties enable row level security;
alter table public.property_photos enable row level security;
alter table public.property_availability enable row level security;
alter table public.property_pricing_rules enable row level security;
alter table public.bookings enable row level security;
alter table public.saved_properties enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payouts enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.audit_logs enable row level security;

create index if not exists support_tickets_booking_assignment_idx
  on public.support_tickets (booking_id, assigned_to_profile_id)
  where deleted_at is null;
