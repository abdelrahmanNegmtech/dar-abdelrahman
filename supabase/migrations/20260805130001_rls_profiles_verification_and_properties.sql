grant select on table public.profiles to authenticated;
grant insert (id, account_type, full_name, email, phone, avatar_url, country_code, country_name, dialing_code)
  on table public.profiles to authenticated;
grant update (
  full_name,
  display_name,
  phone,
  avatar_url,
  country_code,
  country_name,
  dialing_code,
  date_of_birth,
  nationality,
  preferred_language,
  preferred_currency,
  city,
  country,
  address,
  address_line_1,
  address_line_2,
  emergency_contact_name,
  emergency_contact_phone
)
  on table public.profiles to authenticated;

create policy profiles_authenticated_read_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_admin_read_all
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

create policy profiles_authenticated_insert_own_bootstrap
  on public.profiles
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and account_type in ('guest'::public.account_type, 'owner'::public.account_type)
    and is_active = true
    and deleted_at is null
  );

create policy profiles_authenticated_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_update_all
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on table public.owner_verifications to authenticated;
grant insert (
  owner_profile_id,
  verification_type,
  status,
  legal_full_name,
  business_name,
  business_registration_number,
  tax_identifier,
  date_of_birth,
  submitted_at
)
  on table public.owner_verifications to authenticated;
grant update (
  verification_type,
  status,
  legal_full_name,
  business_name,
  business_registration_number,
  tax_identifier,
  date_of_birth,
  submitted_at
)
  on table public.owner_verifications to authenticated;

create policy owner_verifications_owner_read_own
  on public.owner_verifications
  for select
  to authenticated
  using (owner_profile_id = auth.uid());

create policy owner_verifications_admin_read_all
  on public.owner_verifications
  for select
  to authenticated
  using (public.is_admin());

create policy owner_verifications_owner_insert_own
  on public.owner_verifications
  for insert
  to authenticated
  with check (
    owner_profile_id = auth.uid()
    and public.current_account_type() = 'owner'::public.account_type
    and status in (
      'not_started'::public.verification_status,
      'draft'::public.verification_status,
      'submitted'::public.verification_status
    )
    and reviewed_by_profile_id is null
    and review_notes is null
    and rejection_reason_code is null
    and approved_at is null
    and rejected_at is null
    and under_review_at is null
    and deleted_at is null
  );

create policy owner_verifications_owner_update_draft_or_rejected
  on public.owner_verifications
  for update
  to authenticated
  using (
    owner_profile_id = auth.uid()
    and status in (
      'not_started'::public.verification_status,
      'draft'::public.verification_status,
      'rejected'::public.verification_status
    )
  )
  with check (
    owner_profile_id = auth.uid()
    and status in (
      'draft'::public.verification_status,
      'submitted'::public.verification_status,
      'rejected'::public.verification_status
    )
    and reviewed_by_profile_id is null
    and review_notes is null
    and rejection_reason_code is null
    and approved_at is null
    and under_review_at is null
  );

create policy owner_verifications_admin_update_all
  on public.owner_verifications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on table public.owner_verification_documents to authenticated;
grant insert (
  owner_verification_id,
  document_type,
  storage_path,
  original_file_name,
  mime_type,
  file_size_bytes,
  uploaded_by_profile_id
)
  on table public.owner_verification_documents to authenticated;
grant update (
  storage_path,
  original_file_name,
  mime_type,
  file_size_bytes,
  deleted_at
)
  on table public.owner_verification_documents to authenticated;

create policy owner_verification_documents_owner_read_own
  on public.owner_verification_documents
  for select
  to authenticated
  using (public.owns_owner_verification(owner_verification_id));

create policy owner_verification_documents_admin_read_all
  on public.owner_verification_documents
  for select
  to authenticated
  using (public.is_admin());

create policy owner_verification_documents_owner_insert_own
  on public.owner_verification_documents
  for insert
  to authenticated
  with check (
    uploaded_by_profile_id = auth.uid()
    and public.owns_owner_verification(owner_verification_id)
    and review_status = 'pending'::public.document_review_status
    and rejection_reason is null
    and deleted_at is null
  );

