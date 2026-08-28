# Local Seed Data

## Purpose

`supabase/seed.sql` creates deterministic DAR fixtures for local-only development,
RLS policy testing, and storage-policy path validation.

It does not upload Storage objects, connect UI pages, add production data, or
replace existing mock-data consumers.

## Local Auth Strategy

- The seed inserts six development-only `auth.users` rows with stable UUIDs.
- The seed also upserts `public.profiles` so admin and support fixtures use the
  intended `account_type` values after the bootstrap trigger runs.
- If the local Supabase auth schema includes `auth.identities`, email identities
  are seeded as well.
- Shared local-only password: `DarLocal123!`
- Fixture emails:
  - `guest.one@dar.local`
  - `guest.two@dar.local`
  - `owner.one@dar.local`
  - `owner.two@dar.local`
  - `admin.one@dar.local`
  - `support.one@dar.local`

This password is development-only and must never be reused outside the local
stack.

## ID Map

### Users

| Fixture | UUID | Notes |
| --- | --- | --- |
| guest_one | `10000000-0000-4000-8000-000000000001` | Main traveler fixture |
| guest_two | `10000000-0000-4000-8000-000000000002` | Cross-user denial fixture; auth metadata claims admin, profile remains guest |
| owner_one | `20000000-0000-4000-8000-000000000001` | Owns the public and private property fixtures |
| owner_two | `20000000-0000-4000-8000-000000000002` | Owns second published property |
| admin_one | `30000000-0000-4000-8000-000000000001` | Admin policy fixture |
| support_one | `40000000-0000-4000-8000-000000000001` | Support queue fixture |

### Properties

| Fixture | UUID | State |
| --- | --- | --- |
| public_property | `50000000-0000-4000-8000-000000000001` | Approved + published |
| private_property | `50000000-0000-4000-8000-000000000002` | Submitted + unpublished |
| owner_two_property | `50000000-0000-4000-8000-000000000003` | Approved + published |

### Verification Records

| Fixture | UUID | State |
| --- | --- | --- |
| verification_owner_one | `60000000-0000-4000-8000-000000000001` | Approved individual verification |
| verification_owner_two | `60000000-0000-4000-8000-000000000002` | Under-review business verification |

### Bookings

| Fixture | UUID | State |
| --- | --- | --- |
| completed_booking | `90000000-0000-4000-8000-000000000001` | guest_one on public_property |
| other_booking | `90000000-0000-4000-8000-000000000002` | guest_two on owner_two_property |
| pending_booking | `90000000-0000-4000-8000-000000000003` | guest_one awaiting owner_two approval |
| cancelled_booking | `90000000-0000-4000-8000-000000000004` | guest_two cancelled before approval |

### Conversations

| Fixture | UUID | Notes |
| --- | --- | --- |
| conversation_member | `92000000-0000-4000-8000-000000000001` | guest_one + owner_one |
| conversation_non_member | `92000000-0000-4000-8000-000000000002` | guest_two + owner_two |

### Tickets

| Fixture | UUID | Notes |
| --- | --- | --- |
| ticket_owner | `98000000-0000-4000-8000-000000000001` | guest_one ticket |
| other_ticket | `98000000-0000-4000-8000-000000000002` | guest_two ticket |

### Payouts

| Fixture | UUID | Notes |
| --- | --- | --- |
| payout_completed_booking | `97000000-0000-4000-8000-000000000001` | Paid payout linked to completed_booking |

### Reviews

| Fixture | UUID | Notes |
| --- | --- | --- |
| review_completed_booking | `95000000-0000-4000-8000-000000000001` | Submitted traveler review |

## Scenario Coverage

- Public marketplace read path: `public_property`
- Hidden listing path: `private_property`
- Cross-guest access denial: `guest_one` vs `guest_two`
- Cross-owner access denial: `owner_one` vs `owner_two`
- Completed booking and review flow: `completed_booking`
- Future confirmed booking flow: `other_booking`
- Pending owner approval flow: `pending_booking`
- Cancellation flow: `cancelled_booking`
- Owner verification approved and under-review states
- Message membership and attachment-path scenarios
- Support ticket access for opener, support, and unrelated users
- Payout visibility and admin/support differentiation

## Storage Metadata Coverage

No objects are uploaded by the seed, but deterministic metadata paths are seeded
where the current schema already stores them:

- `profiles.avatar_url`
- `owner_verification_documents.storage_path`
- `property_photos.storage_path`
- `messages.attachment_path`

The paths match the documented conventions in
[`STORAGE_DESIGN.md`](./STORAGE_DESIGN.md).

## Local Reset Workflow

Expected local usage in a Docker-backed local Supabase environment:

1. `npx supabase --version`
2. Start Docker
3. `npx supabase db reset`
4. Confirm `supabase/seed.sql` ran
5. Use the fixture IDs in `supabase/tests/rls.sql`
6. Use the fixture IDs in `supabase/tests/storage_rls.sql`

For the concise local execution guide, see
[`supabase/SEEDING.md`](../supabase/SEEDING.md).

## Notes

- All names, emails, phones, references, and documents are fictional.
- No raw payment secrets, card PANs, identity-document contents, or uploaded
  files are included.
- The seed is intentionally local-only and not suitable for production.
