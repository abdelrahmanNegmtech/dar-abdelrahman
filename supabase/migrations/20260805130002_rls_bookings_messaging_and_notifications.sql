grant select on table public.saved_properties to authenticated;
grant insert (traveler_id, property_id) on table public.saved_properties to authenticated;
grant delete on table public.saved_properties to authenticated;

create policy saved_properties_user_read_own
  on public.saved_properties
  for select
  to authenticated
  using (traveler_id = auth.uid());

create policy saved_properties_user_insert_own_visible_property
  on public.saved_properties
  for insert
  to authenticated
  with check (
    traveler_id = auth.uid()
    and exists (
      select 1
      from public.properties as p
      where p.id = property_id
        and p.moderation_status = 'approved'::public.property_moderation_status
        and p.publication_status = 'published'::public.property_publication_status
        and p.deleted_at is null
    )
  );

create policy saved_properties_user_delete_own
  on public.saved_properties
  for delete
  to authenticated
  using (traveler_id = auth.uid());

grant select on table public.bookings to authenticated;
grant update (status, cancellation_reason) on table public.bookings to authenticated;

create policy bookings_access_scoped_select
  on public.bookings
  for select
  to authenticated
  using (public.can_access_booking(id));

create policy bookings_traveler_cancel_own
  on public.bookings
  for update
  to authenticated
  using (traveler_id = auth.uid())
  with check (
    traveler_id = auth.uid()
    and status = 'cancelled'::public.booking_status
  );

grant select on table public.conversations to authenticated;

create policy conversations_member_read_own
  on public.conversations
  for select
  to authenticated
  using (public.is_conversation_member(id));

create policy conversations_admin_read_all
  on public.conversations
  for select
  to authenticated
  using (public.is_admin());

grant select on table public.conversation_members to authenticated;
grant update (last_read_at, last_read_message_id) on table public.conversation_members to authenticated;

create policy conversation_members_user_read_own
  on public.conversation_members
  for select
  to authenticated
  using (user_id = auth.uid());

create policy conversation_members_admin_read_all
  on public.conversation_members
  for select
  to authenticated
  using (public.is_admin());

create policy conversation_members_user_update_read_state
  on public.conversation_members
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select on table public.messages to authenticated;
grant insert (conversation_id, sender_id, message_type, body, attachment_path, reply_to_message_id)
  on table public.messages to authenticated;

create policy messages_member_read_conversation
  on public.messages
  for select
  to authenticated
  using (public.is_conversation_member(conversation_id));

create policy messages_admin_read_all
  on public.messages
  for select
  to authenticated
  using (public.is_admin());

create policy messages_member_insert_own_sender
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
    and message_type in (
      'text'::public.message_type,
      'image'::public.message_type,
      'file'::public.message_type
    )
  );

grant select on table public.notifications to authenticated;
grant update (is_read, read_at, deleted_at) on table public.notifications to authenticated;
grant delete on table public.notifications to authenticated;

create policy notifications_user_read_own
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy notifications_user_update_own
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_user_delete_own
  on public.notifications
  for delete
  to authenticated
  using (user_id = auth.uid());
