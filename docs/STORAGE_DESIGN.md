# DAR Storage Design

This document records the approved Phase 5.5 Storage architecture audit for DAR.

`docs/STORAGE_ACCESS_MATRIX.md` remains the role/operation matrix.
This file is the design source of truth for bucket purpose, paths, lifecycle, privacy, and cleanup.

# Storage goals and non-goals

Goals:

- keep every DAR bucket private by default
- make object paths deterministic and ownership-checkable
- align Storage with current UI flows, current schema, and current RLS
- avoid public leaks of private bucket paths or unpublished listing media
- define a future-safe workflow for object upload plus database metadata writes

Non-goals:

- no seed data
- no Storage UI wiring
- no uploads from the browser to live Supabase
- no TypeScript database type generation
- no credentials or signed-URL implementation code
- no speculative generic uploads bucket

# Bucket inventory

| Bucket ID | Requirement source | Public/private | Required now | Initial or deferred | Related table/column | Missing metadata table |
|---|---|---|---|---|---|---|
| `property-photos` | Owner photo uploader UI in [app/owner/properties/new/photos/page.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/app/owner/properties/new/photos/page.tsx), plus `property_photos.storage_path` in schema | private | yes | initial | `public.property_photos.storage_path` | none |
| `avatars` | Traveler profile photo picker in [features/traveler/components/ProfilePage.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/features/traveler/components/ProfilePage.tsx), plus `profiles.avatar_url` | private | yes | initial | `public.profiles.avatar_url` | no dedicated avatar asset table |
| `owner-verification-documents` | Owner verification file inputs in [app/owner/verification/verification-page.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/app/owner/verification/verification-page.tsx), plus `owner_verification_documents.storage_path` | private | yes | initial | `public.owner_verification_documents.storage_path` | none |
| `support-attachments` | Support ticket attachment input in [features/traveler/components/SupportPage.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/features/traveler/components/SupportPage.tsx) and attachment rendering in [features/traveler/components/SupportTicketDetailsPage.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/features/traveler/components/SupportTicketDetailsPage.tsx) | private | yes | initial | support ticket messages render attachments, but no DB path column exists yet | `support_ticket_attachments` or equivalent |
| `message-attachments` | Existing schema field `messages.attachment_path`, message attachment rendering in [features/traveler/components/MessagesPage.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/features/traveler/components/MessagesPage.tsx), but upload buttons are explicitly disabled in preview | private | not yet | keep as pre-provisioned infrastructure | `public.messages.attachment_path` | no separate attachment table yet; current schema stores one path on `messages` |
| `payment-evidence` | Receipt upload inputs in [app/checkout/page.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/app/checkout/page.tsx) and [app/booking/request-received/page.tsx](/C:/Users/Ftoma%202026/DAR/dar-ui/app/booking/request-received/page.tsx) | private | yes | initial | booking flow stores local receipt state only; no DB evidence column/table yet | `booking_payment_evidence` or equivalent |

Decision notes:

- No bucket is removed in this audit.
- `message-attachments` is the only bucket that is not a live current upload requirement. It remains only because the schema already includes `messages.attachment_path` and the UI already renders attachments and a shared-files panel. It must be treated as pre-provisioned infrastructure, not as a connected upload feature.
- No generic `uploads` bucket is approved.

# Privacy decision per bucket

| Bucket ID | Decision | Why |
|---|---|---|
| `property-photos` | private | A public bucket would bypass listing moderation and publication state. |
| `avatars` | private | Current public profile access is intentionally conservative. |
| `owner-verification-documents` | private | Verification files are sensitive identity documents. |
| `support-attachments` | private | Support files may contain receipts, IDs, or account evidence. |
| `message-attachments` | private | Files must be limited to conversation members and admins. |
| `payment-evidence` | private | Payment receipts are sensitive financial evidence. |

# Exact path conventions

All paths are deterministic and UUID-based. No email, slug, or user-supplied folder names are allowed.

`property-photos`

- full path: `{owner_id}/{property_id}/{photo_id}.{extension}`
- folder segment 1: owner user UUID
- folder segment 2: property UUID
- filename: photo asset UUID plus extension
- `storage_uuid_folder_segment(name, 2)` resolves the property UUID

`avatars`

- full path: `{user_id}/{asset_id}.{extension}`
- folder segment 1: user UUID
- filename: avatar asset UUID plus extension

`owner-verification-documents`

- full path: `{owner_id}/{verification_id}/{document_id}.{extension}`
- folder segment 1: owner user UUID
- folder segment 2: owner verification UUID
- filename: verification document UUID plus extension
- `storage_uuid_folder_segment(name, 2)` resolves the verification UUID

`support-attachments`

- full path: `{user_id}/{ticket_id}/{attachment_id}.{extension}`
- folder segment 1: ticket opener UUID
- folder segment 2: support ticket UUID
- filename: attachment UUID plus extension
- `storage_uuid_folder_segment(name, 2)` resolves the ticket UUID

`message-attachments`

- full path: `{sender_id}/{conversation_id}/{message_id}/{attachment_id}.{extension}`
- folder segment 1: sender UUID
- folder segment 2: conversation UUID
- folder segment 3: message UUID
- filename: attachment UUID plus extension
- `storage_uuid_folder_segment(name, 2)` resolves the conversation UUID

`payment-evidence`

