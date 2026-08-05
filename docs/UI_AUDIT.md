# DAR App — UI_AUDIT.md

> **Per-page UI audit.** Every page in the app, assessed on: **Current status, Missing UI, Broken UI, Responsive issues, Design System issues, Priority.**
>
> Evidence: full code reads of every route, live preview testing (desktop + 708px mobile viewport), and cross-page data/design checks. No fixes applied — this is the report.
>
> **Status legend:** 🟢 Good · 🟡 Partial · 🔴 Broken/placeholder. **Priority:** 🔴 High · 🟠 Medium · 🟡 Low.
>
> Companion docs: `PROJECT_CONTEXT.md`, `FEATURES_DOCUMENTATION.md`, `DEVELOPMENT_RULES.md`, and the **Owner Portal Functional Audit** (deeper functional detail for owner pages).

---

## Table of Contents

1. [Public Marketplace](#1-public-marketplace)
2. [Booking Flow](#2-booking-flow)
3. [Authentication](#3-authentication)
4. [Traveler Dashboard](#4-traveler-dashboard)
5. [Owner Portal](#5-owner-portal)
6. [Admin Console](#6-admin-console)
7. [Global / Cross-Page](#7-global--cross-page)
8. [Priority Summary](#8-priority-summary)

---

# 1. Public Marketplace

## 1.1 Homepage `/`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Visually polished; hero, search card, tabs, destinations, recommendations, footer all render |
| **Missing UI** | Search card is non-functional (selecting city/dates/guests does not navigate to results); no "skip to results" anchor target; recommendation cards not linked to detail pages |
| **Broken UI** | Several "See all"/arrow links are `href="#"` (dead); property-type tab labels are visual only |
| **Responsive** | 🟡 Hero collapses gracefully (44→43px headline, search card stacks) but hero min-height is fixed (`min-h-[680px]`) causing tall empty space on mid screens; no sticky nav on mobile scroll |
| **Design System** | 🟡 Uses `#6C3DFF`/`#5A30E8`/`#7C5CFF` inline purples that do **not** match `--brand` (`#5631d8`) or owner palette (`#5522d9`) — 3 brand purples in the app |
| **Priority** | 🟠 Medium — visual fine; wire search card + unify purple |

## 1.2 Search Results `/search`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Functional filters/sort/grid on mock data; mobile filter modal + map toggle exist |
| **Missing UI** | No pagination control; map panel is a static visual (no tiles/geo); no result count on mobile toolbar |
| **Broken UI** | "Map view" toggle shows a placeholder panel; some filter chips update state but not the map |
| **Responsive** | 🟢 Good breakpoints: desktop sidebar filters, mobile bottom modal (`lg:hidden`), results grid collapses |
| **Design System** | 🟡 Same non-token purple family; custom `SearchPropertyCard` duplicates `PropertyStayCard` styling |
| **Priority** | 🟠 Medium |

## 1.3 Property Details `/properties/[slug]` + `/stays/[slug]`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Rich, complete page (header, gallery, booking card, amenities, host bar, reviews, similar, location, mobile booking bar) |
| **Missing UI** | No sticky price bar on desktop; reviews section has no rating breakdown bars; no photo count badge on hero |
| **Broken UI** | Save/heart may use a different storage key than `/saved` page (`dar-saved-<slug>` vs favorites `FAVORITES_KEY`) — heart state can disagree across pages |
| **Responsive** | 🟢 Excellent: `MobileBookingBar` (`lg:hidden`), mobile gallery (`md:hidden`), stacked layout |
| **Design System** | 🟡 Token divergence (see 1.1); `BookingCard` + `MobileBookingBar` duplicate pricing logic |
| **Priority** | 🟠 Medium (fix save-state consistency) |

## 1.4 Property Gallery `/stays/[slug]/gallery`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Category tabs, thumbnail strip, highlights, sidebar, room coverage all work |
| **Missing UI** | No lightbox/fullscreen viewer beyond hero; report-photo form has no success state |
| **Broken UI** | "Report photo" opens a form that doesn't submit anywhere |
| **Responsive** | 🟢 Sidebar collapses on mobile (`md:hidden`); grid reflows |
| **Design System** | 🟡 Same purple drift |
| **Priority** | 🟡 Low |

## 1.5 Hotels `/hotels` + `/hotels/[slug]`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Clean listing page (first-card image is `loading="eager"` — LCP clean); detail page functional |
| **Missing UI** | No hotel filters (stars/area/price); no amenity legend; header "Saved" is a bare text+icon with no link/state |
| **Broken UI** | Header "Saved" element is inert; nav "Short stays" duplicates "Rent" |
| **Responsive** | 🟢 Cards 3→2→1 cols; header nav hides below lg with no mobile menu fallback on this page |
| **Design System** | 🟡 `#5F36E9` is a **fourth** purple variant used here |
| **Priority** | 🟠 Medium |

## 1.6 Saved Properties `/saved`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Works — live-updates via `useSyncExternalStore` + localStorage, has empty state |
| **Missing UI** | No "remove" button on saved cards (must unsave from detail page); no count in header nav |
| **Broken UI** | None |
| **Responsive** | 🟢 Grid 3→2→1; header nav hides on mobile |
| **Design System** | 🟡 Same purple drift |
| **Priority** | 🟡 Low |

## 1.7 Favorites `/favorites`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Functional (separate localStorage `FAVORITES_KEY`) |
| **Missing UI** | Duplicate of `/saved` with a **different storage key** — two systems, potentially inconsistent hearts |
| **Broken UI** | None per-page |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Duplicated page concept |
| **Priority** | 🟠 Medium — consolidate with `/saved` |

## 1.8 Share (modal, no route)

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Native share + clipboard with fallbacks |
| **Missing UI** | No success animation beyond text; no QR option |
| **Broken UI** | None |
| **Responsive** | 🟢 Sheet on mobile (`md:hidden` grabber), modal on desktop |
| **Design System** | 🟡 Purple drift |
| **Priority** | 🟡 Low |

## 1.9 Legal Center `/legal`, `/legal/[slug]`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Complete: search, accordions, scroll-spy sidebar, policy cards, FAQ |
| **Missing UI** | None significant |
| **Broken UI** | None |
| **Responsive** | 🟢 Sidebar → mobile sections (`lg:hidden`) |
| **Design System** | 🟡 Purple drift |
| **Priority** | 🟡 Low |

## 1.10 Help Center `/help`

| Field | Assessment |
|---|---|
| **Current status** | 🟡 Search box renders; content is a single static card |
| **Missing UI** | No article list, no categories, no contact CTA; search likely doesn't filter (visual only) |
| **Broken UI** | Search input has no result behavior |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Sparse vs the rich legal hub |
| **Priority** | 🟠 Medium |

## 1.11 Contact `/contact`

| Field | Assessment |
|---|---|
| **Current status** | 🟡 Form with client validation, **no submit handler** (no success/error state after submit) |
| **Missing UI** | Success screen, map, contact details aside |
| **Broken UI** | Submit button does nothing functional |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Purple drift |
| **Priority** | 🟠 Medium |

## 1.12 About `/about`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Static content page |
| **Missing UI** | — |
| **Broken UI** | — |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Purple drift |
| **Priority** | 🟡 Low |

## 1.13 Become a Host `/become-a-host` (host-landing-page)

| Field | Assessment |
|---|---|
| **Current status** | 🟡 Dense marketing page; **many dead links** (`View all` ×2, `View payouts`, `View documents`, 3 CTA buttons, all footer/social links `href="#"`) |
| **Missing UI** | CTA cards don't link to `/add-property` consistently |
| **Broken UI** | 8+ `href="#"` links (live code search) |
| **Responsive** | 🟢 Stacks well |
| **Design System** | 🟡 Uses tiny inline `style={{fontSize:9…}}` overrides — inconsistent with class-based typography |
| **Priority** | 🟠 Medium — wire the CTAs |

## 1.14 Supporting Pages `/rent`, `/buy`, `/new-projects`, `/messages`, `/landing-page`, `/system-states`, `/not-found`

| Page | Status | Missing UI | Broken UI | Responsive | DS | Priority |
|---|---|---|---|---|---|---|
| **Rent** `/rent` | 🟢 Property grid from shared `resultProperties`, links to detail pages | Filters/sort; no results count | None | 🟢 3→2→1 cols; header nav hides on mobile | 🟡 `#5F36E9` + `dar-logo-purple-header.png` | 🟡 Low |
| **Buy** `/buy` | 🟢 Intentional "Coming soon" page with Contact-sales `mailto:` | None (scope is waiting for inventory) | None | 🟢 | 🟡 same purple/logo | 🟡 Low |
| **New Projects** `/new-projects` | 🟢 3 project cards with `mailto:` register-interest | Project detail pages; interest form (email only) | None | 🟢 | 🟡 same purple/logo | 🟡 Low |
| **Messages** `/messages` | 🟢 Clean empty state with Email-support + WhatsApp `mailto:`/wa.me links | Real conversation UI (deferred; traveler messages exist instead) | None | 🟢 | 🟡 same purple/logo | 🟡 Low |
| **Landing Page** `/landing-page` | 🟡 Duplicate of `/become-a-host` (re-exports `HostLandingPage`) — two URLs for one page | — | 8+ `href="#"` links (shared with host-landing, see 1.13) | 🟢 | 🟡 | 🟠 Medium (deduplicate route) |
| **System States preview** `/system-states` | 🟢 Dev showcase of empty/error/loading/toast components | — | None | 🟢 | 🟢 (uses system-states kit) | 🟡 Low |
| **Not Found** `/not-found` | 🟢 Custom 404 with search field | — | Search field has no handler | 🟢 | 🟡 purple drift | 🟡 Low |

---

# 2. Booking Flow

## 2.1 Booking Guest Info `/booking`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Multi-step flow with validation and guards |
| **Missing UI** | No progress stepper visible on the guest step (steps exist in checkout only) |
| **Broken UI** | None significant |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Own icon set in `booking/hotel/shared.tsx` duplicates the global `Icon` component |
| **Priority** | 🟡 Low |

## 2.2 Checkout `/checkout`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Full review page: order summary, promo code, receipt upload, verification status + timeline, submit action |
| **Missing UI** | "Change details" button has no handler; promo "Apply" validates nothing; receipt fields are pre-filled read-only-looking inputs |
| **Broken UI** | Change details / Apply / Contact support are inert |
| **Responsive** | 🟢 Sticky sidebar on xl; stacks below |
| **Design System** | 🟡 Third inline icon map; `#5F36E9` purple |
| **Priority** | 🟠 Medium |

## 2.3 Confirmed / Pending / Failed / Cancelled / Request-received / Invoice `/booking/*`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 All state pages render with content + actions |
| **Missing UI** | Cancelled page has a feedback modal (works); invoice is printable text |
| **Broken UI** | State transitions rely entirely on `sessionStorage` — a refresh mid-flow can strand a user (guards redirect, but with confusing jumps) |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Purple drift across all |
| **Priority** | 🟡 Low (UX robustness 🟠) |

## 2.4 Room Selection `/booking/rooms` + Hotel Guest/Payment

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Room cards with expand, image indexes, selection state |
| **Missing UI** | No room comparison; hotel guest form is separate from apartment guest form (duplicated UX) |
| **Broken UI** | None significant |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Duplicated hotel/apartment flow styling |
| **Priority** | 🟡 Low |

## 2.5 My Bookings `/bookings`, `/bookings/[id]`

| Field | Assessment |
|---|---|
| **Current status** | 🟡 Shows only the **single session booking**; empty state is good |
| **Missing UI** | No booking list/history, no filters, no invoice link from the card |
| **Broken UI** | "View details" is a styled span, not a link (whole card is the link — ok but misleading visually) |
| **Responsive** | 🟢 |
| **Design System** | 🟡 Purple drift |
| **Priority** | 🟠 Medium |

---

# 3. Authentication

## 3.1 Login `/login`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Polished split-screen with validation |
| **Missing UI** | OAuth buttons present but will fail until Supabase is configured (see FEATURES_DOCUMENTATION §3) |
| **Broken UI** | Submit works client-side only; no backend session yet |
| **Responsive** | 🟢 Split shell collapses to single column |
| **Design System** | 🟢 Uses its own `AuthSplitShell` + `BrandLogo` (a **third logo** — unification pending) |
| **Priority** | 🟠 Medium (blocked by backend, not UI) |

## 3.2 Sign Up `/sign-up`, Create Account `/create-account`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Both forms full-featured (account type selector, country+phone picker, password strength) |
| **Missing UI** | None significant |
| **Broken UI** | None (validation complete) |
| **Responsive** | 🟢 |
| **Design System** | 🟢 + BrandLogo note |
| **Priority** | 🟡 Low |

## 3.3 Forgot / Reset / Verify `/forgot-password`, `/password-reset`, `/verify-email`

| Field | Assessment |
|---|---|
| **Current status** | 🟢 Cards + heroes with validation |
| **Missing UI** | Password-reset and verify depend on Supabase email links (unusable until backend) |
| **Broken UI** | None per-page |
| **Responsive** | 🟢 |
| **Design System** | 🟢 |
| **Priority** | 🟡 Low |

---

# 4. Traveler Dashboard

**Shell (`TravelerLayout`)** is the **best-designed responsive shell in the app**: desktop sidebar (292px), mobile drawer with overlay, 5-item bottom nav with safe-area padding, reactive unread badges (contexts), logout states. 🟢

| Page | Status | Missing UI | Broken UI | Responsive | DS | Priority |
|---|---|---|---|---|---|---|
| **4.1 Dashboard** `/traveler/dashboard` | 🟢 | None significant | None | 🟢 | 🟢 tokens (`dar-*`) | 🟡 Low |
| **4.2 Bookings** `/traveler/bookings` | 🟢 | None (search + stats + tabs) | None | 🟢 | 🟢 | 🟡 Low |
| **4.3 Booking Details** `/traveler/bookings/[id]` | 🟢 | Actions marked as "local preview placeholder" toast | Cancel flow is a placeholder | 🟢 | 🟢 | 🟠 Medium |
| **4.4 Messages** `/traveler/messages` | 🟢 | Real-time typing/read receipts | Conversations are local-only (no backend) | 🟢 | 🟢 | 🟡 Low |
| **4.5 Notifications** `/traveler/notifications` | 🟢 | Push/email integration | Mark-read works via dev store only | 🟢 | 🟢 | 🟡 Low |
| **4.6 Payments** `/traveler/payments` | 🟢 | Real payment methods | Mock transactions | 🟢 | 🟢 | 🟡 Low |
| **4.7 Profile** `/traveler/profile` | 🟢 | — | Saves to dev store (not prod) | 🟢 | 🟢 | 🟡 Low |
| **4.8 Settings** `/traveler/settings` | 🟢 | — | Not persisted to Supabase | 🟢 | 🟢 | 🟡 Low |
| **4.9 Reviews** `/traveler/reviews` | 🟢 | Rating breakdowns | Submit works in dev store | 🟢 | 🟢 | 🟡 Low |
| **4.10 Saved** `/traveler/saved` | 🟢 | "Map view" is a placeholder toast | Saved list from dev store | 🟢 | 🟢 | 🟡 Low |
| **4.11 Support** `/traveler/support` | 🟢 | — | Ticket create/reply works in dev store | 🟢 | 🟢 | 🟡 Low |
| **4.12 Ticket Details** `/traveler/support/tickets/[id]` | 🟢 | — | Same dev-store caveat | 🟢 | 🟢 | 🟡 Low |

**Global traveler notes:** the `dar-*` design tokens (navy/primary/muted/border) are used consistently — this section is the **design-system reference implementation**. Main gap is backend persistence, not UI.

---

# 5. Owner Portal

*Full functional detail in the Owner Portal Functional Audit; this is the UI-focused view.*

| Page | Status | Missing UI | Broken UI | Responsive | DS | Priority |
|---|---|---|---|---|---|---|
| **5.1 `/owner` → `/dashboard`** | 🔴 **Wrong page** | No owner dashboard exists — lands on the guest/traveler dashboard (Ismail Negm) | Redirect to guest dashboard | 🟡 traveler shell is fine but wrong persona | 🟡 two systems | 🔴 High |
| **5.2 My Properties** `/owner/properties` | 🟡 | Only 1 property card (rejected Zamalek); no active/pending list, no filters, no grid | Both card actions → same `/rejected` URL | 🟡 **No mobile nav** (sidebar hidden <900px, no fallback) | 🟡 owner inline hex (intentional, restored) | 🔴 High |
| **5.3 Property Status** `/owner/properties/[id]` | 🟢 | — | Polls in-memory API; shows same property for any id | 🟡 no mobile nav | 🟡 | 🟠 Medium |
| **5.4 Edit Property** `/owner/properties/[id]/edit` | 🟢 | Pricing tab navigates away (no inline pricing panel) | None; saves to localStorage | 🟡 no mobile nav; mobile tab labels awkward | 🟡 | 🟠 Medium |
| **5.5 Photo Uploader** `/owner/properties/[id]/photos` + `/new/photos` | 🟢 | Sort-by dropdown dead; per-card "..." dead; tips links `href="#"` | Delete confirm uses `window.confirm` | 🟢 grid 4→3→4; mobile actions present | 🟡 | 🟠 Medium |
| **5.6 Publish** `/owner/properties/[id]/publish` | 🟢 | Schedule dialog lacks Escape close | "Save changes" only stores preference | 🟢 mobile bottom nav + mobile checklist | 🟡 | 🟡 Low |
| **5.7 Rejected** `/owner/properties/[id]/rejected` | 🟢 | — | Links hardcode `/1/` paths (broken for other ids) | 🟢 | 🟡 | 🟠 Medium |
| **5.8 Calendar Management** `/owner/properties/[id]/calendar-management` | 🟢 | Week/Day/List views don't switch; property selector is a static box | Sync/Export are notice-only | 🟡 no mobile nav; day cells cramped | 🟡 | 🟠 Medium |
| **5.9 Availability Rules** `/owner/properties/[id]/availability-rules` | 🟢 | "Add rule" adds a fixed fake date (no date picker) | None | 🟢 accordions + mobile nav | 🟡 | 🟠 Medium |
| **5.10 Seasonal Pricing** `/owner/properties/[id]/seasonal-pricing` | 🟢 | — | Edit price uses `window.prompt` | 🟢 | 🟡 | 🟡 Low |
| **5.11 Booking Requests** `/owner/bookings` | 🟡 | Only 1 hardcoded request; no list/filters | — | 🟡 no mobile nav | 🟡 | 🟠 Medium |
| **5.12 Request Decision** `/owner/bookings/request-decision` | 🟡 | — | **Approve/Decline buttons navigate to the same page (no-op)**; quick-message chips don't insert text | 🟢 mobile nav | 🟡 | 🔴 High |
| **5.13 Payouts** `/owner/payouts` | 🟢 | — | Date filter doesn't filter; booking link → same generic page; modals lack Escape/outside-click + `role="dialog"` | 🟢 grids collapse; table scrolls | 🟡 | 🟠 Medium |
| **5.14 Reviews** `/owner/reviews` | 🟡 | Empty state only — no review list, no reply | — | 🟡 no mobile nav | 🟡 | 🟠 Medium |
| **5.15 Verification** `/owner/verification` | 🟢 | Readonly-looking fields (DoB, business name, tax ID) have no onChange | Ownership docs show "Uploaded" without files | 🟢 excellent 4→2→1 + vertical timeline | 🟡 | 🟠 Medium |
| **5.16 Settings** `/owner/settings` | 🟡 | Only 2 links; no account settings form | — | 🟡 no mobile nav | 🟡 | 🟡 Low |
| **5.17 Help Center** `/owner/help-center` | 🟡 | Single "Back to My Properties" button; active state says "Settings" | — | 🟡 no mobile nav | 🟡 | 🟡 Low |
| **5.18 Drafts** `/owner/properties/drafts` | 🟡 | Single draft row | — | 🟡 no mobile nav | 🟡 | 🟡 Low |
| **5.19 Add Property** `/add-property` | 🔴 **Static mock** | All fields are inert divs; all 6 buttons have no handlers; photos upload dead | Entire page is placeholder UI | 🟡 sidebar hides, no mobile nav | 🟡 | 🔴 High |
| **5.20 Public Owner Profile** `/owners/[ownerId]` | 🟢 | — | — | 🟢 | 🟡 | 🟡 Low |

**Owner UI cross-cutting:** restored `owner-*` classes are consistent (that's the restored original — do not touch); the gaps are **mobile navigation** (sidebar-only below 900px on shell pages), **dead interactive affordances**, and the **missing real dashboard**.

---

# 6. Admin Console

*Design-system reference is `features/design-system` + `sidebar`; uses `brand`/`foreground` tokens — internally consistent, but disconnected from the rest of the app.*

| Page | Status | Missing UI | Broken UI | Responsive | DS | Priority |
|---|---|---|---|---|---|---|
| **6.1 Overview** `/admin` | 🟢 | — | "View all" links `href="#"` (3 cards) | 🟡 grid collapses but dense on tablet | 🟢 internal tokens | 🟡 Low |
| **6.2 Properties** `/admin/properties` | 🟢 | — | Summary-card links `href="#"` (3); bulk actions are UI-only | 🟢 | 🟢 | 🟡 Low |
| **6.3 Users** `/admin/users` | 🟢 | — | None significant | 🟢 | 🟢 | 🟡 Low |
| **6.4 Bookings** `/admin/bookings` | 🟢 | — | None significant | 🟢 | 🟢 | 🟡 Low |
| **6.5 Reports** `/admin/reports` | 🟢 | — | "View all"/"View full report" links `href="#"` (5 cards); schedule/save reports are UI-only | 🟢 | 🟢 | 🟡 Low |

**Admin notes:** visually strong and internally consistent, but every "View all / View full report / Schedule / Save" affordance is decorative — no drill-down navigation. All data is mock.

---

# 7. Global / Cross-Page

| Issue | Detail | Priority |
|---|---|---|
| **4 brand-purple families** | `#6C3DFF/#5A30E8` (marketplace), `#5F36E9` (hotels/checkout), `--brand #5631d8` (tokens/admin), `#5522d9/#6c4cf5` (owner, restored) — the app has no single brand purple | 🔴 High (post-restoration unification) |
| **3 logo components** | `DarLogo` (components/brand), auth `BrandLogo` (features/authentication), traveler `DarLogo` (features/traveler) + header PNGs | 🟠 Medium |
| **2 icon systems** | Global `Icon` (components/host-landing/icons) + inline SVG maps in `booking/hotel/shared.tsx`, `app/checkout`, `app/bookings` + lucide-react in admin/traveler | 🟠 Medium |
| **2 toast systems** | `features/system-states` ToastProvider vs traveler `shared.tsx` showToast | 🟡 Low |
| **Dead `href="#"` inventory** | ~29 across app (dashboard ×6, host-landing ×8, admin overview/reports/properties ×11, add-property ×3, photos ×2) | 🔴 High (in aggregate) |
| **Inconsistent focus styles** | Marketplace has good `focus-visible:ring`; owner pages rely on browser default mostly | 🟡 Low |
| **Empty states** | Marketplace/booking/admin have good empty states; owner messages/reviews/settings/help are plain text cards with no illustration | 🟠 Medium |
| **Window.confirm/prompt** | Owner photo-delete (`confirm`), rejected discard (`confirm`), seasonal price edit (`prompt`) — inconsistent with styled modals elsewhere | 🟡 Low |
| **Button-style spans** | Some "links" are styled `<span>`/`<a href="#">` where real navigation should exist (bookings "View details", dashboard CTAs) | 🟠 Medium |

---

# 8. Priority Summary

### 🔴 High — fix first (Sprint 1.2 + quick wins)
1. **Owner dashboard** — replace the guest-dashboard redirect (5.1).
2. **Add Property form** — replace static mock (5.19).
3. **Approve/Decline decision** — wire the no-op buttons (5.12).
4. **Owner mobile navigation** — bottom nav for shell pages (5.x cross-cutting).
5. **Dead-link sweep** — remove/replace the ~29 `href="#"` links (7).
6. **Single brand purple decision** — document and adopt one token (7).

### 🟠 Medium
- Marketplace: wire homepage search card, save-state consistency between `/saved` & `/favorites`, contact form submit, help-center content.
- Owner: payouts date filter + modal a11y, calendar view switching, availability date picker, rejected-page dynamic ids, verification readonly fields.
- Checkout: wire "Change details"/"Apply"/support.
- Unify logos + icon systems (post-restoration).

### 🟡 Low
- All admin "View all" affordances, traveler placeholder actions, gallery lightbox, share QR, legal/help polish, `window.confirm` replacements.

---

*Generated August 2026. Re-audit affected pages after each restoration/fix; update statuses as sprints complete.*