create policy owner_verification_documents_owner_update_own_pre_review
  on public.owner_verification_documents
  for update
  to authenticated
  using (
    uploaded_by_profile_id = auth.uid()
    and public.owns_owner_verification(owner_verification_id)
    and exists (
      select 1
      from public.owner_verifications as ov
      where ov.id = owner_verification_documents.owner_verification_id
        and ov.status in (
          'not_started'::public.verification_status,
          'draft'::public.verification_status,
          'rejected'::public.verification_status
        )
    )
  )
  with check (
    uploaded_by_profile_id = auth.uid()
    and public.owns_owner_verification(owner_verification_id)
    and review_status = 'pending'::public.document_review_status
  );

create policy owner_verification_documents_admin_update_all
  on public.owner_verification_documents
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select (
  id,
  public_slug,
  property_type,
  moderation_status,
  publication_status,
  title,
  description,
  country_code,
  country_name,
  city,
  area,
  max_guests,
  bedrooms_count,
  beds_count,
  bathrooms_count,
  area_size_sqm,
  base_nightly_amount,
  cleaning_fee_amount,
  security_deposit_amount,
  currency_code,
  minimum_nights,
  maximum_nights,
  instant_book_enabled,
  created_at,
  updated_at,
  published_at
)
  on table public.properties to anon, authenticated;
grant insert (
  owner_profile_id,
  public_slug,
  property_type,
  title,
  description,
  country_code,
  country_name,
  city,
  area,
  address_line_1,
  address_line_2,
  building_name,
  latitude,
  longitude,
  location_precision,
  max_guests,
  bedrooms_count,
  beds_count,
  bathrooms_count,
  area_size_sqm,
  base_nightly_amount,
  cleaning_fee_amount,
  security_deposit_amount,
  currency_code,
  minimum_nights,
  maximum_nights,
  instant_book_enabled
)
  on table public.properties to authenticated;
grant update (
  public_slug,
  property_type,
  title,
  description,
  country_code,
  country_name,
  city,
  area,
  address_line_1,
  address_line_2,
  building_name,
  latitude,
  longitude,
  location_precision,
  max_guests,
  bedrooms_count,
  beds_count,
  bathrooms_count,
  area_size_sqm,
  base_nightly_amount,
  cleaning_fee_amount,
  security_deposit_amount,
  currency_code,
  minimum_nights,
  maximum_nights,
  instant_book_enabled
)
  on table public.properties to authenticated;

create policy properties_public_read_approved_published
  on public.properties
  for select
  to anon, authenticated
  using (
    moderation_status = 'approved'::public.property_moderation_status
    and publication_status = 'published'::public.property_publication_status
    and deleted_at is null
  );

create policy properties_owner_read_own
  on public.properties
  for select
  to authenticated
  using (owner_profile_id = auth.uid());

create policy properties_staff_read_all
  on public.properties
  for select
  to authenticated
  using (public.is_staff());

create policy properties_owner_insert_own
  on public.properties
  for insert
  to authenticated
  with check (
    owner_profile_id = auth.uid()
    and public.current_account_type() = 'owner'::public.account_type
    and deleted_at is null
    and moderation_status = 'draft'::public.property_moderation_status
    and publication_status = 'unpublished'::public.property_publication_status
    and submitted_for_review_at is null
    and approved_at is null
    and rejected_at is null
    and published_at is null
    and unpublished_at is null
    and suspended_at is null
    and archived_at is null
  );

create policy properties_owner_update_own_editable
  on public.properties
  for update
  to authenticated
  using (
    owner_profile_id = auth.uid()
    and public.current_account_type() = 'owner'::public.account_type
  )
  with check (
    owner_profile_id = auth.uid()
    and deleted_at is null
    and (
      publication_status <> 'published'::public.property_publication_status
      or moderation_status = 'approved'::public.property_moderation_status
    )
  );

create policy properties_admin_update_all
  on public.properties
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select (
  id,
  property_id,
  caption,
  photo_category,
  sort_order,
  is_cover,
  width_px,
  height_px
)
  on table public.property_photos to anon;
grant select (
  id,
  property_id,
  storage_path,
  caption,
  photo_category,
  sort_order,
  is_cover,
  width_px,
  height_px
)
  on table public.property_photos to authenticated;
grant insert (
  property_id,
  storage_path,
  caption,
  photo_category,
  sort_order,
  is_cover,
  width_px,
  height_px
)
  on table public.property_photos to authenticated;
