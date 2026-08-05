# FUNCTIONAL AUDIT — DAR App

> **Scope:** Every page and interaction across the four portals (Marketplace, Booking, Traveler, Owner, Admin) + shared infrastructure.
> **Method:** Static code analysis (searches for `fetch`, storage access, CRUD functions, `alert/confirm/prompt`, empty handlers, `href="#"`) cross-referenced with live browser verification performed during the Owner Portal audit.
> **Status legend:** 🔴 Broken / 🔴 High · 🟠 Partial / Medium · 🟡 Minor / Low · 🟢 Working
> **Priority note:** This document is the *analysis*. Fixes are scoped in `PROJECT_ROADMAP.md` (Phase 2, F1–F11; Phase 4, B1–B9). **Nothing here is fixed yet.**

---

# 0. Evidence Base (how findings were verified)

| # | Evidence | Source |
|---|---|---|
| E1 | Only **2 API routes** exist: `POST /api/owner/properties/[id]/submit` (in-memory) and `POST /api/dev/traveler/reset` | `app/api/` tree |
| E2 | **5 `fetch` call sites** in the app: owner submit ×4, auth OAuth preflight ×1 | code search |
| E3 | **~30 `localStorage`/`sessionStorage` key usages** across 12 files (see §8) | code search |
| E4 | **~29 `href="#"` dead links** (see §2) | code search, `-g *.tsx` |
| E5 | **20 traveler server actions**, all zod-validated, dual-path (Supabase OR devStore) — but **8 of them have no dev-mode fallback** (see §8.4) | `features/traveler/actions.ts` |
| E6 | **8 auth service functions** fully wired to Supabase but **not live** (env placeholders) | `features/authentication/services/authService.ts` |
| E7 | `alert/confirm/prompt` used in **3 owner pages** (see §1.5) | code search |
| E8 | Zero literally-empty `onClick={() => {}}` handlers found; broken buttons are **missing** handlers or wrong handlers (not empty ones) | code search |
| E9 | Live-verified Owner Portal behaviors (approve/decline no-op, static add-property, guest-dashboard redirect) | prior Owner Portal audit |

---

# 1. Broken Buttons

| Page | Component | Problem | Expected | Priority |
|---|---|---|---|---|
| `/owner/bookings` request-decision | **Approve / Decline** | Buttons navigate to the same page; booking status never changes (verified live) | Approve → status `approved`; Decline → rejection reason flow + status `declined` | 🔴 High |
| `/add-property` | **6 action buttons** (Save draft, Save & submit, etc.) | Page is a static mock: **0 inputs, 0 handlers, 0 localStorage writes**. Buttons render but do nothing | Buttons should drive the real add-property flow (draft save → submit → status) | 🔴 High |
| `/owner/payouts` | **Date-range filter buttons** | `date` lives in state but is never used in the filter predicate — buttons don't filter | Filter list by selected range | 🟠 Medium |
| `/owner/messages` | **Quick-reply chips** ("I'll confirm", etc.) | Chips don't populate the composer | Clicking a chip inserts its text into the message box | 🟠 Medium |
| `/owner/dashboard` (real one) | Dashboard widgets | No real owner dashboard exists — `/owner` redirects to the **guest** dashboard (see §6.1) | Owner dashboard with live widgets | 🔴 High |
| Admin overview/reports/properties | **"View all" links** | `href="#"` (user-signups, top-properties, recent-bookings, 5 report cards) | Deep-link to the relevant admin module | 🟡 Low |
| `/landing-page` (host) | **View all ×2, View payouts, View documents, 3 CTAs** | All `href="#"` | Link to marketplace/owner destinations | 🟠 Medium |
| `app/(dashboard)/dashboard` | **~6 action links** (View all, settings shortcuts) | `href="#"` (lines 140–413) | Wire to real routes | 🟠 Medium |
| Marketplace hero/search | **Search card CTA** | Card renders; wiring of filters → results is incomplete (see §7.5) | Filters update the results grid | 🟠 Medium |

