grant select (owner_profile_id)
  on table public.properties to authenticated;

grant select (traveler_id)
  on table public.reviews to authenticated;
