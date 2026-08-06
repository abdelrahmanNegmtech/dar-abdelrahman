# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

- Phase 4 Supabase RLS helper functions, table enablement, and domain policies.
- `docs/RLS_ACCESS_MATRIX.md` documenting table-by-table role access.
- `supabase/tests/rls.sql` documenting the static RLS verification plan.
- Phase 5 Supabase Storage buckets, path helpers, and `storage.objects` policies.
- `docs/STORAGE_ACCESS_MATRIX.md` documenting bucket privacy, path rules, and access control.
- `docs/STORAGE_DESIGN.md` documenting bucket inventory, lifecycle, cleanup, and signed URL strategy after the Phase 5.5 audit.
- `supabase/tests/storage_rls.sql` documenting the static Storage policy verification plan.
- deterministic local Supabase seed data in `supabase/seed.sql` for auth,
  profiles, properties, bookings, messaging, finance, support, and storage-path
  metadata scenarios
- `docs/LOCAL_SEED_DATA.md` documenting the local fixture map, shared
  development-only login identity, and policy-testing scenarios
- `supabase/SEEDING.md` documenting the local-only seed reset workflow,
  Docker requirement, and deterministic test identities
- generated local Supabase database types in
  `lib/supabase/database.types.ts`
- typed database aliases in `lib/supabase/database.ts`
- `lib/supabase/README.md` documenting local type regeneration and typed helper
  usage

### Changed

- Tightened profile callback syncing so routine auth callback updates no longer
  depend on direct self-updates to `profiles.email`.
- Tightened public media design so `property_photos` metadata no longer exposes
  `storage_path` to anonymous or non-owner public readers.
- Narrowed property-photo Storage object mutation so baseline client-side admin
  access is read-only.
- replaced placeholder RLS and storage-policy fixture references with concrete
  deterministic UUID mappings in `supabase/tests/rls.sql` and
  `supabase/tests/storage_rls.sql`
- corrected seeded storage metadata paths to use bucket-relative object names
  that match the Storage design and Storage policy conventions
- typed the shared Supabase browser, server, and middleware helpers against the
  generated local database schema
- replaced manual inline profile row/update typing in the auth callback and
  shared Supabase profile helpers with generated database-derived types
