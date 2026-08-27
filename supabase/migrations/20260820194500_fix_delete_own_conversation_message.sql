create or replace function public.delete_own_conversation_message(message_uuid uuid)
returns table (
  message_id uuid,
  conversation_id uuid,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  return query
  with deleted_row as (
    update public.messages as m
    set
      attachment_path = null,
      body = case when m.message_type = 'text' then 'Message deleted' else null end,
      deleted_at = now()
    where m.id = message_uuid
      and m.sender_id = current_user_id
      and public.is_conversation_member(m.conversation_id)
    returning
      m.id as message_id,
      m.conversation_id,
      m.deleted_at
  )
  select
    deleted_row.message_id,
    deleted_row.conversation_id,
    deleted_row.deleted_at
  from deleted_row;
end;
$$;
