# DAR Storage Access Matrix

This document defines the approved Phase 5 Supabase Storage foundation for DAR.

The current goal is a secure initial storage layer, not upload UI integration. Buckets are intentionally private by default, and several flows remain blocked until trusted server actions or metadata-writing workflows are introduced.

## Current Source Of Truth

This storage design is derived from three categories of evidence:

### 1. Flows already required by current code

- Owner property photo selection and drag/drop UX in [app/owner/properties/new/photos/page.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\app\owner\properties\new\photos\page.tsx)
- Owner verification image/document selection in [app/owner/verification/verification-page.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\app\owner\verification\verification-page.tsx)
- Traveler profile avatar file selection in [features/traveler/components/ProfilePage.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\features\traveler\components\ProfilePage.tsx)
- Traveler support-ticket attachment input in [features/traveler/components/SupportPage.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\features\traveler\components\SupportPage.tsx)
- Booking checkout / request-received payment receipt upload inputs in [app/checkout/page.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\app\checkout\page.tsx) and [app/booking/request-received/page.tsx](C:\Users\Ftoma 2026\DAR\dar-ui\app\booking\request-received\page.tsx)

### 2. Flows explicitly described in documentation or schema

- Property photo metadata via `property_photos.storage_path`
- Owner verification document metadata via `owner_verification_documents.storage_path`
- Avatar URL storage via `profiles.avatar_url`
- Message attachment support via `messages.attachment_path`
- Project roadmap note `B8` covering property photos, verification docs, and receipts

### 3. Possible future flows intentionally deferred

- Review photo uploads
- Public CDN-style image delivery
- Multi-file support tables such as `message_attachments` and `support_ticket_attachments`
- Staff-side support attachment upload UI
- Service-role upload clients exposed to the browser

## Bucket Inventory

| Bucket | Privacy | Current justification | Status |
|---|---|---|---|
| `property-photos` | private | Current owner photo flow + `property_photos.storage_path` | created |
| `avatars` | private | Current traveler avatar selection + `profiles.avatar_url` | created |
| `owner-verification-documents` | private | Current owner verification uploads + `owner_verification_documents.storage_path` | created |
| `support-attachments` | private | Current traveler support attachment UI + support thread attachment rendering | created |
| `message-attachments` | private | Pre-provisioned for existing `messages.attachment_path` schema and attachment-rendering UI; upload controls are still disabled in preview | created as pre-provisioned infrastructure |
| `payment-evidence` | private | Current receipt upload UI + payment-verification flow state | created |

No generic `uploads` bucket was created.

## Privacy Decisions

### `property-photos`

- Bucket is private.
- Reason: a public bucket would bypass listing moderation/publication state and expose images independently of property approval.
- Intended delivery model:
  - owner/staff direct authenticated access
  - authenticated read for approved/published property objects only
  - anonymous/public marketplace delivery must use signed URLs or a controlled server delivery layer later
- Database note:
  - direct anonymous table reads of `property_photos` metadata should stay denied so `storage_path` is not exposed publicly

### `avatars`

- Bucket is private.
- Reason: the current database/RLS model does not yet provide a safe public profile projection.
- Implication: even user avatars should not become globally enumerable or permanently public until product/privacy rules are explicit.

### `owner-verification-documents`

- Bucket is private and strictly non-public.
- These files must never be exposed through `getPublicUrl` or anonymous object access.

### `support-attachments`

- Bucket is private.
- Attachments may contain receipts, IDs, or other sensitive material.

### `message-attachments`

- Bucket is private.
- Access is scoped to conversation membership only.

### `payment-evidence`

- Bucket is private.
- Access is scoped to the uploading user and admin operational review.

## Path Conventions

The bucket name carries the storage domain. Object names are deterministic and ownership-aware:

| Bucket | Object path convention |
|---|---|
| `property-photos` | `{owner_id}/{property_id}/{photo_id}.{extension}` |
| `avatars` | `{user_id}/{asset_id}.{extension}` |
| `owner-verification-documents` | `{owner_id}/{verification_id}/{document_id}.{extension}` |
| `support-attachments` | `{user_id}/{ticket_id}/{attachment_id}.{extension}` |
| `message-attachments` | `{sender_id}/{conversation_id}/{message_id}/{attachment_id}.{extension}` |
| `payment-evidence` | `{user_id}/{booking_id}/{evidence_id}.{extension}` |

Rules:

- Path segments use database UUIDs, never user-supplied slugs or email addresses.
- File extensions remain meaningful, but authorization never depends on filename secrecy.
- Upload callers should generate object IDs before upload so metadata rows and storage paths can be deterministic.
- Buckets are partitioned by business domain first, then by owner/context IDs.

## Bucket Limits And MIME Strategy

| Bucket | Max size | Allowed MIME types | Notes |
|---|---|---|---|
| `property-photos` | 10 MB | `image/jpeg`, `image/png`, `image/webp` | Matches current owner photo input |
| `avatars` | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Matches current traveler avatar input |
| `owner-verification-documents` | 10 MB | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` | Covers ID images and authorization PDFs |
| `support-attachments` | 10 MB | `application/pdf`, `image/jpeg`, `image/png` | Matches current support attachment input |
| `message-attachments` | 15 MB | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` | Initial image/file support only |
| `payment-evidence` | 10 MB | `application/pdf`, `image/jpeg`, `image/png` | Matches current receipt upload inputs |

Validation strategy:

