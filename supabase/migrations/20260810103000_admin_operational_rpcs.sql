create or replace function public.admin_set_profile_active(
  profile_uuid uuid,
  active boolean
)
returns table (
  id uuid,
  is_active boolean,
  deactivated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  before_state jsonb;
  after_state jsonb;
begin
  if actor_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception 'Admin access required'
      using errcode = '42501';
  end if;

  if actor_id = profile_uuid then
    raise exception 'Admins cannot change their own activation state'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'is_active', p.is_active,
    'deactivated_at', p.deactivated_at
  )
  into before_state
  from public.profiles as p
  where p.id = profile_uuid
  for update;

  if before_state is null then
    raise exception 'Profile not found'
      using errcode = 'P0002';
  end if;

  update public.profiles as p
  set is_active = active,
      deactivated_at = case when active then null else now() end
  where p.id = profile_uuid;

  insert into public.audit_logs (
    actor_profile_id,
    actor_type,
    entity_type,
    entity_id,
    action_type,
    summary,
    before_state,
    after_state
  )
  values (
    actor_id,
    'profile'::public.audit_actor_type,
    'profile'::public.audit_entity_type,
    profile_uuid,
    case
      when active then 'updated'::public.audit_action_type
      else 'suspended'::public.audit_action_type
    end,
    case
      when active then 'Admin reactivated user profile.'
      else 'Admin suspended user profile.'
    end,
    before_state,
    jsonb_build_object(
      'is_active', active,
      'deactivated_at', case when active then null else now() end
    )
  );

  return query
  select p.id, p.is_active, p.deactivated_at
  from public.profiles as p
  where p.id = profile_uuid;
end;
$$;

