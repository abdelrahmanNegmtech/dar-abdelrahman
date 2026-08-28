-- DAR Phase 5 Storage RLS test plan
-- Static verification artifact only.
--
-- This file documents the scenarios that must pass once local Supabase runtime
-- execution is available with the deterministic fixtures from `supabase/seed.sql`.

-- Required placeholder fixtures
--   guest_a_uuid = 10000000-0000-4000-8000-000000000001
--   guest_b_uuid = 10000000-0000-4000-8000-000000000002
--   owner_a_uuid = 20000000-0000-4000-8000-000000000001
--   owner_b_uuid = 20000000-0000-4000-8000-000000000002
--   admin_uuid = 30000000-0000-4000-8000-000000000001
--   support_uuid = 40000000-0000-4000-8000-000000000001
--   public_property_uuid = 50000000-0000-4000-8000-000000000001
--   private_property_uuid = 50000000-0000-4000-8000-000000000002
--   verification_a_uuid = 60000000-0000-4000-8000-000000000001
--   verification_b_uuid = 60000000-0000-4000-8000-000000000002
--   ticket_a_uuid = 98000000-0000-4000-8000-000000000001
--   ticket_b_uuid = 98000000-0000-4000-8000-000000000002
--   conversation_a_uuid = 92000000-0000-4000-8000-000000000001
--   conversation_b_uuid = 92000000-0000-4000-8000-000000000002
--   booking_a_uuid = 90000000-0000-4000-8000-000000000001
--   booking_b_uuid = 90000000-0000-4000-8000-000000000002

-- Scenario 1
-- Anonymous cannot list `property-photos`.

-- Scenario 2
-- Anonymous cannot directly download a `property-photos` object, even when the
-- parent property is approved and published.

-- Scenario 3
-- Authenticated owner can upload to
--   property-photos/{owner_id}/{property_id}/{photo_id}.jpg
-- only when `{owner_id} = auth.uid()` and the property belongs to them.

-- Scenario 4
-- Owner cannot upload property photos into another owner's folder or property.

-- Scenario 5
-- Authenticated user can read a property photo object for an approved/published
-- property via authenticated object-get, but cannot list unrelated private
-- property photo folders.

-- Scenario 6
-- User can upload avatar only under
--   avatars/{auth.uid()}/{asset_id}.png
-- and cannot write into another user's avatar folder.

-- Scenario 7
-- User can read only their own avatar objects; admin can read any avatar.

-- Scenario 8
-- Owner verification documents are not accessible to anonymous users.

-- Scenario 9
-- Owner can upload only to
--   owner-verification-documents/{auth.uid()}/{verification_id}/{document_id}.pdf
-- when they own the verification.

-- Scenario 10
-- Owner cannot upload verification documents for another owner's verification.

-- Scenario 11
-- Support ticket opener can upload support attachment only under
--   support-attachments/{auth.uid()}/{ticket_id}/{attachment_id}.pdf
-- for a ticket they can access.

-- Scenario 12
-- Ticket opener cannot upload `support-attachments` for another user's ticket.

-- Scenario 13
-- Support staff can read support attachments only for accessible ticket queues.

-- Scenario 14
-- Normal authenticated user cannot read support attachments for another user's
-- ticket.

-- Scenario 15
-- Conversation member can upload message attachment only under
--   message-attachments/{auth.uid()}/{conversation_id}/{message_id}/{attachment_id}.jpg
-- when they belong to the conversation.

-- Scenario 16
-- Non-member cannot read or upload message attachments for another conversation.

-- Scenario 17
-- Traveler can upload payment evidence only under
--   payment-evidence/{auth.uid()}/{booking_id}/{evidence_id}.pdf
-- for a booking they can access.

-- Scenario 18
-- Owner host cannot read another user's payment evidence by default.

-- Scenario 19
-- Support staff does not automatically gain payment-evidence access unless a
-- later product decision explicitly adds it.

-- Scenario 20
-- Admin can read payment evidence for operational review.

-- Scenario 21
-- Bucket MIME restrictions reject unsupported file types for each bucket.

-- Scenario 22
-- Bucket file-size limits reject oversized uploads for each bucket.

-- Scenario 23
-- Client-supplied path manipulation with malformed UUID folder segments does
-- not bypass policies because invalid UUID path segments resolve to null.

-- Scenario 24
-- No policy allows `getPublicUrl()` style public access because all DAR buckets
-- created in this phase are private.

-- Scenario 25
-- Admin can read `property-photos` objects for operational review but cannot
-- directly update or delete them through baseline client-facing Storage
-- policies.
