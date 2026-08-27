drop policy if exists saved_properties_user_insert_own_visible_property
  on public.saved_properties;

create policy saved_properties_user_insert_own_visible_property
  on public.saved_properties
  for insert
  to authenticated
  with check (
    traveler_id = auth.uid()
    and public.is_property_public(property_id)
  );