create or replace function public.admin_review_owner_verification(
  verification_uuid uuid,
  target_status public.verification_status,
  review_notes_input text default null,
  rejection_reason_input public.verification_rejection_reason default null
)
returns table (
  id uuid,
  owner_profile_id uuid,
  status public.verification_status,
  reviewed_by_profile_id uuid,
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason_code public.verification_rejection_reason
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  verification_row public.owner_verifications%rowtype;
  normalized_notes text := nullif(btrim(coalesce(review_notes_input, '')), '');
  effective_rejection_reason public.verification_rejection_reason :=
    coalesce(rejection_reason_input, 'manual_review_required'::public.verification_rejection_reason);
begin
  if actor_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception 'Admin access required'
      using errcode = '42501';
  end if;

  if target_status not in (
    'approved'::public.verification_status,
    'rejected'::public.verification_status
  ) then
    raise exception 'Unsupported verification action'
      using errcode = '22023';
  end if;

  select *
  into verification_row
  from public.owner_verifications as ov
  where ov.id = verification_uuid
  for update;

  if not found then
    raise exception 'Verification not found'
      using errcode = 'P0002';
  end if;

  if verification_row.owner_profile_id = actor_id then
    raise exception 'Admins cannot review their own verification record'
      using errcode = '42501';
  end if;

  if verification_row.status not in (
    'submitted'::public.verification_status,
    'under_review'::public.verification_status
  ) then
    raise exception 'Verification is not awaiting review'
      using errcode = '22023';
  end if;

  update public.owner_verifications as ov
  set status = target_status,
      review_notes = normalized_notes,
      reviewed_by_profile_id = actor_id,
      under_review_at = coalesce(ov.under_review_at, now()),
      approved_at = case
        when target_status = 'approved'::public.verification_status then now()
        else null
      end,
      rejected_at = case
        when target_status = 'rejected'::public.verification_status then now()
        else null
      end,
      rejection_reason_code = case
        when target_status = 'rejected'::public.verification_status then effective_rejection_reason
        else null
      end
  where ov.id = verification_uuid;

  insert into public.audit_logs (
    actor_profile_id,
    actor_type,
    entity_type,
    entity_id,
    action_type,
    summary,
    after_state
  )
  values (
    actor_id,
    'profile'::public.audit_actor_type,
    'owner_verification'::public.audit_entity_type,
    verification_uuid,
    case
      when target_status = 'approved'::public.verification_status then 'approved'::public.audit_action_type
      else 'rejected'::public.audit_action_type
    end,
    case
      when target_status = 'approved'::public.verification_status then 'Admin approved owner verification.'
      else 'Admin rejected owner verification.'
    end,
    jsonb_build_object(
      'status', target_status,
      'reviewed_by_profile_id', actor_id,
      'rejection_reason_code', case
        when target_status = 'rejected'::public.verification_status then effective_rejection_reason
        else null
      end
    )
  );

  return query
  select
    ov.id,
    ov.owner_profile_id,
    ov.status,
    ov.reviewed_by_profile_id,
    ov.approved_at,
    ov.rejected_at,
    ov.rejection_reason_code
  from public.owner_verifications as ov
  where ov.id = verification_uuid;
end;
$$;

create or replace function public.admin_moderate_property(
  property_uuid uuid,
  target_status public.property_moderation_status,
  admin_note text default null
)
returns table (
  id uuid,
  moderation_status public.property_moderation_status,
  publication_status public.property_publication_status,
  approved_at timestamptz,
  rejected_at timestamptz,
  suspended_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  property_row public.properties%rowtype;
  normalized_note text := nullif(btrim(coalesce(admin_note, '')), '');
begin
  if actor_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception 'Admin access required'
      using errcode = '42501';
  end if;

  if target_status not in (
    'approved'::public.property_moderation_status,
    'rejected'::public.property_moderation_status,
    'suspended'::public.property_moderation_status
  ) then
    raise exception 'Unsupported property moderation action'
      using errcode = '22023';
  end if;

  select *
  into property_row
  from public.properties as p
  where p.id = property_uuid
  for update;

  if not found then
    raise exception 'Property not found'
      using errcode = 'P0002';
  end if;

  if property_row.owner_profile_id = actor_id then
    raise exception 'Admins cannot moderate their own property'
      using errcode = '42501';
  end if;

  if target_status in (
    'approved'::public.property_moderation_status,
    'rejected'::public.property_moderation_status
  ) and property_row.moderation_status not in (
    'submitted'::public.property_moderation_status,
    'under_review'::public.property_moderation_status
  ) then
    raise exception 'Property is not awaiting review'
      using errcode = '22023';
  end if;

  if target_status = 'suspended'::public.property_moderation_status
    and property_row.moderation_status <> 'approved'::public.property_moderation_status then
    raise exception 'Only approved properties can be suspended'
      using errcode = '22023';
  end if;

  update public.properties as p
  set moderation_status = target_status,
      publication_status = case
        when target_status = 'rejected'::public.property_moderation_status then 'unpublished'::public.property_publication_status
        else p.publication_status
      end,
      approved_at = case
        when target_status = 'approved'::public.property_moderation_status then now()
        else null
      end,
      rejected_at = case
        when target_status = 'rejected'::public.property_moderation_status then now()
        else null
      end,
      suspended_at = case
        when target_status = 'suspended'::public.property_moderation_status then now()
        else null
      end
  where p.id = property_uuid;

  insert into public.audit_logs (
    actor_profile_id,
    actor_type,
    entity_type,
    entity_id,
    action_type,
    summary,
    before_state,
    after_state
  )
  values (
    actor_id,
    'profile'::public.audit_actor_type,
    'property'::public.audit_entity_type,
    property_uuid,
    case target_status
      when 'approved'::public.property_moderation_status then 'approved'::public.audit_action_type
      when 'rejected'::public.property_moderation_status then 'rejected'::public.audit_action_type
      else 'suspended'::public.audit_action_type
    end,
    case target_status
      when 'approved'::public.property_moderation_status then 'Admin approved property listing.'
      when 'rejected'::public.property_moderation_status then 'Admin rejected property listing.'
      else 'Admin suspended property listing.'
    end,
    jsonb_build_object(
      'moderation_status', property_row.moderation_status,
      'publication_status', property_row.publication_status
    ),
    jsonb_build_object(
      'moderation_status', target_status,
      'publication_status', case
        when target_status = 'rejected'::public.property_moderation_status then 'unpublished'
        else property_row.publication_status
      end,
      'admin_note', normalized_note
    )
  );

  return query
  select
    p.id,
    p.moderation_status,
    p.publication_status,
    p.approved_at,
    p.rejected_at,
    p.suspended_at
  from public.properties as p
  where p.id = property_uuid;
end;
$$;

revoke all on function public.admin_set_profile_active(uuid, boolean) from public;
revoke all on function public.admin_review_owner_verification(uuid, public.verification_status, text, public.verification_rejection_reason) from public;
revoke all on function public.admin_moderate_property(uuid, public.property_moderation_status, text) from public;

grant execute on function public.admin_set_profile_active(uuid, boolean) to authenticated;
grant execute on function public.admin_review_owner_verification(uuid, public.verification_status, text, public.verification_rejection_reason) to authenticated;
grant execute on function public.admin_moderate_property(uuid, public.property_moderation_status, text) to authenticated;
