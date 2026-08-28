# Supabase Local Seeding

Local-only guide for running DAR migrations and deterministic seed fixtures.

Do not run this workflow against any remote Supabase project.

## Requirements

- Docker Desktop or another local Docker runtime must be installed and running.
- The Supabase CLI must be available locally, either installed globally or through `npx`.

## Required Commands

```bash
npx supabase --version
npx supabase db reset
```

## Deterministic Test Identities

- `guest.one@dar.local`
- `guest.two@dar.local`
- `owner.one@dar.local`
- `owner.two@dar.local`
- `admin.one@dar.local`
- `support.one@dar.local`

Shared local-only development password:

```text
DarLocal123!
```

## Seed Reset Workflow

1. Start Docker.
2. Run `npx supabase --version`.
3. Run `npx supabase db reset`.
4. Confirm `supabase/seed.sql` completed.
5. Use the deterministic fixture map in [`docs/LOCAL_SEED_DATA.md`](../docs/LOCAL_SEED_DATA.md).
6. Reference the policy plans in:
   - [`supabase/tests/rls.sql`](./tests/rls.sql)
   - [`supabase/tests/storage_rls.sql`](./tests/storage_rls.sql)

## Warnings

- This workflow is for local development, static policy review, and backend testing only.
- Do not point the CLI at a hosted project.
- Do not treat the seeded users, password, references, or storage paths as production data.

## More Detail

For the full fixture inventory, scenario coverage, and storage metadata notes,
see [`docs/LOCAL_SEED_DATA.md`](../docs/LOCAL_SEED_DATA.md).
