-- DAR Phase 4 RLS test plan
-- Static verification artifact only.
--
-- `supabase/seed.sql` now provides deterministic local-only auth users and
-- domain fixtures for the scenarios below. This file remains a static test plan
-- until a runtime harness is added.
--
-- Required fixtures for runtime execution:
--   guest_a_uuid = 10000000-0000-4000-8000-000000000001
--   guest_b_uuid = 10000000-0000-4000-8000-000000000002
--   owner_a_uuid = 20000000-0000-4000-8000-000000000001
--   owner_b_uuid = 20000000-0000-4000-8000-000000000002
--   admin_uuid = 30000000-0000-4000-8000-000000000001
--   support_uuid = 40000000-0000-4000-8000-000000000001
--   public_property_uuid = 50000000-0000-4000-8000-000000000001
--   private_property_uuid = 50000000-0000-4000-8000-000000000002
--   completed_booking_uuid = 90000000-0000-4000-8000-000000000001
--   other_booking_uuid = 90000000-0000-4000-8000-000000000002
--   conversation_member_uuid = 92000000-0000-4000-8000-000000000001
--   conversation_non_member_uuid = 92000000-0000-4000-8000-000000000002
--   ticket_owner_uuid = 98000000-0000-4000-8000-000000000001
--   other_ticket_uuid = 98000000-0000-4000-8000-000000000002
--
-- Suggested runtime approach:
-- 1. `supabase db reset`
-- 2. Let `supabase/seed.sql` create deterministic auth users and related
--    profile rows.
-- 3. Set JWT claims per scenario and assert success/failure against PostgREST
--    or SQL role-based sessions.

-- Scenario 1
-- Anonymous cannot read an unpublished property.
-- Expect: zero rows returned.

-- Scenario 2
-- Anonymous can read an approved and published property.
-- Expect: one row returned through the conservative public projection.

-- Scenario 3
-- Guest cannot read another guest's profile.
-- Expect: zero rows returned.

-- Scenario 4
-- Guest cannot read another guest's booking.
-- Expect: zero rows returned.

-- Scenario 5
-- Owner cannot modify another owner's property.
-- Expect: update affects zero rows or errors with permission denied.

-- Scenario 6
-- Owner cannot self-approve a property.
-- Expect: direct update denied because moderation columns are not writable.

-- Scenario 7
-- Owner cannot approve their verification.
-- Expect: direct update denied because approval/review fields are not writable.

-- Scenario 8
-- User can read only their saved properties.
-- Expect: own rows visible, other users' rows hidden.

-- Scenario 9
-- Non-member cannot read conversation messages.
-- Expect: zero rows returned.

-- Scenario 10
-- Conversation member can read messages.
-- Expect: rows returned for the member's conversation only.

-- Scenario 11
-- User cannot spoof `sender_id` when inserting a message.
-- Expect: insert rejected unless `sender_id = auth.uid()`.

-- Scenario 12
-- User cannot read another user's notifications.
-- Expect: zero rows returned.

-- Scenario 13
-- Guest cannot review an unrelated booking.
-- Expect: insert rejected because booking ownership/completion checks fail.

-- Scenario 14
-- Owner cannot read another owner's payouts.
-- Expect: zero rows returned.

-- Scenario 15
-- Owner cannot update payout status.
-- Expect: update rejected because no direct payout mutation privilege exists.

-- Scenario 16
-- Ticket opener can read their own ticket.
-- Expect: one row returned.

-- Scenario 17
-- Ticket opener cannot create an internal support note.
-- Expect: insert rejected when `is_internal = true`.

-- Scenario 18
-- Normal authenticated user cannot read audit logs.
-- Expect: zero rows returned.

-- Scenario 19
-- Client metadata cannot grant admin access.
-- Expect: a user whose `auth.users` metadata claims admin but whose
-- `profiles.account_type` is `guest` does not satisfy admin policies.

-- Scenario 20
-- Support staff does not automatically gain admin financial powers.
-- Expect: support user cannot read all payouts and cannot mutate payout rows.

-- Scenario 21
-- Traveler can read only their own active reviews.
-- Expect: `guest_a_uuid` sees only rows where `traveler_id = guest_a_uuid`,
-- and removed reviews stay hidden from the standard traveler list.

