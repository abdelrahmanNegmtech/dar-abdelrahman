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