- full path: `{user_id}/{booking_id}/{evidence_id}.{extension}`
- folder segment 1: uploading user UUID
- folder segment 2: booking UUID
- filename: payment evidence UUID plus extension
- `storage_uuid_folder_segment(name, 2)` resolves the booking UUID

# Allowed MIME types

| Bucket ID | MIME types |
|---|---|
| `property-photos` | `image/jpeg`, `image/png`, `image/webp` |
| `avatars` | `image/jpeg`, `image/png`, `image/webp` |
| `owner-verification-documents` | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` |
| `support-attachments` | `application/pdf`, `image/jpeg`, `image/png` |
| `message-attachments` | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` |
| `payment-evidence` | `application/pdf`, `image/jpeg`, `image/png` |

# Maximum file sizes

| Bucket ID | Maximum file size |
|---|---|
| `property-photos` | 10 MB |
| `avatars` | 5 MB |
| `owner-verification-documents` | 10 MB |
| `support-attachments` | 10 MB |
| `message-attachments` | 15 MB |
| `payment-evidence` | 10 MB |

# Database metadata relationships

- `property-photos` maps to `public.property_photos.storage_path`.
- `owner-verification-documents` maps to `public.owner_verification_documents.storage_path`.
- `message-attachments` currently maps to `public.messages.attachment_path`.
- `avatars` currently map only indirectly through `public.profiles.avatar_url`.
- `support-attachments` currently have no metadata table.
- `payment-evidence` currently has no metadata table.

Rules:

- Storage is never the business source of truth on its own.
- Where a metadata table exists, the stored path must exactly equal the final object path.
- Public consumers must not directly read `property_photos.storage_path`; that Phase 4 public row access was removed in this audit.

# Upload lifecycle

For buckets with a metadata table:

1. Create deterministic UUIDs first.
2. Build the final object path from those UUIDs.
3. Upload the object to Storage using the final path.
4. Insert or update the metadata row in the same trusted server workflow.
5. Return application-facing data only after both steps succeed.

For buckets without a metadata table:

1. Do not connect live upload UI yet.
2. Add a metadata table or an approved equivalent write model first.
3. Only then enable trusted upload flows.

# Replacement lifecycle

- `property-photos`: owner may replace by uploading a new object and updating the matching `property_photos.storage_path` row in one workflow.
- `avatars`: replacement should update `profiles.avatar_url` only after the new object is stored and the old object is scheduled for cleanup.
- `owner-verification-documents`: replacement should soft-delete or supersede the prior metadata row according to verification-state rules.
- `support-attachments`: replacement is not approved until a metadata model exists.
- `message-attachments`: replacement is not approved for direct client use; attachment path should remain stable after message creation.
- `payment-evidence`: replacement is not approved until a metadata model exists.

# Deletion lifecycle

- Never delete by removing rows directly from `storage.objects`.
- Application or server workflows must call the Storage API.
- Where metadata exists, mark or remove metadata in the same workflow.
- Where metadata does not exist yet, object deletion should remain a trusted server-only cleanup action.

# Failed-upload and failed-metadata scenarios

If upload fails before metadata write:

- no database row should be written
- surface an application error

If upload succeeds but metadata write fails:

- immediately delete the just-uploaded object in the same trusted workflow when possible
- if immediate deletion fails, log the object path for orphan cleanup review

If metadata write succeeds but later delivery configuration fails:

- keep the object private
- do not fall back to public bucket access or `getPublicUrl()`

# Orphan-object cleanup strategy

Short term:

- keep live upload integrations disabled where metadata is missing
- continue using local preview state in current mock screens

Later:

- schedule audits comparing Storage object names against:
  - `public.property_photos.storage_path`
  - `public.owner_verification_documents.storage_path`
  - `public.messages.attachment_path`
  - future support/payment attachment metadata tables
- move candidate orphans to a review list before deletion
- delete only through the Storage API

# Signed URL strategy

- `getPublicUrl()` is not approved for any DAR bucket in this phase.
- all anonymous or semi-public delivery must use short-lived signed URLs or a controlled server layer
- signed URLs for private files must only be issued after the caller passes the matching database authorization check

# Public property photo delivery strategy

- The bucket stays private.
- Anonymous users must not read `property_photos.storage_path` directly from the database.
- Property photos for the public marketplace should be delivered only after both of these are true:
  - the parent property is `approved` and `published`
  - the server issues a short-lived signed URL or proxies the image
- This prevents unpublished listing media from leaking through guessed object paths or public metadata rows.

# Security risks

- Public bucket access would bypass moderation and publication controls.
- Exposing `storage_path` publicly would make private bucket paths enumerable even if object reads stayed blocked.
- Broad update policies can allow path moves across ownership boundaries if path checks are weak.
- Buckets without metadata tables can accumulate orphaned files and weak auditability.
- Message and support files may contain personal or financial data and need the same privacy standard as verification documents.

# Future expansion

- add dedicated metadata tables for support attachments and payment evidence
- decide whether message attachments remain one-path-on-`messages` or move to a child table for multi-file support
- add image transformation and caching only behind signed or controlled delivery
- add admin/staff workflows for review, cleanup, and evidence handling through trusted server paths

# Deferred UI integration

- owner property photos remain local-preview only
- traveler avatar upload remains local-preview only
- owner verification document upload remains local-preview only
- support attachments remain local-preview only
- message attachment upload remains disabled in preview
- payment evidence upload remains local-preview only

No UI file changes are part of this phase.