**Not broken (verified working):** Auth submit buttons (validated + error-mapped), traveler action buttons (server actions return toast results), booking flow continue/back buttons, save/favorite toggles, photos add/remove (removal uses confirm — see §1.5), verification save/submit (localStorage).

---

# 2. Broken Links

| Page | Link(s) | Problem | Expected | Priority |
|---|---|---|---|---|
| Global | **~29 `href="#"` links** | Dead links across dashboard (6), host-landing (~8), admin cards (8), add-property (3), photos (2) | Point to real routes or be removed | 🔴 High (sweep) |
| `/owner` | Redirect | Redirects to `/dashboard` — the **guest** dashboard, not an owner dashboard | Redirect to `/owner/dashboard` | 🔴 High |
| `/favorites` vs `/saved` | Two saved-properties pages | **Diverged state**: `/saved` reads `dar-saved-*` localStorage; `/favorites` is a separate static list. Toggling one doesn't update the other | Single source of truth for saved properties | 🟠 Medium |
| `/contact`, `/help` | Form submit + support links | Forms have no backend; support links may be visual-only | Wire to messages/help center or mark as placeholders | 🟠 Medium |
| Owner sidebar → help | **Support center** | `app/add-property` sidebar link is `href="#"` | Route to `/owner/help` or `/help` | 🟡 Low |

**Not broken (verified working):** owner sidebar items map to real routes via `lib/owner-routes.ts`; marketplace nav; traveler shell nav (all 5 bottom items + drawer).

---

# 3. Missing Interactions

| Page | Component | Problem | Expected | Priority |
|---|---|---|---|---|
| Owner pages | **Modals/dialogs** (verification, photos, confirm actions) | No **Escape-key** or **outside-click** close handling (verified in audit; `window.confirm` used instead) | Consistent modal a11y (Esc, backdrop click, focus trap) | 🟠 Medium |
| `/owner/calendar` | **View toggles** (month/week/list) | View switching incomplete / not reflected in data | Toggle actually re-renders the calendar grid | 🟠 Medium |
| `/owner/properties/[id]/seasonal-pricing` | **Edit price** | Uses `window.prompt()` for base price and season price edits (crude, no validation) | Inline editable inputs with validation | 🟠 Medium |
| `/owner/properties/new/photos` | **Delete photo** | Uses `window.confirm()` (blocking, non-stylable) | In-app confirmation modal | 🟡 Low |
| `/owner/properties/[id]/edit` | **Tabs** | Tabs switch panels (structure exists); field-level edits not all persisted | Every tab's changes persist via Save | 🟠 Medium |
| Marketplace search | **Filters** (price, type, rating) | Filters partially affect results; search card wiring incomplete (see §7.5) | All filters + search query filter the result set | 🟠 Medium |
| Admin tables | **Row actions** | Rows are read-only; no row-click detail panel on most modules (users has a detail panel) | Consistent row interactions across modules | 🟡 Low |
| Owner add-property | **Step sidebar** | Step items render but are static (page is a mock) | Steps navigate between form sections | 🔴 High (with §1) |
| Traveler notifications | **Mark-all-read, delete** | Work in dev mode (devStore) — ✅ working | — | 🟢 |
| Booking flow | **Guards** | `flow-guards.ts` blocks missing state and redirects — ✅ working | — | 🟢 |

---

# 4. Missing Forms

| Page | Form | Problem | Expected | Priority |
|---|---|---|---|---|
| `/add-property` | Property creation | **Zero inputs rendered** — the page is a static mock with only buttons | Full add-property form (title, location, price, amenities, photos…) | 🔴 High |
| `/owner/properties/[id]/edit` | Property edit | Panels exist but edits are not consistently validated/persisted | Editable, validated, persisted form per tab | 🟠 Medium |
| `/contact` | Contact form | Submits nowhere (no API, no toast) | Handle submission (toast + mail/API) or label as demo | 🟠 Medium |
| `/checkout` | Receipt upload / promo code | Receipt upload and promo code are visual-only; only the booking submission is real (sessionStorage) | Wire upload + promo validation | 🟠 Medium |
| `/help` | Search / ticket form | Search is visual-only; support flows live only in Traveler | Wire search or link to traveler support | 🟡 Low |
| Admin | **No forms at all** | Users/properties modules are view+filter only — no create/edit dialogs | Add/edit user + property status forms | 🟠 Medium |
| Auth | Login/Sign-up/reset | ✅ Complete forms with inline validation, error mapping, loading states | — | 🟢 (not live, see §8.5) |
| Traveler | Profile/payments/review/ticket | ✅ Complete forms wired to server actions | — | 🟢 (dev-gap, see §8.4) |

