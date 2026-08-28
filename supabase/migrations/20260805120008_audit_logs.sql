create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  actor_type public.audit_actor_type not null default 'profile',
  entity_type public.audit_entity_type not null,
  entity_id uuid not null,
  action_type public.audit_action_type not null,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_summary_not_blank check (btrim(summary) <> '')
);

comment on table public.audit_logs is 'Append-only audit trail. Never store passwords, access tokens, refresh tokens, payment tokens, private identity-document contents, or other raw secrets in before_state/after_state.';

create index audit_logs_actor_idx on public.audit_logs (actor_profile_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs (action_type, created_at desc);