grant update (
  storage_path,
  caption,
  photo_category,
  sort_order,
  is_cover,
  width_px,
  height_px,
  deleted_at
)
  on table public.property_photos to authenticated;
grant delete on table public.property_photos to authenticated;

create policy property_photos_owner_read_own
  on public.property_photos
  for select
  to authenticated
  using (public.owns_property(property_id));

create policy property_photos_staff_read_all
  on public.property_photos
  for select
  to authenticated
  using (public.is_staff());

create policy property_photos_owner_insert_own
  on public.property_photos
  for insert
  to authenticated
  with check (public.owns_property(property_id));

create policy property_photos_owner_update_own
  on public.property_photos
  for update
  to authenticated
  using (public.owns_property(property_id))
  with check (public.owns_property(property_id));

create policy property_photos_owner_delete_own
  on public.property_photos
  for delete
  to authenticated
  using (public.owns_property(property_id));

create policy property_photos_admin_update_all
  on public.property_photos
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_photos_admin_delete_all
  on public.property_photos
  for delete
  to authenticated
  using (public.is_admin());

grant select (property_id, availability_date, status)
  on table public.property_availability to anon, authenticated;
grant insert (property_id, availability_date, status, reason, note)
  on table public.property_availability to authenticated;
grant update (status, reason, note)
  on table public.property_availability to authenticated;
grant delete on table public.property_availability to authenticated;

create policy property_availability_public_read_parent_public
  on public.property_availability
  for select
  to anon, authenticated
  using (public.is_property_public(property_id));

create policy property_availability_owner_read_own
  on public.property_availability
  for select
  to authenticated
  using (public.owns_property(property_id));

create policy property_availability_staff_read_all
  on public.property_availability
  for select
  to authenticated
  using (public.is_staff());

create policy property_availability_owner_insert_own_manual_rows
  on public.property_availability
  for insert
  to authenticated
  with check (
    public.owns_property(property_id)
    and booking_id is null
  );

create policy property_availability_owner_update_own_manual_rows
  on public.property_availability
  for update
  to authenticated
  using (
    public.owns_property(property_id)
    and booking_id is null
  )
  with check (
    public.owns_property(property_id)
    and booking_id is null
  );

create policy property_availability_owner_delete_own_manual_rows
  on public.property_availability
  for delete
  to authenticated
  using (
    public.owns_property(property_id)
    and booking_id is null
  );

create policy property_availability_admin_update_all
  on public.property_availability
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_availability_admin_delete_all
  on public.property_availability
  for delete
  to authenticated
  using (public.is_admin());

grant select on table public.property_pricing_rules to authenticated;
grant insert (
  property_id,
  rule_type,
  label,
  starts_on,
  ends_on,
  priority,
  nightly_amount_override,
  percent_adjustment,
  minimum_nights_override,
  maximum_nights_override,
  days_of_week_mask,
  is_active
)
  on table public.property_pricing_rules to authenticated;
grant update (
  rule_type,
  label,
  starts_on,
  ends_on,
  priority,
  nightly_amount_override,
  percent_adjustment,
  minimum_nights_override,
  maximum_nights_override,
  days_of_week_mask,
  is_active,
  deleted_at
)
  on table public.property_pricing_rules to authenticated;
grant delete on table public.property_pricing_rules to authenticated;

create policy property_pricing_rules_owner_read_own
  on public.property_pricing_rules
  for select
  to authenticated
  using (public.owns_property(property_id));

create policy property_pricing_rules_staff_read_all
  on public.property_pricing_rules
  for select
  to authenticated
  using (public.is_staff());

create policy property_pricing_rules_owner_insert_own
  on public.property_pricing_rules
  for insert
  to authenticated
  with check (public.owns_property(property_id));

create policy property_pricing_rules_owner_update_own
  on public.property_pricing_rules
  for update
  to authenticated
  using (public.owns_property(property_id))
  with check (public.owns_property(property_id));

create policy property_pricing_rules_owner_delete_own
  on public.property_pricing_rules
  for delete
  to authenticated
  using (public.owns_property(property_id));

create policy property_pricing_rules_admin_update_all
  on public.property_pricing_rules
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_pricing_rules_admin_delete_all
  on public.property_pricing_rules
  for delete
  to authenticated
  using (public.is_admin());