---

# 5. Missing Validation

| Page | Component | Problem | Expected | Priority |
|---|---|---|---|---|
| `/owner/properties/publish` | Publish form | `fetch` POST fires without field-level validation of the submitted payload | Validate required listing fields before submit | 🟠 Medium |
| `/owner/verification` | Document form | Save/submit writes localStorage without field validation (only empty-state toasts) | Required-field validation per step | 🟠 Medium |
| `/owner/properties/new/photos` | Photo upload | No file-type/size validation | Validate images client-side | 🟡 Low |
| `/owner/properties/[id]/seasonal-pricing` | Price edits | `prompt()` accepts `NaN`/empty/negative — no validation | Constrain to positive numbers | 🟠 Medium |
| `/booking` guest info | Checkout form | Guards validate *presence* of booking data (✅), but guest-details fields are not validated before "Confirm" | Field-level validation (name, email, phone) | 🟠 Medium |
| `/checkout` | Payment details | Card/promo fields are visual-only — no format validation | Format + required checks | 🟠 Medium |
| Traveler | All actions | ✅ **zod schemas** (`validation.ts`): booking cancel, review, profile, payment, support | — | 🟢 |
| Auth | All forms | ✅ `authValidation.ts` + service-level checks | — | 🟢 |

---

# 6. Missing Navigation

