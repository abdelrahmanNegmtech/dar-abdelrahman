grant select (
  id,
  property_id,
  owner_id,
  status,
  rating,
  cleanliness_rating,
  communication_rating,
  location_rating,
  accuracy_rating,
  value_rating,
  comment,
  owner_response,
  submitted_at,
  hidden_at,
  removed_at,
  created_at,
  updated_at
)
  on table public.reviews to anon, authenticated;
grant insert (
  booking_id,
  traveler_id,
  property_id,
  owner_id,
  status,
  rating,
  cleanliness_rating,
  communication_rating,
  location_rating,
  accuracy_rating,
  value_rating,
  comment,
  submitted_at
)
  on table public.reviews to authenticated;
grant update (
  status,
  rating,
  cleanliness_rating,
  communication_rating,
  location_rating,
  accuracy_rating,
  value_rating,
  comment,
  submitted_at
)
  on table public.reviews to authenticated;
grant delete on table public.reviews to authenticated;

create policy reviews_public_read_submitted_visible_property
  on public.reviews
  for select
  to anon, authenticated
  using (
    status = 'submitted'::public.review_status
    and public.is_property_public(property_id)
  );

create policy reviews_traveler_read_own
  on public.reviews
  for select
  to authenticated
  using (traveler_id = auth.uid());

create policy reviews_owner_read_own_property
  on public.reviews
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy reviews_admin_read_all
  on public.reviews
  for select
  to authenticated
  using (public.is_admin());

create policy reviews_traveler_insert_completed_own_booking
  on public.reviews
  for insert
  to authenticated
  with check (
    traveler_id = auth.uid()
    and status in ('pending'::public.review_status, 'submitted'::public.review_status)
    and exists (
      select 1
      from public.bookings as b
      where b.id = booking_id
        and b.traveler_id = auth.uid()
        and b.owner_id = owner_id
        and b.property_id = property_id
        and b.status = 'completed'::public.booking_status
    )
  );

create policy reviews_traveler_update_own
  on public.reviews
  for update
  to authenticated
  using (traveler_id = auth.uid())
  with check (
    traveler_id = auth.uid()
    and status in ('pending'::public.review_status, 'submitted'::public.review_status)
    and exists (
      select 1
      from public.bookings as b
      where b.id = booking_id
        and b.traveler_id = auth.uid()
        and b.owner_id = owner_id
        and b.property_id = property_id
        and b.status = 'completed'::public.booking_status
    )
  );

create policy reviews_traveler_delete_own
  on public.reviews
  for delete
  to authenticated
  using (traveler_id = auth.uid());

grant select on table public.payment_methods to authenticated;
grant insert (
  user_id,
  method_type,
  provider,
  brand,
  display_name,
  last_four,
  expiry_month,
  expiry_year,
  wallet_identifier
)
  on table public.payment_methods to authenticated;
grant update (
  brand,
  display_name,
  last_four,
  expiry_month,
  expiry_year,
  wallet_identifier,
  is_default,
  deleted_at
)
  on table public.payment_methods to authenticated;
grant delete on table public.payment_methods to authenticated;

create policy payment_methods_user_read_own
  on public.payment_methods
  for select
  to authenticated
  using (user_id = auth.uid());

create policy payment_methods_user_insert_own
  on public.payment_methods
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and deleted_at is null
    and verification_status = 'unverified'::public.payment_method_verification_status
  );

create policy payment_methods_user_update_own
  on public.payment_methods
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy payment_methods_user_delete_own
  on public.payment_methods
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select on table public.payouts to authenticated;

create policy payouts_owner_read_own
  on public.payouts
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy payouts_admin_read_all
  on public.payouts
  for select
  to authenticated
  using (public.is_admin());

grant select on table public.support_tickets to authenticated;
grant insert (ticket_reference, user_id, booking_id, property_id, category, priority, subject)
  on table public.support_tickets to authenticated;
grant update (status, closed_at) on table public.support_tickets to authenticated;

create policy support_tickets_user_read_own
  on public.support_tickets
  for select
  to authenticated
  using (user_id = auth.uid() and deleted_at is null);

create policy support_tickets_support_queue_read
  on public.support_tickets
  for select
  to authenticated
  using (
    public.is_support_staff()
    and deleted_at is null
    and (
      assigned_to_profile_id = auth.uid()
      or assigned_to_profile_id is null
    )
  );

create policy support_tickets_admin_read_all
  on public.support_tickets
  for select
  to authenticated
  using (public.is_admin());

create policy support_tickets_user_insert_own
  on public.support_tickets
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'open'::public.support_ticket_status
    and assigned_to_profile_id is null
    and resolved_at is null
    and closed_at is null
    and deleted_at is null
    and (
      booking_id is null
      or public.can_access_booking(booking_id)
    )
  );

create policy support_tickets_user_update_own_open_or_close
  on public.support_tickets
  for update
  to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (
    user_id = auth.uid()
    and (
      (status = 'open'::public.support_ticket_status and closed_at is null)
      or (status = 'closed'::public.support_ticket_status and closed_at is not null)
    )
    and assigned_to_profile_id is null
    and resolved_at is null
    and deleted_at is null
  );

grant select on table public.support_ticket_messages to authenticated;
grant insert (ticket_id, sender_id, sender_role, message, is_internal)
  on table public.support_ticket_messages to authenticated;

create policy support_ticket_messages_user_read_own_external
  on public.support_ticket_messages
  for select
  to authenticated
  using (
    public.can_access_support_ticket(ticket_id)
    and (
      public.is_admin()
      or public.is_support_staff()
      or is_internal = false
    )
  );

create policy support_ticket_messages_user_insert_external
  on public.support_ticket_messages
  for insert
  to authenticated
  with check (
    public.current_account_type() in (
      'guest'::public.account_type,
      'owner'::public.account_type
    )
    and public.can_access_support_ticket(ticket_id)
    and sender_id = auth.uid()
    and sender_role in (
      'traveler'::public.support_sender_role,
      'owner'::public.support_sender_role
    )
    and is_internal = false
  );

create policy support_ticket_messages_support_insert_queue_access
  on public.support_ticket_messages
  for insert
  to authenticated
  with check (
    public.is_support_staff()
    and public.can_access_support_ticket(ticket_id)
    and sender_id = auth.uid()
    and sender_role = 'support_staff'::public.support_sender_role
  );

create policy support_ticket_messages_admin_insert
  on public.support_ticket_messages
  for insert
  to authenticated
  with check (
    public.is_admin()
    and public.can_access_support_ticket(ticket_id)
    and sender_id = auth.uid()
    and sender_role = 'support_staff'::public.support_sender_role
  );

grant select on table public.audit_logs to authenticated;

create policy audit_logs_admin_read_all
  on public.audit_logs
  for select
  to authenticated
  using (public.is_admin());
