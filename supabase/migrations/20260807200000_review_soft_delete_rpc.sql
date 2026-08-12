create or replace function public.remove_own_review(review_uuid uuid)
returns table (
  id uuid,
  removed_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  return query
    update public.reviews as review_row
    set
      removed_at = now(),
      status = 'removed'::public.review_status,
      updated_at = now()
    where review_row.id = review_uuid
      and review_row.traveler_id = current_user_id
      and review_row.removed_at is null
    returning review_row.id, review_row.removed_at;
end;
$$;

revoke all on function public.remove_own_review(uuid) from public;
grant execute on function public.remove_own_review(uuid) to authenticated;

revoke delete on table public.reviews from authenticated;
grant select (booking_id) on table public.reviews to authenticated;

drop policy if exists reviews_public_read_submitted_visible_property
  on public.reviews;

create policy reviews_public_read_submitted_visible_property
  on public.reviews
  for select
  to anon, authenticated
  using (
    status = 'submitted'::public.review_status
    and hidden_at is null
    and removed_at is null
    and public.is_property_public(property_id)
  );