| Page | Component | Problem | Expected | Priority |
|---|---|---|---|---|
| `/owner` | Root redirect | Lands on **guest dashboard** (verified: "Ismail Negm — Guest") | Own owner dashboard | 🔴 High |
| Dashboard (guest) | Widget destinations | Booking requests / messages / verification / reviews / payouts / property widgets do **not** map to owner pages (they're guest widgets) | Owner widgets → owner pages | 🔴 High |
| Admin modules | "View all" | `href="#"` | Route to module detail pages | 🟡 Low |
| `/add-property` | Sidebar step navigation | Static — no step movement | Steps advance the form | 🔴 High (with §1/§4) |
| Booking flow | Back/continue | ✅ Working (guards + sessionStorage) | — | 🟢 |
| Traveler | Sidebar/drawer/bottom-nav | ✅ All items route correctly | — | 🟢 |
| Marketplace | Property → booking | ✅ Booking card seeds sessionStorage and routes into `/booking` flow | — | 🟢 |
| Owner | Breadcrumbs | Present on several pages ("Back to properties") — ✅ working where rendered | — | 🟢 |

---

# 7. Missing State

| Page | Component | Problem | Expected | Priority |
|---|---|---|---|---|
| `/saved` vs `/favorites` | Saved state | Two independent lists; localStorage key `dar-saved-*` is read by `/saved` and property-details toggle, but `/favorites` uses its own data | One canonical saved store | 🟠 Medium |
| `/owner` dashboard | Property status | `dar-owner-property-status:1` exists for property **id 1 only**; status changes (pending_review) don't propagate to any owner UI | Status store drives dashboard + listings badges | 🟠 Medium |
| `/owner/payouts` | Date filter | `date` in state but unused in predicate | Filter applies | 🟠 Medium |
| Booking confirm | Status write | Confirmed booking writes status via localStorage but no owner-facing list reflects it | Owner booking list reads the same state | 🟠 Medium |
| Owner verification | Progress | Verification draft saved to localStorage; dashboard/verification progress not derived from it | Progress reflects saved draft | 🟡 Low |
| Marketplace search | Query params | URL params update; results grid partially reactive | All filters + query → filtered results | 🟠 Medium |
| Auth | Session state | **No mounted middleware** (`lib/supabase/middleware.ts` unused — 0 references), no session provider; auth state doesn't gate routes | Mount middleware + session context (Phase 4, B2) | 🔴 High (blocked on backend) |

---

# 8. Missing Data Flow

## 8.1 Storage key inventory (verified — E3)

| Key | Owner | Used by | Persistence |
|---|---|---|---|
| `dar-owner-add-property-draft` / `dar-owner-property-draft` | Owner | `AddPropertyActions` (unused component) | localStorage |
| `dar-owner-property-status:<id>` | Owner | `AddPropertyActions`, publish, confirmed | localStorage (id 1 only) |
| `dar-seasonal-pricing:<id>` | Owner | seasonal pricing page | localStorage |
| `dar-owner-verification` | Owner | verification page | localStorage |
| `dar-saved-<slug>` | Marketplace | property-details toggle + `/saved` | localStorage |
| `dar-pending-booking` | Booking | checkout, hotels, booking flow | **sessionStorage** |
| booking state keys | Booking | rooms / request-received / pending pages | sessionStorage |

## 8.2 Data source divergence

| Concern | Finding | Priority |
|---|---|---|
| Mock data sources | Marketplace (`lib/dar-data.ts`), owner (own arrays), traveler (`devData.ts`), admin (per-module `.data.ts`) are **4 separate datasets** with no shared identity — same property appears differently per portal | 🔴 High (Phase 3, U4) |
| In-memory API | `/api/owner/properties/[id]/submit` holds state in memory — **resets on server restart**; also called via GET (`cache: "no-store"`) in `property-status.tsx` which is an odd use of a POST endpoint | 🟠 Medium |
| Cross-page consistency | Booking created in flow doesn't appear in owner bookings; review in traveler doesn't appear in owner reviews | 🔴 High (Phase 3, U4) |

## 8.3 Owner flows (data flow present but limited)

| Flow | Data flow | Status |
|---|---|---|
| Property publish | POST → in-memory API → status localStorage | 🟡 works only in-session |
| Verification | localStorage save/submit | 🟡 works, no downstream consumers |
| Seasonal pricing | localStorage save → back to edit | 🟢 works locally |
| Booking decision | approve/decline → **no state change** | 🔴 broken |

## 8.4 Traveler dev-mode gap (verified — E5) — 🔴 HIGH

The 20 server actions are dual-path (Supabase OR devStore). **8 have no dev fallback** — in dev-bypass mode they `return ok(...)` but **nothing persists** (data resets on refresh):

| Action | Supabase branch | Dev-store branch |
|---|---|---|
| `cancelBooking` | ✅ update | ❌ **none** |
| `toggleSavedProperty` | ✅ insert/delete | ❌ **none** |
| `sendConversationMessage` | ✅ insert | ❌ **none** |
| `deleteConversationMessage` | ✅ update | ❌ **none** |
| `updateTravelerProfile` | ✅ update | ❌ **none** |
| `addPaymentMethod` | ✅ insert | ❌ **none** |
| `setDefaultPaymentMethod` | ✅ update | ❌ **none** |
| `removePaymentMethod` | ✅ delete | ❌ **none** |
| Notifications (5 actions) | ✅ | ✅ devStore |
| Reviews (3 actions) | ✅ | ✅ devStore |
| Support tickets (3 actions) | ✅ | ✅ devStore |
| `markConversationRead` | ✅ | ✅ devStore |

**Impact:** in the current dev-bypass preview, cancelling a booking, editing profile, adding a payment method, or sending a message shows a success toast but the change disappears on refresh.

## 8.5 Auth not live (verified — E6) — 🔴 HIGH (backend gate)

`authService.ts` implements login, signup, OAuth, password reset/update, verify resend, profile fetch, logout — all correctly error-mapped — but **Supabase env vars are placeholders** (`NEXT_PUBLIC_SUPABASE_URL` empty), so every auth call fails at runtime. OAuth also performs a `fetch` preflight of the provider authorize URL (E2). This is a **Phase 4 (B1–B2)** dependency, not a code bug.

---

# 9. Missing CRUD Operations

| Domain | Create | Read | Update | Delete | Notes |
|---|---|---|---|---|---|
| **Traveler** | ✅ tickets, reviews, payments, messages | ✅ queries | ✅ profile, review, ticket status | ✅ notifications, reviews, payments, messages | Full CRUD; dev-gap only (§8.4) |
| **Owner properties** | ❌ (add-property is a static mock) | ✅ list/detail (mock) | 🟡 edit page partial | ❌ no archive/delete | Phase 2 F2 |
| **Owner bookings** | — | ✅ list | ❌ approve/decline no-op | — | Phase 2 F3 |
| **Owner verification** | 🟡 draft/submit to localStorage | ✅ status card | 🟡 edit draft | ❌ | — |
| **Admin users** | ❌ no add-user form | ✅ table + filters | ❌ no edit | ❌ no delete/suspend | Phase 5 |
| **Admin properties** | — | ✅ table | ❌ no status change | ❌ | — |
| **Admin bookings/reports/overview** | — | ✅ read-only | ❌ | ❌ | Decorative "View all" (§2) |
| **Marketplace saved** | ✅ toggle → `dar-saved-*` | ✅ `/saved` reads key | — | ✅ toggle off | Duplicate with `/favorites` (§7) |
| **Auth profile** | ✅ signup | ✅ `getOwnProfile` | ✅ update (via traveler) | — | Not live (§8.5) |

---

# 10. Consolidated Page Status

| Area | Buttons | Links | Interactions | Forms | Validation | Nav | State | Data flow | CRUD |
|---|---|---|---|---|---|---|---|---|---|
| Marketplace (13 pages) | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 | 🟢 | 🟠 | 🟠 | 🟡 |
| Booking flow (7 pages) | 🟢 | 🟢 | 🟢 | 🟠 | 🟠 | 🟢 | 🟠 | 🟠 | — |
| Auth (6 pages) | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴* | 🔴* | 🟡 |
| Traveler (12 pages) | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟠 | 🟠 | 🟢 |
| Owner (20 pages) | 🔴 | 🟠 | 🟠 | 🔴 | 🟠 | 🔴 | 🟠 | 🟠 | 🟠 |
| Admin (5 modules) | 🟡 | 🟡 | 🟡 | 🟠 | 🟢 | 🟡 | 🟠 | 🔴 | ❌ |
| Landing / support pages | 🟠 | 🟠 | 🟡 | 🟡 | 🟢 | 🟢 | 🟢 | 🟡 | — |

\* Auth is functionally complete but **blocked** on real Supabase credentials (Phase 4).

---

# 11. Priority Summary

## 🔴 High (fix first — Phase 2 Sprint 1.2 / F1–F7)
1. Real owner dashboard (kill the guest-dashboard redirect) — §6.1
2. Add Property: replace static mock with working form + wiring — §1, §4, §6
3. Approve/Decline booking decisions actually change status — §1, §8.3
4. Dead-link sweep (~29 `href="#"`) — §2
5. Traveler dev-mode persistence for the 8 action gaps — §8.4
6. Cross-portal data-source unification — §8.2
7. Mount Supabase middleware + real credentials (backend gate) — §7, §8.5

## 🟠 Medium
- Payouts date filter, messages quick-chips, calendar view toggles — §1/§3
- Modal a11y (Esc/outside-click), `prompt()` → inline editing — §3
- Booking guest-details + checkout validation — §5
- Saved/favorites unification, status propagation — §7
- Admin CRUD forms — §9

## 🟡 Low
- Decorative admin "View all" links, contact/help wiring, photo upload validation, breadcrumb polish — §2/§4/§5

---

*Audit date: Aug 2026 · Companion docs: `UI_AUDIT.md` (visual), `PROJECT_ROADMAP.md` (fix plan), `FEATURES_DOCUMENTATION.md` (feature inventory).*
