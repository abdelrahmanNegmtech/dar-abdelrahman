create or replace function public.uuid_or_null(input_text text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select
    case
      when input_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then input_text::uuid
      else null
    end
$$;

create or replace function public.storage_folder_segment(object_name text, segment_index integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select (storage.foldername(object_name))[segment_index]
$$;

create or replace function public.storage_uuid_folder_segment(object_name text, segment_index integer)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select public.uuid_or_null(public.storage_folder_segment(object_name, segment_index))
$$;

comment on function public.uuid_or_null(text) is 'Safely parses a UUID-like string and returns null instead of raising an exception for malformed path segments.';
comment on function public.storage_folder_segment(text, integer) is 'Returns a 1-based storage folder segment from an object path.';
comment on function public.storage_uuid_folder_segment(text, integer) is 'Returns a parsed UUID from a 1-based storage folder segment, or null when malformed.';

revoke all on function public.uuid_or_null(text) from public;
revoke all on function public.storage_folder_segment(text, integer) from public;
revoke all on function public.storage_uuid_folder_segment(text, integer) from public;

grant execute on function public.uuid_or_null(text) to authenticated;
grant execute on function public.storage_folder_segment(text, integer) to authenticated;
grant execute on function public.storage_uuid_folder_segment(text, integer) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'property-photos',
    'property-photos',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'owner-verification-documents',
    'owner-verification-documents',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'support-attachments',
    'support-attachments',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png']
  ),
  (
    'message-attachments',
    'message-attachments',
    false,
    15728640,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'payment-evidence',
    'payment-evidence',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png']
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
