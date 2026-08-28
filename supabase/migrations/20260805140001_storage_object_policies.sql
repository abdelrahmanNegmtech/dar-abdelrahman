revoke all on storage.objects from anon, authenticated;
grant select, insert, update, delete on storage.objects to authenticated;

drop policy if exists storage_property_photos_owner_or_staff_list_and_read on storage.objects;
create policy storage_property_photos_owner_or_staff_list_and_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'property-photos'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and (
      public.owns_property(public.storage_uuid_folder_segment(name, 2))
      or public.is_staff()
    )
  );

drop policy if exists storage_property_photos_authenticated_read_public_property on storage.objects;
create policy storage_property_photos_authenticated_read_public_property
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'property-photos'
    and storage.allow_any_operation(array['object.get_authenticated', 'object.get_authenticated_info'])
    and public.is_property_public(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_property_photos_owner_insert_own on storage.objects;
create policy storage_property_photos_owner_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and array_length(storage.foldername(name), 1) = 2
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_property(public.storage_uuid_folder_segment(name, 2))
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_property_photos_owner_update_own on storage.objects;
create policy storage_property_photos_owner_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'property-photos'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_property(public.storage_uuid_folder_segment(name, 2))
  )
  with check (
    bucket_id = 'property-photos'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_property(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_property_photos_owner_delete_own on storage.objects;
create policy storage_property_photos_owner_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_property(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_avatars_self_or_admin_read on storage.objects;
create policy storage_avatars_self_or_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and (
      public.storage_folder_segment(name, 1) = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists storage_avatars_self_insert on storage.objects;
create policy storage_avatars_self_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and array_length(storage.foldername(name), 1) = 1
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_avatars_self_update on storage.objects;
create policy storage_avatars_self_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
  );

drop policy if exists storage_avatars_self_delete on storage.objects;
create policy storage_avatars_self_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
  );

drop policy if exists storage_owner_verification_documents_owner_or_admin_read on storage.objects;
create policy storage_owner_verification_documents_owner_or_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'owner-verification-documents'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and (
      public.owns_owner_verification(public.storage_uuid_folder_segment(name, 2))
      or public.is_admin()
    )
  );

drop policy if exists storage_owner_verification_documents_owner_insert on storage.objects;
create policy storage_owner_verification_documents_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'owner-verification-documents'
    and array_length(storage.foldername(name), 1) = 2
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_owner_verification(public.storage_uuid_folder_segment(name, 2))
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_owner_verification_documents_owner_update on storage.objects;
create policy storage_owner_verification_documents_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'owner-verification-documents'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_owner_verification(public.storage_uuid_folder_segment(name, 2))
  )
  with check (
    bucket_id = 'owner-verification-documents'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_owner_verification(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_owner_verification_documents_owner_delete on storage.objects;
create policy storage_owner_verification_documents_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'owner-verification-documents'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.owns_owner_verification(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_support_attachments_ticket_access_read on storage.objects;
create policy storage_support_attachments_ticket_access_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'support-attachments'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and public.can_access_support_ticket(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_support_attachments_ticket_owner_insert on storage.objects;
create policy storage_support_attachments_ticket_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'support-attachments'
    and array_length(storage.foldername(name), 1) = 2
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_support_ticket(public.storage_uuid_folder_segment(name, 2))
    and public.current_account_type() in ('guest'::public.account_type, 'owner'::public.account_type)
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_support_attachments_ticket_owner_update on storage.objects;
create policy storage_support_attachments_ticket_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'support-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_support_ticket(public.storage_uuid_folder_segment(name, 2))
  )
  with check (
    bucket_id = 'support-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_support_ticket(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_support_attachments_ticket_owner_delete on storage.objects;
create policy storage_support_attachments_ticket_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'support-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_support_ticket(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_message_attachments_member_or_admin_read on storage.objects;
create policy storage_message_attachments_member_or_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and (
      public.is_conversation_member(public.storage_uuid_folder_segment(name, 2))
      or public.is_admin()
    )
  );

drop policy if exists storage_message_attachments_sender_insert on storage.objects;
create policy storage_message_attachments_sender_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
    and array_length(storage.foldername(name), 1) = 3
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.is_conversation_member(public.storage_uuid_folder_segment(name, 2))
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_message_attachments_sender_update on storage.objects;
create policy storage_message_attachments_sender_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.is_conversation_member(public.storage_uuid_folder_segment(name, 2))
  )
  with check (
    bucket_id = 'message-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.is_conversation_member(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_message_attachments_sender_delete on storage.objects;
create policy storage_message_attachments_sender_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.is_conversation_member(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_payment_evidence_owner_or_admin_read on storage.objects;
create policy storage_payment_evidence_owner_or_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'payment-evidence'
    and storage.allow_any_operation(array['object.list', 'object.get_authenticated', 'object.get_authenticated_info'])
    and (
      public.storage_folder_segment(name, 1) = auth.uid()::text
      or public.is_admin()
    )
    and public.can_access_booking(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_payment_evidence_traveler_insert on storage.objects;
create policy storage_payment_evidence_traveler_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'payment-evidence'
    and array_length(storage.foldername(name), 1) = 2
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.current_account_type() in ('guest'::public.account_type, 'owner'::public.account_type)
    and public.can_access_booking(public.storage_uuid_folder_segment(name, 2))
    and owner_id = auth.uid()::text
  );

drop policy if exists storage_payment_evidence_traveler_update on storage.objects;
create policy storage_payment_evidence_traveler_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'payment-evidence'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_booking(public.storage_uuid_folder_segment(name, 2))
  )
  with check (
    bucket_id = 'payment-evidence'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_booking(public.storage_uuid_folder_segment(name, 2))
  );

drop policy if exists storage_payment_evidence_traveler_delete on storage.objects;
create policy storage_payment_evidence_traveler_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'payment-evidence'
    and owner_id = auth.uid()::text
    and public.storage_folder_segment(name, 1) = auth.uid()::text
    and public.can_access_booking(public.storage_uuid_folder_segment(name, 2))
  );
