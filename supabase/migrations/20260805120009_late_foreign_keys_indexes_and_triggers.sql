alter table public.property_availability
  add constraint property_availability_booking_id_fkey
  foreign key (booking_id)
  references public.bookings (id)
  on delete set null;

alter table public.conversation_members
  add constraint conversation_members_last_read_message_id_fkey
  foreign key (last_read_message_id)
  references public.messages (id)
  on delete set null;

alter table public.messages
  add constraint messages_reply_to_message_id_fkey
  foreign key (reply_to_message_id)
  references public.messages (id)
  on delete set null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  derived_account_type public.account_type;
begin
  derived_account_type :=
    case
      when new.raw_user_meta_data ->> 'account_type' = 'owner' then 'owner'::public.account_type
      else 'guest'::public.account_type
    end;

  insert into public.profiles (
    id,
    account_type,
    full_name,
    display_name,
    email,
    phone,
    avatar_url,
    country_code,
    country_name,
    dialing_code,
    email_verified,
    email_verified_at,
    phone_verified,
    phone_verified_at
  )
  values (
    new.id,
    derived_account_type,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Guest'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    coalesce(new.email, lower(new.id::text) || '@placeholder.local')::extensions.citext,
    nullif(new.phone, ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'country_code', ''),
    nullif(new.raw_user_meta_data ->> 'country_name', ''),
    nullif(new.raw_user_meta_data ->> 'dialing_code', ''),
    coalesce(new.email_confirmed_at is not null, false),
    new.email_confirmed_at,
    coalesce(new.phone_confirmed_at is not null, false),
    new.phone_confirmed_at
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_auth_user() is 'Minimal auth.users -> profiles bootstrap trigger. Defaults to guest, only elevates owner from metadata, and never trusts admin/support metadata.';

revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.handle_new_auth_user() from anon;
revoke all on function public.handle_new_auth_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger set_owner_verifications_updated_at
  before update on public.owner_verifications
  for each row
  execute function public.set_updated_at();

create trigger set_owner_verification_documents_updated_at
  before update on public.owner_verification_documents
  for each row
  execute function public.set_updated_at();

create trigger set_properties_updated_at
  before update on public.properties
  for each row
  execute function public.set_updated_at();

create trigger set_property_photos_updated_at
  before update on public.property_photos
  for each row
  execute function public.set_updated_at();

create trigger set_property_availability_updated_at
  before update on public.property_availability
  for each row
  execute function public.set_updated_at();

create trigger set_property_pricing_rules_updated_at
  before update on public.property_pricing_rules
  for each row
  execute function public.set_updated_at();

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();

create trigger set_conversation_members_updated_at
  before update on public.conversation_members
  for each row
  execute function public.set_updated_at();

create trigger set_messages_updated_at
  before update on public.messages
  for each row
  execute function public.set_updated_at();

create trigger set_notifications_updated_at
  before update on public.notifications
  for each row
  execute function public.set_updated_at();

create trigger set_reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at();

create trigger set_payment_methods_updated_at
  before update on public.payment_methods
  for each row
  execute function public.set_updated_at();

create trigger set_payouts_updated_at
  before update on public.payouts
  for each row
  execute function public.set_updated_at();

create trigger set_support_tickets_updated_at
  before update on public.support_tickets
  for each row
  execute function public.set_updated_at();

create trigger set_support_ticket_messages_updated_at
  before update on public.support_ticket_messages
  for each row
  execute function public.set_updated_at();