- Bucket-level MIME and file-size limits reject obviously invalid uploads at Storage level.
- Application-level validation must still check:
  - file count per flow
  - business-specific attachment purpose
  - whether the referenced property / booking / verification / ticket / conversation exists and is in a writable state
  - whether replacement or overwrite is allowed
- Sensitive-file uploads should also validate extension/MIME agreement in trusted server workflows before finalizing metadata.

## `storage.objects` Access Model

### Anonymous

- No anonymous Storage object access is granted.
- Even publicly visible property photos remain private at Storage layer for now.

### Authenticated guest

- Can upload/read/update/delete:
  - own avatar objects
  - own payment-evidence objects for bookings they can access
  - own support attachments for tickets they can access
  - message attachments only when they are the sender and a conversation member
- Can read private property photo objects only when the property is already approved and published, or where they own/staff-manage the property context.

### Owner

- Same self-scoped capabilities as guest for avatar/support/payment evidence.
- Can manage property photos for owned properties.
- Can manage owner-verification document objects for owned verification records.
- Can upload message attachments only into conversations they belong to.

### Admin

- Can read:
  - all property photos
  - all owner-verification documents
  - all message attachments
  - all payment-evidence objects
  - support attachments for accessible ticket context
- Admin direct object mutation is intentionally narrow; this phase focuses on safe baseline read access, not broad staff file editing.

### Support staff

- Can read support attachments only for accessible ticket queues.
- Does not automatically gain access to verification documents, payout/payment evidence, or traveler-owner message attachments.

### Service role

- Bypasses RLS by Supabase design.
- Must remain server-only.

## Object Policy Summary By Bucket

### `property-photos`

- `SELECT`
  - owner/staff can list and read
  - authenticated users can read approved/published property photos when they already have an authorized object path
- `INSERT`
  - only owners uploading into `{auth.uid()}/{property_id}/...` for owned properties
- `UPDATE` / `DELETE`
  - only the uploading owner

### `avatars`

- `SELECT`
  - self or admin
- `INSERT` / `UPDATE` / `DELETE`
  - self only in `{auth.uid()}/...`

### `owner-verification-documents`

- `SELECT`
  - owner of the verification or admin
- `INSERT` / `UPDATE` / `DELETE`
  - owner only in `{auth.uid()}/{verification_id}/...`

### `support-attachments`

- `SELECT`
  - anyone who can access the support ticket under current ticket RLS
- `INSERT` / `UPDATE` / `DELETE`
  - ticket opener only for now, scoped to `{auth.uid()}/{ticket_id}/...`

### `message-attachments`

- `SELECT`
  - conversation members or admin
- `INSERT` / `UPDATE` / `DELETE`
  - sender only in `{auth.uid()}/{conversation_id}/{message_id}/...`

### `payment-evidence`

- `SELECT`
  - uploading user or admin, plus booking access check
- `INSERT` / `UPDATE` / `DELETE`
  - uploading user only in `{auth.uid()}/{booking_id}/...`

## Metadata Consistency Strategy

For buckets already backed by database metadata:

- `property-photos`
  - database row is `property_photos`
  - `storage_path` in the row must exactly match the object path
  - public/anonymous consumers should not query `property_photos.storage_path` directly
- `owner-verification-documents`
  - database row is `owner_verification_documents`
  - `storage_path` in the row must exactly match the object path
- `messages`
  - `attachment_path` is already present in schema, but no upload flow is connected yet

For buckets not yet backed by dedicated metadata tables:

- `avatars`
  - `profiles.avatar_url` exists, but no trusted upload/update workflow is wired yet
- `support-attachments`
  - current database has no attachment metadata table
- `payment-evidence`
  - current database has no dedicated evidence metadata table

Implementation rule for later phases:

1. Generate deterministic IDs server-side.
2. Upload object to Storage API using the final path.
3. Persist the matching database metadata in the same trusted workflow.
4. If metadata write fails, immediately remove the uploaded object.

Because Storage metadata is not the business source of truth, application code must never treat `storage.objects` alone as sufficient business metadata.

## Orphan File Strategy

Short-term:

- Keep uploads disabled until a trusted flow can write both object and metadata consistently.
- For the currently mock-only UI, continue using local previews rather than partial real uploads.

Later operational strategy:

- Run scheduled orphan audits comparing:
  - `property_photos.storage_path`
  - `owner_verification_documents.storage_path`
  - `messages.attachment_path`
  - future support/payment attachment metadata tables
  against `storage.objects.name`
- Any object without a valid metadata reference moves to a review queue before deletion.
- Never delete Storage objects by deleting `storage.objects` rows directly; always use the Storage API.

## Signed URL Strategy

- `getPublicUrl()` must not be used for any private DAR bucket.
- Public marketplace delivery for property photos should use:
  - short-lived signed URLs generated server-side, or
  - a controlled image delivery layer
- Verification documents, support attachments, message attachments, and payment evidence should use short-lived signed URLs only after the caller passes database authorization checks.

## Current Gaps Intentionally Left For Later

- No upload UI is wired to Supabase yet.
- No storage helper service/client wrapper was added.
- No support attachment metadata table exists yet.
- No payment evidence metadata table exists yet.
- No owner/staff moderation UI for storage assets exists yet.
- No review-photo storage exists yet.

## Policy Test Plan

The Storage RLS test plan is in [supabase/tests/storage_rls.sql](C:\Users\Ftoma 2026\DAR\dar-ui\supabase\tests\storage_rls.sql).
