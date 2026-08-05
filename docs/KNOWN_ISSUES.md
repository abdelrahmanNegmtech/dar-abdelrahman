# Known Issues

> **The official issue tracker for the DAR project.** Every issue below was identified by analyzing the actual codebase and the verified audits (`UI_AUDIT.md`, `FUNCTIONAL_AUDIT.md`, `BACKEND_AUDIT.md`, `TECHNICAL_DEBT.md`, and the Owner Portal Functional Audit). No issues are invented; duplicate findings are grouped into single entries.
>
> **Issue lifecycle:** `Open` → `In Progress` → `Done` (or `Blocked` while a dependency is unmet). Keep this file updated as fixes land — it is part of the `docs/` single source of truth and linked from `INDEX.md`.
>
> **Status legend:** 🟥 Critical · 🟧 High · 🟨 Medium · 🟩 Low

---

## Critical Issues

Issues blocking production: broken flows, missing functionality, security concerns, missing authentication, missing backend logic.

---

### KI-001 — Authentication is not live (Supabase credentials missing)

- **Priority:** Critical
- **Area:** Authentication · Backend
- **Page / Route:** `/(auth)/*` (login, sign-up, create-account, forgot-password, password-reset, verify-email), `app/auth/callback`
- **Description:** All eight auth service functions (`loginWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `requestPasswordReset`, `updatePassword`, `resendVerificationEmail`, `getOwnProfile`, `logout`) and the OAuth/email callback handler are code-complete and correctly validated, but every call fails at runtime because `NEXT_PUBLIC_SUPABASE_URL` and the keys are placeholders.
- **Current Behavior:** `getSupabaseConfigState()` reports `missing`; login/signup/OAuth/reset return runtime errors; no session exists.
- **Expected Behavior:** Real Supabase project connected; all auth flows work end-to-end (email + Google/Facebook OAuth, password reset with the `dar-password-recovery` cookie flow).
- **Suggested Solution:** Phase 4 B1 — create the Supabase project, set env vars from `.env.example`, then B3 — verify each flow.
- **Dependencies:** B1, B3
- **Status:** Blocked
- **Assigned To:**
- **Notes:** The callback route (code exchange → `profiles` upsert → role-aware redirect → httpOnly recovery cookie) is already production-shaped and verified.

---

### KI-002 — Route protection is inert (middleware never mounted)

- **Priority:** Critical
- **Area:** Security · Backend · Routing
- **Page / Route:** `/dashboard`, `/owner`, `/admin`, `/traveler` (protected prefixes)
- **Description:** `updateSession()` in `lib/supabase/middleware.ts` implements the full protection logic (login redirects, role gates, session refresh), but no root `middleware.ts` exists and the function has zero references. Every protected route is publicly reachable.
- **Current Behavior:** `/owner`, `/admin`, `/traveler`, `/dashboard` render without authentication or role checks.
- **Expected Behavior:** Unauthenticated users redirected to `/login?redirectTo=…`; `/owner` requires `account_type = "owner"`; `/admin` bounces non-admins; sessions refresh via cookie proxying.
- **Suggested Solution:** Create root `middleware.ts` exporting `updateSession` with a matcher (Phase 4 B2). The dev-bypass branch works before credentials exist.
- **Dependencies:** B2 (full role enforcement needs B1)
- **Status:** Open
- **Assigned To:**
- **Notes:** This is the single highest-impact backend defect — dead code that is meant to be the app's main security layer.

---

### KI-003 — No database schema, migrations, or RLS policies

- **Priority:** Critical
- **Area:** Database · Security · Backend
- **Page / Route:** n/a (backend foundation)
- **Description:** Zero `.sql` files exist. The expected schema (10+ tables: `profiles`, `bookings`, `reviews`, `saved_properties`, `conversation_members`, `messages`, `notifications`, `payment_methods`, `support_tickets`, `support_ticket_messages`) is only inferred from query code.
- **Current Behavior:** No migrations to run; if Supabase went live today, tables would be unprotected (no RLS) and the anon key would expose all data.
- **Expected Behavior:** Versioned schema, RLS policies, seed data; generated TypeScript types.
- **Suggested Solution:** Phase 4 B1/B5 — write a `migration.sql` from the inferred schema with per-table RLS and the `profiles` trigger.
- **Dependencies:** B1
- **Status:** Blocked
- **Assigned To:**
- **Notes:** See `BACKEND_AUDIT.md` §4 for the inferred table/column inventory.

---

### KI-004 — Owner property submit API is unauthenticated and in-memory

- **Priority:** Critical
- **Area:** Security · Backend · Owner Portal
- **Page / Route:** `/api/owner/properties/[id]/submit`, `/owner/properties/[id]` (status polling)
- **Description:** `POST/PATCH /api/owner/properties/[id]/submit` has no authentication, no ownership check, no validation of `id` (POST ignores its body entirely). State lives in an in-memory `Map` that resets on server restart, and `GET` fabricates `pending_review` for unknown ids.
- **Current Behavior:** Any client can set any property id's status; statuses disappear on restart; a never-submitted property polls as `pending_review`, so "draft" and "missing" are indistinguishable.
- **Expected Behavior:** Authenticated, ownership-scoped, DB-backed status updates; honest `404`/`draft` for unknown properties; no state loss.
- **Suggested Solution:** Phase 4 B6 — replace with a DB-backed route or a zod-validated server action; remove the fabricated default.
- **Dependencies:** B1, B5
- **Status:** Open
- **Assigned To:**
- **Notes:** Groups the prior findings "in-memory state resets" + "GET fabricates pending_review" into one issue.

---

### KI-005 — Booking decision (Approve/Decline) is a no-op

- **Priority:** Critical
- **Area:** Owner Portal · Booking Flow
- **Page / Route:** `/owner/bookings/request-decision`, `/owner/bookings`
- **Description:** The Approve/Decline buttons in the booking request decision view navigate to the same page and never change the booking status (verified live).
- **Current Behavior:** Clicking either button appears to do nothing; the request stays in its original state; no server-side action exists.
- **Expected Behavior:** Approve → status `approved`; Decline → reason-capture flow → status `declined`; the owner bookings list reflects the change.
- **Suggested Solution:** Phase 2 F3 — add a server action that updates the booking status and revalidates the list.
- **Dependencies:** F3
- **Status:** Open
- **Assigned To:**
- **Notes:** There is no server-side booking-decision code anywhere in the repo.

---

### KI-006 — Add Property is a static mock

- **Priority:** Critical
- **Area:** Owner Portal
- **Page / Route:** `/add-property`, `/owner/properties/new/details`
- **Description:** The page renders a layout with **zero inputs** and **six inert buttons** (Save draft, Save & submit, etc.); `AddPropertyActions` (the component that implements draft-save + submit) exists but is never imported.
- **Current Behavior:** No form fields render, no handlers fire, no draft is saved.
- **Expected Behavior:** A working multi-step add-property form (details, photos, pricing) with draft save to localStorage and submit to the property API.
- **Suggested Solution:** Phase 2 F2 — wire `AddPropertyActions` into the page and build the real form.
- **Dependencies:** F2
- **Status:** Open
- **Assigned To:**
- **Notes:** Groups "static mock" + "unused AddPropertyActions" into one issue.

---

### KI-007 — No real owner dashboard (lands on the guest dashboard)

- **Priority:** Critical
- **Area:** Owner Portal · Public Website
- **Page / Route:** `/owner` (redirects to `/dashboard`)
- **Description:** `/owner` redirects to `/dashboard`, which renders the guest/traveler-flavored dashboard ("Ismail Negm — Guest") with guest widgets. Owners have no dashboard.
- **Current Behavior:** Owners see guest data and guest navigation; dashboard widgets don't map to owner pages.
- **Expected Behavior:** An owner dashboard with properties, booking requests, messages, pending verification, recent reviews, and upcoming payout widgets — each connected to the matching owner page.
- **Suggested Solution:** Phase 2 F1 — build the real owner dashboard and change the redirect.
- **Dependencies:** F1
- **Status:** Open
- **Assigned To:**
- **Notes:** The redirect to `/dashboard` matches Renad's original behavior; the fix is a new page, not a routing change.

---

### KI-008 — Eight traveler server actions lose data in dev mode

- **Priority:** Critical
- **Area:** Traveler Portal · Backend
- **Page / Route:** `/traveler/bookings`, `/traveler/profile`, `/traveler/payments`, `/traveler/messages`, saved toggle
- **Description:** Of the 20 traveler server actions, 8 have Supabase branches but **no devStore fallback**: `cancelBooking`, `toggleSavedProperty`, `sendConversationMessage`, `deleteConversationMessage`, `updateTravelerProfile`, `addPaymentMethod`, `setDefaultPaymentMethod`, `removePaymentMethod`.
- **Current Behavior:** In the dev-bypass preview these actions return a success `ActionResult` but persist nothing — the change disappears on refresh.
- **Expected Behavior:** Either devStore mutations mirroring the existing patterns (as notifications/reviews/support already do), or an explicit "unavailable in preview" message.
- **Suggested Solution:** Add dev branches to the 8 actions (mirror `devMarkNotificationRead` pattern).
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:** See `FUNCTIONAL_AUDIT.md` §8.4 for the exact action-by-action table.

---

### KI-009 — Cross-portal data inconsistency (four mock datasets)

- **Priority:** Critical
- **Area:** Backend · Shared Components
- **Page / Route:** all portals
- **Description:** Marketplace (`lib/dar-data.ts`), owner (local arrays), traveler (`devData.ts`), and admin (per-module `.data.ts`) use four independent datasets with no shared identity; many pages hardcode their own arrays inline.
- **Current Behavior:** The same property appears differently per portal; a booking created in the flow doesn't appear in owner bookings; a review in traveler doesn't appear in owner reviews; dashboard shows different persona data than owner pages.
- **Expected Behavior:** One canonical data source (shared mock module now, database later) consumed consistently.
- **Suggested Solution:** Phase 3 U4 (unify mock data) → Phase 4 B5 (replace with DB).
- **Dependencies:** U4, B5
- **Status:** Open
- **Assigned To:**
- **Notes:** This is the root cause of most cross-page inconsistency findings.

---

## High Priority

Broken navigation, pages not connected, buttons without actions, forms not saving, placeholder components.

---

### KI-010 — ~29 dead `href="#"` links across the app

- **Priority:** High
- **Area:** Routing · Owner Portal · Admin Portal · Public Website
- **Page / Route:** `/(dashboard)/dashboard` (6), `/landing-page` host section (~8 incl. footer social), admin overview/reports/properties cards (8), `/add-property` (3), `/owner/properties/new/photos` (2)
- **Description:** Verified ~29 anchor/`ButtonLink` elements with `href="#"` render no destination.
- **Current Behavior:** Clicking them does nothing (page jumps to top).
- **Expected Behavior:** Each links to a real route or is removed.
- **Suggested Solution:** Dead-link sweep per Phase 2 F7; route each to its logical destination (admin "View all" → module pages, host-landing CTAs → marketplace/owner pages).
- **Dependencies:** F7
- **Status:** Open
- **Assigned To:**
- **Notes:** Full inventory in `UI_AUDIT.md` §7.

---

### KI-011 — No mobile navigation on OwnerShell pages

- **Priority:** High
- **Area:** Owner Portal
- **Page / Route:** `/owner/*` (OwnerShell layout)
- **Description:** The owner sidebar is hidden below 900px (`max-[900px]:hidden`) with no replacement navigation.
- **Current Behavior:** On tablet/mobile, owner pages have no way to navigate between sections.
- **Expected Behavior:** A mobile drawer/bottom nav equivalent to the Traveler layout.
- **Suggested Solution:** Phase 2 F4 — add a mobile nav to `OwnerShell`.
- **Dependencies:** F4
- **Status:** Open
- **Assigned To:**
- **Notes:** Verified live during the Owner Portal audit.

---

### KI-012 — Payouts date-range filter doesn't filter

- **Priority:** High
- **Area:** Owner Portal
- **Page / Route:** `/owner/payouts`
- **Description:** The date range lives in state (`date`, `applied.date`) but is never used in the filter predicate.
- **Current Behavior:** Selecting a date range changes the displayed label but not the payout list.
- **Expected Behavior:** The list filters by the selected range.
- **Suggested Solution:** Phase 2 F5 — apply the date predicate.
- **Dependencies:** F5
- **Status:** Open
- **Assigned To:**
- **Notes:** The search/status/method filters do apply; only the date filter is inert.

---

### KI-013 — Message quick-reply chips don't populate the composer

- **Priority:** High
- **Area:** Owner Portal
- **Page / Route:** `/owner/messages`
- **Description:** The quick-reply chips ("I'll confirm", etc.) render with no click handler.
- **Current Behavior:** Clicking a chip does nothing.
- **Expected Behavior:** Clicking inserts the chip text into the message composer.
- **Suggested Solution:** Phase 2 F6.
- **Dependencies:** F6
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-014 — Contact form submits nowhere

- **Priority:** High
- **Area:** Public Website
- **Page / Route:** `/contact`
- **Description:** The contact form has no backend, no server action, and no submission feedback.
- **Current Behavior:** Submitting the form has no effect.
- **Expected Behavior:** Submission is handled (API/mail) with success/error feedback, or the form is explicitly marked as demo.
- **Suggested Solution:** Wire a server action or mark as placeholder; keep in sync with the Help Center (`/help`).
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-015 — Checkout receipt upload and promo code are visual-only

- **Priority:** High
- **Area:** Booking Flow
- **Page / Route:** `/checkout`
- **Description:** The receipt upload and promo-code fields render but do not validate or submit; only the booking submission writes state (sessionStorage `dar-pending-booking`).
- **Current Behavior:** Uploaded receipts and promo codes are ignored; payment verification is simulated.
- **Expected Behavior:** Upload works (storage), promo codes validate, payment verification is real.
- **Suggested Solution:** Phase 4 B9 — payment integration; Phase 4 B8 — file storage.
- **Dependencies:** B8, B9
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-016 — Saved vs Favorites state divergence

- **Priority:** High
- **Area:** Public Website · Routing
- **Page / Route:** `/saved`, `/favorites`
- **Description:** Two saved-properties pages with independent sources: `/saved` reads `dar-saved-<slug>` localStorage; `/favorites` renders its own static list.
- **Current Behavior:** Toggling a property in one page doesn't update the other; the two lists diverge.
- **Expected Behavior:** One canonical saved-properties store shared by both routes.
- **Suggested Solution:** Unify under the `dar-saved-*` key (or the traveler saved store) and alias one route.
- **Dependencies:** U4
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-017 — Marketplace search filters not fully wired to results

- **Priority:** High
- **Area:** Public Website
- **Page / Route:** `/search`
- **Description:** The search header updates URL params and the search card renders, but filters (price, type, rating) only partially affect the results grid.
- **Current Behavior:** Changing some filters doesn't change the displayed results; wiring is incomplete.
- **Expected Behavior:** Search query + all filters consistently filter the result set.
- **Suggested Solution:** Complete the filter → results pipeline in Phase 3 U4.
- **Dependencies:** U4
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-018 — Booking guest/payment details lack field-level validation

- **Priority:** High
- **Area:** Booking Flow
- **Page / Route:** `/booking/*`, `/checkout`
- **Description:** `flow-guards.ts` validates that booking data is present, but guest-detail and payment fields are not validated before confirm.
- **Current Behavior:** Empty/malformed guest or payment input can proceed to confirmation.
- **Expected Behavior:** Field-level validation (name, email, phone, dates) with inline errors.
- **Suggested Solution:** Reuse the traveler zod validation patterns; add validation to the guest/payment steps.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-019 — Owner edit-property edits are not consistently persisted

- **Priority:** High
- **Area:** Owner Portal
- **Page / Route:** `/owner/properties/[id]/edit`
- **Description:** The edit page renders tabbed panels, but field-level changes are not all wired to a save action that persists.
- **Current Behavior:** Some tab edits are visual-only and lost on navigation.
- **Expected Behavior:** Every tab's changes persist via Save (localStorage now, DB later).
- **Suggested Solution:** Phase 2 — wire each tab's fields to the save action.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-020 — Owner verification form lacks field validation

- **Priority:** High
- **Area:** Owner Portal
- **Page / Route:** `/owner/verification`
- **Description:** Save/submit writes the draft to localStorage (`dar-owner-verification`) without per-field validation; only an empty-state check toasts "complete the highlighted requirements."
- **Current Behavior:** Invalid values (e.g. malformed IBAN/phone) are accepted and saved.
- **Expected Behavior:** Required-field and format validation per step, with clear errors.
- **Suggested Solution:** Add validation to the verification form; surface errors inline.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-021 — Admin Console is read-only (no CRUD, no moderation actions)

- **Priority:** High
- **Area:** Admin Portal
- **Page / Route:** `/admin/*` (overview, properties, users, bookings, reports)
- **Description:** All five admin modules are view + in-memory filter only. No add/edit/delete on users or properties, no booking/report actions, no status changes; "View all" links are dead.
- **Current Behavior:** Admin can look at mock data but cannot act on it.
- **Expected Behavior:** User management (create/edit/suspend), property moderation (approve/reject), booking and report actions.
- **Suggested Solution:** Phase 5 — admin server actions + forms; wire the module links.
- **Dependencies:** B5 (DB), F7 (links)
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-022 — Property status is not reflected in any owner UI

- **Priority:** High
- **Area:** Owner Portal · Backend
- **Page / Route:** `/owner/properties`, `/owner/dashboard` (planned), property-status page
- **Description:** `dar-owner-property-status:<id>` is written (only for property id 1) by AddPropertyActions/publish, but no owner listing or dashboard consumes it.
- **Current Behavior:** A submitted property doesn't change badge/state anywhere owners can see.
- **Expected Behavior:** Status store drives listing badges, dashboard widgets, and the property-status page consistently.
- **Suggested Solution:** Phase 2 F1 + U4 — centralize status state and consume it in listings.
- **Dependencies:** F1, U4
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-023 — Traveler preview placeholder toasts

- **Priority:** High
- **Area:** Traveler Portal
- **Page / Route:** `/traveler/saved`, `/traveler/bookings/[id]`, `/traveler/notifications`, `/traveler/messages`
- **Description:** Several actions surface explicit "local preview placeholder" toasts: Saved properties ("Filters preview", "Map preview"), Booking details ("Manage booking"), Notifications ("Notification settings").
- **Current Behavior:** Buttons fire an info toast instead of doing the action.
- **Expected Behavior:** Real behavior once the underlying data/backend exists.
- **Suggested Solution:** Track in Phase 3/4; remove toasts as wiring lands.
- **Dependencies:** Phase 3/4 backend items
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

## Medium Priority

Hover inconsistencies, responsive issues, missing loading states, missing empty/error states, design inconsistencies.

---

### KI-024 — Modals lack Escape / outside-click close and focus management

- **Priority:** Medium
- **Area:** Owner Portal · Shared Components
- **Page / Route:** owner verification, photos, payouts method modal
- **Description:** Owner dialogs use ad-hoc state toggles; no Esc-key, backdrop-click, focus trap, or `role="dialog"` handling (verified in audit).
- **Current Behavior:** Keyboard users cannot close dialogs; focus is not contained.
- **Expected Behavior:** Consistent accessible modal behavior.
- **Suggested Solution:** Phase 2 F9 — a shared modal primitive (or Radix Dialog).
- **Dependencies:** F9
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-025 — Native `window.prompt`/`confirm` used on owner pages; no real date picker

- **Priority:** Medium
- **Area:** Owner Portal
- **Page / Route:** `/owner/properties/[id]/seasonal-pricing`, `/owner/properties/new/photos`, `/owner/properties/[id]/rejected`
- **Description:** Price edits use `window.prompt()`; destructive actions use `window.confirm()`; date inputs have no proper date picker.
- **Current Behavior:** Crude native dialogs, no validation (NaN/empty accepted), blocking UX.
- **Expected Behavior:** In-app inline editors, confirmation modal, real date picker with validation.
- **Suggested Solution:** Phase 2 F9/F10.
- **Dependencies:** F9, F10
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-026 — Hover states inconsistent across portals

- **Priority:** Medium
- **Area:** Design System · Shared Components
- **Page / Route:** global
- **Description:** Cards, buttons, menu items, and table rows use different hover treatments per portal (some have none; owner uses `hover:bg-[#faf8ff]`, marketplace/admim differ).
- **Current Behavior:** Visual feedback varies arbitrarily between sections.
- **Expected Behavior:** A consistent hover vocabulary (color, elevation, transition).
- **Suggested Solution:** Define hover tokens in the design system (U2/U3).
- **Dependencies:** U2, U3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-027 — Responsive gaps on admin and marketplace pages

- **Priority:** Medium
- **Area:** Admin Portal · Public Website · Booking Flow
- **Page / Route:** `/admin/*`, marketplace gallery/search, `/booking/*` state pages
- **Description:** Owner and traveler shells have responsive layouts, but admin tables/workspaces and several marketplace/booking pages were not verified below desktop; some use fixed-width grids.
- **Current Behavior:** Potential horizontal scroll / cramped layouts on tablet and mobile.
- **Expected Behavior:** Verified desktop/tablet/mobile behavior on every page.
- **Suggested Solution:** Responsive pass per section during restoration (Phase 1 sprints).
- **Dependencies:** Phase 1
- **Status:** Open
- **Assigned To:**
- **Notes:** Owner mobile navigation (no nav at all) is tracked separately as KI-011 (High).

---

### KI-028 — Missing loading states on most pages

- **Priority:** Medium
- **Area:** Performance · Shared Components
- **Page / Route:** owner, booking, marketplace pages
- **Description:** Pages render mock data synchronously with no loading UI; only the traveler portal uses skeletons/`LoadingRows`.
- **Current Behavior:** No feedback during navigation or future async fetches.
- **Expected Behavior:** Consistent `loading.tsx`/skeleton states once data becomes async.
- **Suggested Solution:** Add skeletons when Phase 4 B5 makes data async; reuse `system-states` primitives.
- **Dependencies:** B5
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-029 — Missing error states and error boundaries

- **Priority:** Medium
- **Area:** Shared Components · Backend
- **Page / Route:** booking flow, owner pages, API failures
- **Description:** Few error boundaries exist; some failures fail silently (e.g. submit API fetch, localStorage parse errors, devStore corrupted file is silently reseeded).
- **Current Behavior:** Failures produce no visible error state or misleading "pending" status.
- **Expected Behavior:** Error boundaries per portal + toast/error UI on failed actions.
- **Suggested Solution:** Add error boundaries and surface action errors (the `system-states` kit already has `ErrorStateCard`).
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:** Empty-state usage is largely covered (marketplace `EmptySearchState`, owner reviews, traveler `EmptyState`); focus this issue on errors.

---

### KI-030 — Four purple color families drift from the design tokens

- **Priority:** Medium
- **Area:** Design System
- **Page / Route:** global
- **Description:** `#5522d9` (owner), `#6C3DFF` (marketplace), `#5F36E9` (hotels/checkout), `#5631d8` (`--brand`), plus host-landing `#7c4dff`/`#7e40ff` coexist.
- **Current Behavior:** Brand shades vary by section; token adoption is inconsistent.
- **Expected Behavior:** One token set; restored pages stay visually identical.
- **Suggested Solution:** Phase 3 U2 — adopt tokens without changing restored visuals.
- **Dependencies:** U2
- **Status:** Open
- **Assigned To:**
- **Notes:** `--brand` is `#5631d8`; owner's restored family is intentionally different for now.

---

### KI-031 — Logo duplication (component + wrappers + raw assets)

- **Priority:** Medium
- **Area:** Design System · Shared Components
- **Page / Route:** global headers/footers
- **Description:** Unified `DarLogo` (`components/brand/dar-logo.tsx`) plus two backward-compat wrappers (traveler `DarLogo`, auth `BrandLogo`), plus raw `<Image src="/dar-logo-purple-header.png">` in ~9 files and alternate assets (`/dar-logo.svg`, `/assets/images/dar-logo.png`).
- **Current Behavior:** Logo rendering is fragmented across at least three paths; asset fixes must be applied in multiple places.
- **Expected Behavior:** One `DarLogo` component used everywhere.
- **Suggested Solution:** Phase 3 U1 — replace raw usages, delete wrappers.
- **Dependencies:** U1
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-032 — Three icon systems coexist

- **Priority:** Medium
- **Area:** Design System · Shared Components
- **Page / Route:** global
- **Description:** `@/components/ui` `*Icon` barrel (60+ consumers, marked "new code should import from lucide-react"), `lucide-react` direct (58 files), and the owner custom `Icon` component + inline SVGs.
- **Current Behavior:** Inconsistent icons, sizes, and stroke weights across portals; two sources for the same icon.
- **Expected Behavior:** One icon system (lucide-react direct).
- **Suggested Solution:** Phase 3 U3 — migrate, then remove the shim and duplicate sets.
- **Dependencies:** U3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-033 — Toast system duplicated (shared + 5 local implementations)

- **Priority:** Medium
- **Area:** Shared Components
- **Page / Route:** owner verification, payouts, publish, public-owner-profile, booking-flow, request-received
- **Description:** Shared `useToast`/`ToastProvider` exists and the traveler portal uses it; owner and booking pages implement local `setToast`/`notify()`/`toastOpen` state with different timings and styles.
- **Current Behavior:** Inconsistent toast UX (different durations, appearance, API).
- **Expected Behavior:** Single `useToast` everywhere.
- **Suggested Solution:** Phase 3 U5.
- **Dependencies:** U5
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-034 — No rate limiting / brute-force protection on auth forms

- **Priority:** Medium
- **Area:** Security · Authentication
- **Page / Route:** `/(auth)/*`
- **Description:** No app-side rate limiting or lockout on login/signup/reset submissions (Supabase provides some protections once configured).
- **Current Behavior:** Unlimited auth attempts in the current build.
- **Expected Behavior:** Rate limiting / exponential backoff once auth is live.
- **Suggested Solution:** Rely on Supabase protections + add app-side throttling (Phase 4).
- **Dependencies:** B1, B3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-035 — Dev auth bypass flag is client-visible (`NEXT_PUBLIC`)

- **Priority:** Medium
- **Area:** Security · Authentication
- **Page / Route:** `/traveler/*`, `/api/dev/traveler/reset`
- **Description:** `NEXT_PUBLIC_DEV_AUTH_BYPASS` is exposed to the client, though it's double-gated server-side by `NODE_ENV === "development"` in both consumers, and the reset API returns 404 when off.
- **Current Behavior:** Not exploitable outside dev today, but the flag ships in the client bundle.
- **Expected Behavior:** Server-only gating; bypass removed before production (Phase 4 B7).
- **Suggested Solution:** Remove with the dev bypass at B7; keep the `NODE_ENV` gate until then.
- **Dependencies:** B7
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-036 — Hardcoded 2026 demo dates and values

- **Priority:** Medium
- **Area:** Booking Flow · Public Website · Backend
- **Page / Route:** `/booking/*`, `/checkout`, `/hotels/*`, `/(dashboard)/dashboard`, users workspace
- **Description:** ~12 files default dates like `"2026-05-20"`; the invoice number is a literal (`INV-2026-58291`); `REFERENCE_DATE = new Date("2026-07-22T12:00:00Z")` anchors admin mock data; localStorage key strings are scattered.
- **Current Behavior:** Demo dates age; booking flow and invoices will show stale dates over time.
- **Expected Behavior:** Dynamic defaults (today ± n), generated invoice ids, centralized constants.
- **Suggested Solution:** Extract to `lib/utils/date.ts` + constants; generate invoice ids.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:** See `TECHNICAL_DEBT.md` §4 for the full inventory.

---

### KI-037 — Large single-file client components hurt bundle/hydration

- **Priority:** Medium
- **Area:** Performance
- **Page / Route:** `/checkout` (~700 lines), `/booking/booking-flow` (~830), `/(dashboard)/dashboard`, `/owner/payouts`
- **Description:** Several pages are monolithic `"use client"` components with no lazy sections or memoization.
- **Current Behavior:** Large initial JS and long hydration on those routes.
- **Expected Behavior:** Server components where possible, `next/dynamic` for heavy sections, `useMemo` on list renders.
- **Suggested Solution:** Split during Phase 3 (after restoration is approved).
- **Dependencies:** Phase 3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-038 — Admin/owner tables filter without debounce

- **Priority:** Medium
- **Area:** Performance · Admin Portal · Owner Portal
- **Page / Route:** `/admin/users`, `/admin/properties`, `/admin/reports`, `/owner/payouts`
- **Description:** `updateFilter` re-renders entire tables on every keystroke; no debounce or memoization.
- **Current Behavior:** Keystroke-per-render of large lists.
- **Expected Behavior:** Debounced search + memoized filtered rows.
- **Suggested Solution:** Debounce input and `useMemo` the filtered list.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-039 — Calendar view toggles are incomplete

- **Priority:** Medium
- **Area:** Owner Portal
- **Page / Route:** `/owner/properties/[id]/calendar-management`
- **Description:** Calendar view switching (month/week/day/list) does not fully re-render the data per view.
- **Current Behavior:** Toggle state changes but the grid/data doesn't consistently follow.
- **Expected Behavior:** Each view renders its own grid and data.
- **Suggested Solution:** Phase 2 F8.
- **Dependencies:** F8
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

## Low Priority

Minor UI polish, animation improvements, icon inconsistencies, spacing adjustments.

---

### KI-040 — Minor icon inconsistencies (weights, sizes, duplication)

- **Priority:** Low
- **Area:** Design System
- **Page / Route:** owner pages, admin cards, marketplace
- **Description:** Mixed stroke weights (1.8 vs default), inline SVGs next to lucide icons, and size variations for the same icon name across pages.
- **Current Behavior:** Subtle visual inconsistency in iconography.
- **Expected Behavior:** Consistent icon weights and sizes.
- **Suggested Solution:** Apply during U3 icon migration.
- **Dependencies:** U3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-041 — Inline styles with hardcoded px values

- **Priority:** Low
- **Area:** Design System · Owner Portal
- **Page / Route:** `/landing-page`, `/(dashboard)/dashboard`, owner pages
- **Description:** ~40 `style={{…}}` usages (e.g. `fontSize: 9`, `height: 46`) bypass Tailwind classes.
- **Current Behavior:** Values can't be themed; awkward to maintain.
- **Expected Behavior:** Tailwind classes / tokens.
- **Suggested Solution:** Convert during U2/U3.
- **Dependencies:** U2, U3
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-042 — Dead code: empty barrel + unused component

- **Priority:** Low
- **Area:** Shared Components
- **Page / Route:** `components/forms/index.ts`, `components/owner/add-property-actions.tsx`
- **Description:** `components/forms/index.ts` is literally `export {};` with zero imports; `AddPropertyActions` is exported with zero imports (the add-property page never renders it).
- **Current Behavior:** Dead code in the tree (and the unused component will be wired per KI-006).
- **Expected Behavior:** Empty barrel deleted; component wired or removed.
- **Suggested Solution:** Phase 3 U6 cleanup; F2 decides the component's fate.
- **Dependencies:** F2, U6
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-043 — Stub READMEs (Supabase + route groups)

- **Priority:** Low
- **Area:** Backend · Shared Components
- **Page / Route:** `lib/supabase/README.md`, `app/(auth)/README.md`, `app/(dashboard)/README.md`, `app/(public)/README.md`
- **Description:** The Supabase README says helpers "will be added here when…" (they exist); route-group READMEs are empty stubs.
- **Current Behavior:** Misleading/inert documentation.
- **Expected Behavior:** Accurate pointers to `docs/` or removal.
- **Suggested Solution:** Update or delete; point to `docs/INDEX.md`.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-044 — External runtime dependency on flagcdn.com

- **Priority:** Low
- **Area:** Performance · Authentication
- **Page / Route:** auth country selector (`CountrySelect.tsx`)
- **Description:** Country flags load from `https://flagcdn.com/w40/…` at runtime.
- **Current Behavior:** Runtime network dependency; broken offline / in CI; extra requests.
- **Expected Behavior:** Bundled or self-hosted flags.
- **Suggested Solution:** Download flag set into `public/` or use a bundled flag component.
- **Dependencies:** none
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

### KI-045 — No automated test suite

- **Priority:** Low
- **Area:** Backend
- **Page / Route:** n/a
- **Description:** No test script or test framework is configured; no CI gates.
- **Current Behavior:** Regressions are only caught by typecheck/lint/manual checks.
- **Expected Behavior:** Unit tests for utils/validation + component smoke tests; CI runs typecheck, lint, tests.
- **Suggested Solution:** Phase 5 P7 — vitest/Playwright scaffold + CI workflow.
- **Dependencies:** P7
- **Status:** Open
- **Assigned To:**
- **Notes:**

---

## Summary Table

| Category | Total Issues |
|---|---|
| **Critical** | 9 |
| **High** | 14 |
| **Medium** | 16 |
| **Low** | 6 |
| **Total** | **45** |

---

*Maintained as part of the DAR documentation set (linked from `INDEX.md`). Issue IDs are stable — reuse them when referencing a known issue in PRs, commits, or other docs. Update status as fixes land; move nothing to Done without verifying it in the code.*