-- Scenario 22
-- Traveler cannot update another traveler's review.
-- Expect: `guest_b_uuid` cannot update the seeded review row that belongs to
-- `guest_a_uuid`; update affects zero rows or errors with permission denied.

-- Scenario 23
-- Traveler can soft-delete only their own review through
-- `public.remove_own_review(review_uuid)`.
-- Expect: `guest_a_uuid` can soft-delete their own active review, while
-- `guest_b_uuid` receives no affected row for the same RPC call.

-- Scenario 24
-- Owner can read reviews only for their own properties.
-- Expect: `owner_a_uuid` can read submitted or pending review rows tied to
-- their bookings/properties, but cannot read rows for `owner_b_uuid`.

-- Scenario 25
-- Public review reads stay limited to submitted, visible reviews on published
-- properties.
-- Expect: anonymous reads exclude rows with `hidden_at`, `removed_at`, or
-- non-`submitted` status, and exclude reviews whose property is unpublished.

-- Scenario 26
-- Guest cannot read owner payouts.
-- Expect: `guest_a_uuid` and `guest_b_uuid` both return zero payout rows.

-- Scenario 27
-- Owner payout detail remains owner-scoped.
-- Expect: `owner_a_uuid` can read payout rows such as
-- `97000000-0000-4000-8000-000000000001`, while `owner_b_uuid` cannot read that
-- same payout ID.

-- Scenario 28
-- Owner cannot insert arbitrary payout rows.
-- Expect: insert is rejected because owners do not have direct payout write
-- privileges.

-- Scenario 29
-- Owner cannot update payout status, paid timestamp, or payout amounts.
-- Expect: direct update is rejected or affects zero rows when attempting to
-- change `status`, `paid_at`, `gross_amount`, `commission_amount`, or
-- `net_amount`.

-- Scenario 30
-- Owner payout aggregates must reflect only owner-scoped rows.
-- Expect: owner-level sums and counts include only that owner's payout rows and
-- exclude all payouts owned by other profiles.

-- Scenario 31
-- Guest can read only their own support tickets.
-- Expect: `guest_a_uuid` sees only their seeded ticket rows, while
-- `guest_b_uuid` sees only their own ticket rows.

-- Scenario 32
-- Guest cannot read another guest's support ticket detail or thread.
-- Expect: `guest_b_uuid` receives zero rows for
-- `98000000-0000-4000-8000-000000000001` and its messages.

-- Scenario 33
-- Guest can create a support ticket only for themselves and only with an
-- accessible booking reference.
-- Expect: `user_id` must resolve to `auth.uid()` and unrelated booking IDs are
-- rejected by policy or trusted RPC validation.

-- Scenario 34
-- Guest can send an external support message only on their own ticket.
-- Expect: insert succeeds for `guest_a_uuid` on their own ticket when
-- `is_internal = false`.

-- Scenario 35
-- Guest cannot create an internal support note or spoof a support sender role.
-- Expect: traveler inserts with `is_internal = true` or
-- `sender_role = support_staff` are rejected.

-- Scenario 36
-- Guest cannot directly set privileged support workflow statuses.
-- Expect: traveler updates to `awaiting_customer`, `awaiting_support`,
-- `in_progress`, `resolved`, or `escalated` are rejected.

-- Scenario 37
-- Support staff can read queue-accessible tickets and ticket messages,
-- including internal notes.
-- Expect: `support_uuid` can read assigned or unassigned queue tickets plus
-- their full message threads.

-- Scenario 38
-- Support staff can insert both external responses and internal notes.
-- Expect: `support_uuid` can insert `sender_role = support_staff` messages,
-- with `is_internal` either false or true, for queue-accessible tickets.

-- Scenario 39
-- Travelers cannot read internal support notes.
-- Expect: `guest_a_uuid` does not see seeded internal note
-- `98100000-0000-4000-8000-000000000005` on their ticket thread.

-- Optional additional scenarios
--
-- A. Guest can cancel only their own booking and only into `cancelled`.
-- B. Guest cannot create support ticket for an unrelated booking.
-- C. Owner cannot alter booking-generated property availability rows.
-- D. Anonymous cannot read verification-document metadata.
-- E. Support staff can read assigned or unassigned operational tickets but not
--    traveler-owner conversations.
-- F. Anonymous and non-owner authenticated users cannot read
--    `property_photos.storage_path` rows directly; public property photo
--    delivery should happen through signed URLs or a secure projection.
