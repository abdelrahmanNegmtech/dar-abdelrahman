# DAR RLS Access Matrix

This document summarizes the approved Phase 4 Supabase database authorization model for DAR.

Important notes:

- A normal session-bound server Supabase client remains subject to RLS.
- `service_role` bypasses RLS by Supabase design and must remain server-only.
- Public reads are conservative where table-level column grants would otherwise expose more data than intended.
- Several operational mutations are intentionally denied until trusted RPCs or tightly scoped server workflows are introduced.

## Legend

- `allow`: direct access is allowed by RLS and SQL privileges.
- `deny`: direct access is blocked.
- `limited`: direct access is allowed only for narrow rows, columns, or state transitions.
- Trusted workflow: means a future restricted RPC, trigger-guarded operation, or server-side administrative workflow is still required.

## `profiles`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No anonymous profile reads. | none |
| `guest` | limited | limited | limited | deny | Can read own row, bootstrap own row if trigger fallback is needed, and update only self-service profile fields. Cannot change `account_type`, activation, or verification flags. | Email sync beyond auth bootstrap should stay server-controlled. |
| `owner` | limited | limited | limited | deny | Same as guest for self profile only. | Owner/admin role changes require trusted admin flow. |
| `admin` | limited | limited | limited | deny | Can read all rows. Direct table writes are still limited to the same safe self-service column set because app roles do not map to separate Postgres roles. | Staff moderation fields need restricted admin RPC/workflow later. |
| `support_staff` | limited | limited | limited | deny | Self profile only; no broad cross-user profile read. | A secure support-specific profile view may be added later if needed. |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `owner_verifications`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | deny | deny | deny | deny | Non-owner accounts have no direct access. | none |
| `owner` | limited | limited | limited | deny | Can read own submissions, create own draft/submitted rows, and update only own `not_started`/`draft`/`rejected` rows. No direct review-field control. | Approval, rejection coding, and review notes remain staff workflows. |
| `admin` | allow | deny | limited | deny | Can read all rows and update via row policy, but shared SQL privileges still block unsafe broad direct column changes. | Verification review mutations should move through restricted admin tooling/RPC. |
| `support_staff` | deny | deny | deny | deny | No verification access by default. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `owner_verification_documents`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | Private document metadata. | none |
| `guest` | deny | deny | deny | deny | Non-owner accounts have no access. | none |
| `owner` | limited | limited | limited | deny | Can read own verification-document metadata, insert own document metadata, and soft-delete/replace while the parent verification is still editable. | File review status updates and signed-URL issuance remain trusted workflows. |
| `admin` | allow | deny | limited | deny | Can read all rows and update through admin row access. | Approval/rejection of documents should use restricted admin tooling. |
| `support_staff` | deny | deny | deny | deny | No document access by default. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `properties`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | limited | deny | deny | deny | Can read only approved, published, non-deleted property rows through a conservative public column projection. | Full public property projection can move to a secure view later. |
| `guest` | limited | deny | deny | deny | Same public-property read as anon. | none |
| `owner` | limited | limited | limited | deny | Can insert own draft/unpublished rows and update own editable content columns. Direct moderation, suspension, publish/unpublish timestamps, and hard deletes are denied. | Submission, publish/unpublish, archival, and moderation transitions require trusted workflows. |
| `admin` | limited | deny | limited | deny | Can read all rows. Direct table mutation remains column-limited. | Moderation and suspension actions require restricted admin workflow/RPC. |
| `support_staff` | limited | deny | deny | deny | Can read row context through the same conservative projection. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `property_photos`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | Direct table reads are denied so private `storage_path` values are not exposed. | Public photo delivery should use signed URLs or a secure projection later. |
| `guest` | deny | deny | deny | deny | Same as anon for non-owner photo rows. | Same secure delivery requirement. |
| `owner` | limited | limited | limited | limited | Can manage photos only for owned properties. | Storage object access still needs Storage policies later. |
| `admin` | limited | deny | limited | limited | Can read all rows and intervene if needed. | Administrative bulk media actions should use trusted tooling. |
| `support_staff` | limited | deny | deny | deny | Read-only contextual access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `property_availability`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | limited | deny | deny | deny | Only a minimal public projection (`property_id`, `availability_date`, `status`) for public properties. | Rich search/booking availability views can be added later. |
| `guest` | limited | deny | deny | deny | Same as anon. | none |
| `owner` | limited | limited | limited | limited | Can manage only manual rows for owned properties where `booking_id is null`. | Booking-generated inventory writes stay server-controlled. |
| `admin` | limited | deny | limited | limited | Can read all rows and intervene when needed. | none |
| `support_staff` | limited | deny | deny | deny | Read-only contextual access through conservative projection. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `property_pricing_rules`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No public direct pricing-rule reads. | Public pricing/search logic should use a dedicated secure read model later. |
| `guest` | deny | deny | deny | deny | No guest access. | none |
| `owner` | limited | limited | limited | limited | Can manage pricing rules only for owned properties. | Final quote calculation should stay server-controlled. |
| `admin` | allow | deny | limited | limited | Can read all rows. | Finance/admin overrides should use trusted tooling later. |
| `support_staff` | allow | deny | deny | deny | Read-only contextual access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `bookings`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | deny | limited | deny | Can read own bookings and directly perform only the narrow self-cancel transition currently allowed by policy/grants. | Booking creation, payment-state writes, and confirmation flows require trusted workflows. |
| `owner` | limited | deny | deny | deny | Can read only bookings they own. | Owner approval/decline flows require trusted workflows. |
| `admin` | limited | deny | limited | deny | Can read all bookings and use limited direct updates only where shared grants permit them. | Administrative booking management should use restricted workflows. |
| `support_staff` | limited | deny | deny | deny | Can read only ticket-scoped booking context through `can_access_booking()`. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `saved_properties`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | limited | deny | limited | Can manage only own rows and only for currently public properties. | none |
| `owner` | limited | limited | deny | limited | Same self-only access; no cross-user saved-list visibility. | none |
| `admin` | limited | limited | deny | limited | Same self-only direct access; no blanket cross-user browsing. | Analytics should use dedicated reporting paths later. |
| `support_staff` | limited | limited | deny | limited | Same self-only direct access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `conversations`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | deny | deny | deny | Can read only conversations where they are an active member. | Conversation creation remains trusted-workflow-only. |
| `owner` | limited | deny | deny | deny | Same membership-only read. | Conversation creation remains trusted-workflow-only. |
| `admin` | allow | deny | deny | deny | Can read all conversations for moderation/ops. | none |
| `support_staff` | deny | deny | deny | deny | No automatic traveler-owner conversation access. | Separate approved support-moderation workflow would be needed. |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `conversation_members`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | deny | limited | deny | Can read own membership rows and update only own read-state columns. | Membership creation/invitation remains trusted-workflow-only. |
| `owner` | limited | deny | limited | deny | Same as guest. | Membership creation remains trusted-workflow-only. |
| `admin` | allow | deny | limited | deny | Can read all rows. | Bulk moderation changes should use trusted tooling. |
| `support_staff` | deny | deny | deny | deny | No automatic access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `messages`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | limited | deny | deny | Can read/send messages only inside conversations they belong to, with `sender_id = auth.uid()`. | Message edit/delete should move to a restricted workflow if kept. |
| `owner` | limited | limited | deny | deny | Same membership-scoped access. | Message edit/delete should move to a restricted workflow if kept. |
| `admin` | allow | limited | deny | deny | Can read all rows. Insert remains constrained by sender rules. | Moderation actions should use trusted tooling later. |
| `support_staff` | deny | deny | deny | deny | No automatic access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `notifications`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | deny | limited | limited | Can read/update/delete only own rows. Direct creation is denied. | System notification creation remains trusted-workflow-only. |
| `owner` | limited | deny | limited | limited | Same as guest. | System notification creation remains trusted-workflow-only. |
| `admin` | limited | deny | limited | limited | Same direct self-notification scope only. | Cross-user notification operations need trusted workflows. |
| `support_staff` | limited | deny | limited | limited | Same direct self-notification scope only. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `reviews`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | limited | deny | deny | deny | Can read only submitted reviews for public properties through a conservative public projection. | none |
| `guest` | limited | limited | limited | limited | Can read own reviews and submit/update/delete only for own completed bookings that match booking/property/owner relationships. | Owner responses and moderation remain trusted workflows. |
| `owner` | limited | deny | deny | deny | Can read reviews for owned properties. | Owner-response writes require trusted workflow/RPC. |
| `admin` | allow | deny | limited | limited | Can read all rows. Direct moderation fields are not broadly writable through shared grants. | Review moderation workflow still required. |
| `support_staff` | deny | deny | deny | deny | No direct review access by default. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `payment_methods`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | limited | limited | limited | Can manage only own rows. Verification state remains database-controlled. | Token/reference verification and external provider sync remain trusted workflows. |
| `owner` | limited | limited | limited | limited | Same self-only access. | Default-method business rules may later move behind trusted workflow if needed. |
| `admin` | limited | limited | limited | limited | Same self-only direct access. No blanket cross-user financial access. | Financial ops need trusted workflows. |
| `support_staff` | limited | limited | limited | limited | Same self-only direct access. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `payouts`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | deny | deny | deny | deny | No access. | none |
| `owner` | limited | deny | deny | deny | Can read only own payouts. No direct status mutation. | Scheduling, approval, processing, and payment marking stay trusted/server-controlled. |
| `admin` | allow | deny | deny | deny | Can read all payouts. | Finance/admin workflows remain trusted-only. |
| `support_staff` | deny | deny | deny | deny | No payout access by default. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `support_tickets`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | limited | limited | deny | Can create/read own tickets and directly move only own tickets between `open` and `closed`. Cannot assign staff or set privileged workflow fields. | Staff queue assignment, escalation, resolution, and internal workflow updates remain trusted workflows. |
| `owner` | limited | limited | limited | deny | Same as guest for own tickets. | Staff/admin workflow remains trusted. |
| `admin` | allow | deny | limited | deny | Can read all tickets; direct direct-table mutation remains shared-grant-limited. | Administrative queue management requires trusted workflow. |
| `support_staff` | limited | deny | deny | deny | Can read assigned or unassigned operational queue rows. | Queue assignment and workflow mutations require trusted workflow. |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `support_ticket_messages`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | limited | limited | deny | deny | Can read only non-internal messages on own tickets and can insert only non-internal messages with `sender_id = auth.uid()`. | Message editing/deletion remains denied; attachments/signing remain future work. |
| `owner` | limited | limited | deny | deny | Same as guest for own tickets. | none |
| `admin` | allow | limited | deny | deny | Can read all ticket messages and insert staff-role messages inside accessible tickets. | Administrative workflow tooling remains trusted. |
| `support_staff` | limited | limited | deny | deny | Can read accessible ticket threads including internal notes and can insert support-staff messages. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## `audit_logs`

| Role | SELECT | INSERT | UPDATE | DELETE | Notes | Trusted workflow |
|---|---|---|---|---|---|---|
| `anon` | deny | deny | deny | deny | No access. | none |
| `guest` | deny | deny | deny | deny | No access. | System-controlled only. |
| `owner` | deny | deny | deny | deny | No access. | System-controlled only. |
| `admin` | allow | deny | deny | deny | Read-only append-only audit access. | Audit-log creation remains system/server-controlled. |
| `support_staff` | deny | deny | deny | deny | No access by default. | none |
| `service_role` | allow | allow | allow | allow | Bypasses RLS. | server-only |

## Direct Client Mutations Intentionally Denied In Phase 4

- Direct booking creation
- Owner property moderation and suspension actions
- Owner publish/unpublish/archive transitions
- Verification approval/review-note writes
- Verification-document review decisions
- Conversation creation and membership management
- Message edit/delete mutations
- Notification creation
- Owner-response review mutations
- Payout inserts and status changes
- Support-ticket assignment/escalation/resolution workflow updates
- Audit-log inserts from normal application clients

## Trusted Workflows Still Required

- Property submission, publication, archival, moderation, and suspension
- Booking creation and owner-decision state transitions
- Verification and document review actions
- Review owner responses and moderation actions
- System notification creation
- Payout processing and finance operations
- Support queue assignment, escalation, and resolution operations
- Public-facing secure read models/views for richer marketplace property data
- Storage object policies and signed URL flows for private verification documents and media
