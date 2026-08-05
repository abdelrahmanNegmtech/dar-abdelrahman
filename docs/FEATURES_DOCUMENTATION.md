# DAR App — FEATURES_DOCUMENTATION.md

> Companion to `PROJECT_CONTEXT.md`. This document analyzes **every feature** in the DAR App codebase. Each feature entry covers: **Purpose, Routes, Components, Related files, Current implementation status, Missing functionality, Known issues, Dependencies, Future improvements**.
>
> **Status legend:** 🟢 Complete · 🟡 Partial / mock-data · 🔴 Not implemented / placeholder · ⚠️ Known issue

---

## Table of Contents

1. [Public Marketplace (Guest)](#1-public-marketplace-guest)
   - 1.1 Homepage · 1.2 Search & Filters · 1.3 Property Details · 1.4 Property Gallery · 1.5 Hotels · 1.6 Saved Properties · 1.7 Favorites · 1.8 Share · 1.9 Legal Center · 1.10 Help Center · 1.11 Contact · 1.12 About · 1.13 Become a Host
2. [Booking Flow](#2-booking-flow)
3. [Authentication](#3-authentication)
4. [Traveler Dashboard](#4-traveler-dashboard)
5. [Owner Portal](#5-owner-portal)
6. [Admin Console](#6-admin-console)
7. [Design System](#7-design-system)
8. [System States](#8-system-states)
9. [Cross-Cutting Infrastructure](#9-cross-cutting-infrastructure)
10. [Feature Dependency Map](#10-feature-dependency-map)

---

# 1. Public Marketplace (Guest)

**Owner of record:** Omar. **Status: 🟡** — visually rich and largely interactive, but all data is mock/hardcoded and several flows are placeholders.

## 1.1 Homepage

| Field | Detail |
|---|---|
| **Purpose** | Landing page: hero, search card, popular stays, destinations, host CTA, footer |
| **Routes** | `/` (`app/page.tsx`), `/landing-page` (alt landing) |
| **Components** | `HeroSection`, `HeroSearchCard`, `HeroFeatureBadges`, `PopularStaysSection`, `PopularDestinationsSection`, `DestinationCard`, `RecommendationsSection`, `RecommendationCard`, `HowItWorksSection`, `ProcessStepCard`, `HostCTASection`, `WhyBookSection`, `MarketplaceFeatureCard`, `PropertyTypeSelector`, `SectionHeader`, `MarketplaceNavbar`, `MarketplaceFooter`, `MarketplaceShell` |
| **Related files** | `features/public-marketplace/components/*`, `assets.ts` (image map), `app/home-client.tsx`, `app/page.tsx` |
| **Implementation status** | 🟡 Sections render with mock data; hero image uses `loading="eager"` (LCP warning fixed). Homepage search card is visual. |
| **Missing functionality** | Search card does not navigate to results; "See all" links partially dead; recommendation cards don't link to property pages |
| **Known issues** | Several `href="#"` links; hardcoded data arrays don't sync with property detail data |
| **Dependencies** | `components/host-landing/icons` (Icon), `assets.ts`, `next/image` |
| **Future improvements** | Wire search card → `/search`, connect recommendations to real property slugs, data from backend |

## 1.2 Search & Filters

| Field | Detail |
|---|---|
| **Purpose** | Find stays by location/dates/guests with filtering, sorting, map, results grid |
| **Routes** | `/search` (`app/(public)/search/page.tsx`) |
| **Components** | `SearchExperience`, `SearchHeader`, `ResultsToolbar`, `SearchResultsLayout`, `PropertyResultsGrid`, `SearchPropertyCard`, `FilterSidebar`, `SearchFiltersModal`, `MapPanel`, `SearchStatePanels` |
| **Related files** | `features/public-marketplace/search/components/*`, `search/data.ts`, `search/icons.ts` |
| **Implementation status** | 🟡 Functional client component (`"use client"`, Suspense-wrapped). Filters, sort, and grid state work on mock data (`search/data.ts`). |
| **Missing functionality** | Map panel is a visual placeholder; no real geo data; no pagination; URL params not fully synced |
| **Known issues** | Search only searches the mock dataset; results don't link to consistent detail pages |
| **Dependencies** | lucide-react icons, `next/image`, Icon component |
| **Future improvements** | Connect to real listing data, URL-param-driven state, real map provider, pagination |

## 1.3 Property Details

| Field | Detail |
|---|---|
| **Purpose** | Full property page: photos, amenities, booking card, host, reviews, location, similar stays |
| **Routes** | `/properties/[slug]` (`app/properties/[slug]/page.tsx` + `property-details.tsx`), `/stays/[slug]` |
| **Components** | `PropertyDetailsPage`, `PropertyHeader`, `PropertyGallery`, `BookingCard`, `AmenitiesGrid`, `HostSummaryBar`, `LocationSection`, `PropertyInfoCards`, `ReviewsSection`, `SimilarStaysSection`, `MobileBookingBar` |
| **Related files** | `features/public-marketplace/property-details/*`, `property-details/data.ts`, `property-details/icons.ts`, `app/properties/[slug]/property-data.ts` |
| **Implementation status** | 🟡 Rich detail page; booking card computes price from dates/guests locally; save-to-favorites writes localStorage |
| **Missing functionality** | Booking card doesn't create a real booking (only sessionStorage handoff); reviews are mock; location has no real map |
| **Known issues** | Two parallel data sources (`properties/[slug]/property-data.ts` vs marketplace `data.ts`) may diverge |
| **Dependencies** | Icon, next/image, `useFavorites`/saved localStorage helpers |
| **Future improvements** | Unify property data model; wire booking CTA → booking flow with proper guards |

## 1.4 Property Gallery

| Field | Detail |
|---|---|
| **Purpose** | Photo gallery with categories, tabs, highlights, report-photo, room coverage |
| **Routes** | `/stays/[slug]/gallery` |
| **Components** | `PropertyGalleryPage`, `HeroGalleryViewer`, `GalleryHeader`, `GalleryCategoryTabs`, `GalleryThumbnailStrip`, `PhotoGrid`, `PhotoCard`, `BrowseAllPhotosSection`, `GallerySidebar`, `GalleryInfoBanner`, `GalleryHighlights`, `GalleryNavigation`, `PropertySummaryCard`, `ReportPhotoCard`, `RoomCoverageCard` |
| **Related files** | `features/public-marketplace/property-gallery/*`, `data.ts` |
| **Implementation status** | 🟢 Category tabs, grid, highlights all functional on mock photo data |
| **Missing functionality** | Report-photo form is presentational; no lightbox beyond hero viewer |
| **Known issues** | Gallery data hardcoded per property; not shared with detail page |
| **Dependencies** | Icon, next/image |
| **Future improvements** | Lightbox viewer, real photo CDN, shared photo source |

## 1.5 Hotels

| Field | Detail |
|---|---|
| **Purpose** | Hotel listings with room-by-room choice (hotel stays vertical) |
| **Routes** | `/hotels` (`app/hotels/page.tsx`), `/hotels/[slug]` (`hotel-details-client.tsx`), `/booking/rooms` (room selection) |
| **Components** | Page-level: hotel cards (hero card uses `loading="eager"`), `HotelDetailsClient` |
| **Related files** | `app/hotels/*`, `app/booking/rooms/hotel-room-data.ts`, `app/booking/hotel/*` |
| **Implementation status** | 🟡 Listing works; details page is a client component; room selection flows into booking |
| **Missing functionality** | No real availability; no hotel search/filter |
| **Known issues** | Hotel data in `hotel-room-data.ts` is separate from marketplace data |
| **Dependencies** | `compactBookingQuery` (routing), next/image |
| **Future improvements** | Live availability, hotel filters, room images from backend |

## 1.6 Saved Properties

| Field | Detail |
|---|---|
| **Purpose** | "Save for later" list; heart toggle persists per property |
| **Routes** | `/saved` (`app/saved/page.tsx`), `/favorites` (alias) |
| **Components** | Page-level grid; heart buttons on property cards |
| **Related files** | `features/public-marketplace/favorites/*` (`useFavorites.ts`), `app/saved/page.tsx` |
| **Implementation status** | 🟢 Works — `useSyncExternalStore` + localStorage (`dar-saved-<slug>`) + cross-tab `storage` events |
| **Missing functionality** | No favorites count in navbar; no bulk actions |
| **Known issues** | Two implementations (`/saved` uses `dar-saved-*`, `/favorites` uses its own `useFavorites` key) — duplicate state |
| **Dependencies** | `useSyncExternalStore`, localStorage |
| **Future improvements** | Merge `/saved` and `/favorites`; sync with user account |

## 1.7 Favorites

| Field | Detail |
|---|---|
| **Purpose** | Heart-toggle favorites page |
| **Routes** | `/favorites` |
| **Components** | `FavoritesPage`, `useFavorites` hook |
| **Related files** | `features/public-marketplace/favorites/*` |
| **Implementation status** | 🟢 Functional (localStorage `FAVORITES_KEY`) |
| **Missing functionality** | Duplicate of `/saved` (see 1.6) |
| **Known issues** | Two separate saved-state systems — data not shared |
| **Dependencies** | localStorage |
| **Future improvements** | Consolidate with `/saved` |

## 1.8 Share

| Field | Detail |
|---|---|
| **Purpose** | Share property via native share, copy link, social grids |
| **Routes** | Used inside property/gallery pages (no standalone route) |
| **Components** | `ShareModal`, `ShareSheet`, `ShareActionButton`, `ShareActionGrid`, `SharePropertyPreview`, `ShareSuccessMessage`, `CopyLinkBox`; hooks `useShareModal`, `useClipboard`, `useNativeShare` |
| **Related files** | `features/public-marketplace/share/*`, `share/utils/shareUrls.ts` |
| **Implementation status** | 🟢 Client share flows functional (clipboard + native share with fallbacks) |
| **Missing functionality** | Share analytics; deep links may not resolve |
| **Known issues** | Minor |
| **Dependencies** | `navigator.share`/`clipboard`, Icon |
| **Future improvements** | Track shares; generate canonical share URLs |

## 1.9 Legal Center

| Field | Detail |
|---|---|
| **Purpose** | Legal/policy pages: terms, privacy, payments, cancellations with accordion + search |
| **Routes** | `/legal`, `/legal/[slug]` |
| **Components** | `LegalCenterPage`, `LegalSidebar`, `LegalSearch`, `LegalAccordion`, `LegalContent`, `LegalHero`, plus supporting parts: `AcceptanceChecklist`, `PaymentPolicy`, `PrivacyHighlights`, `CancellationOptions`, `FAQSection`, `TrustSidebar`, `SupportCard`, `PolicyStatus`, `QuickLinks`, `LanguageSelector`, `HighlightText`, `HelpCircleIcon`, `ActionButtons` |
| **Related files** | `features/public-marketplace/legal/*`, `data/legal.ts`, `data/faq.ts`, hooks `useAccordion`, `useLegalSearch`, `useScrollSpy` |
| **Implementation status** | 🟢 Fully built-out static legal hub with working search, accordions, scroll-spy |
| **Missing functionality** | Content is static copy; no versioning |
| **Known issues** | None significant |
| **Dependencies** | Icon, React state/hooks |
| **Future improvements** | CMS-driven content |

## 1.10 Help Center

| Field | Detail |
|---|---|
| **Purpose** | Guest-facing help with search |
| **Routes** | `/help` |
| **Components** | `HelpCenterPage` |
| **Related files** | `features/public-marketplace/help/components/HelpCenterPage.tsx` |
| **Implementation status** | 🟡 Search box present; content is static |
| **Missing functionality** | No article pages, no contact ticket |
| **Known issues** | Search may not filter content (visual only) |
| **Dependencies** | Icon |
| **Future improvements** | Article detail pages, ticket submission |

## 1.11 Contact

| Field | Detail |
|---|---|
| **Purpose** | Contact form with validation |
| **Routes** | `/contact` |
| **Components** | `ContactPage` + `Field` |
| **Related files** | `features/public-marketplace/contact/components/ContactPage.tsx` |
| **Implementation status** | 🟡 Form validates locally, **no submission handler** (no backend) |
| **Missing functionality** | Submit → email/ticket |
| **Known issues** | Errors only client-side |
| **Dependencies** | React state |
| **Future improvements** | Backend submission + success state |

## 1.12 About

| Field | Detail |
|---|---|
| **Purpose** | Company/about page |
| **Routes** | `/about` |
| **Components** | `AboutPage` |
| **Related files** | `features/public-marketplace/about/components/AboutPage.tsx` |
| **Implementation status** | 🟢 Static content |
| **Missing functionality** | — |
| **Known issues** | — |
| **Dependencies** | Icon, next/image |
| **Future improvements** | — |

## 1.13 Become a Host

| Field | Detail |
|---|---|
| **Purpose** | Host recruitment landing + quick add-property entry |
| **Routes** | `/become-a-host` |
| **Components** | `HostLandingPage` (`components/host-landing/host-landing-page.tsx`) |
| **Related files** | `components/host-landing/*` |
| **Implementation status** | 🟡 Marketing content present; CTA links to `/add-property` |
| **Missing functionality** | No application flow beyond linking |
| **Known issues** | — |
| **Dependencies** | `Icon`, DarLogo |
| **Future improvements** | Host application form |

---

# 2. Booking Flow

**Owner of record:** Menna. **Status: 🟡** — a real multi-step client flow with guards, persisted to `sessionStorage`; no backend payment.

| Field | Detail |
|---|---|
| **Purpose** | Complete guest booking: room → guest info → payment → checkout review → confirmation states; hotel variant with room selection |
| **Routes** | `/booking` (guest step), `/booking/payment`, `/booking/confirmed`, `/booking/cancelled`, `/booking/failed`, `/booking/pending`, `/booking/request-received`, `/booking/invoice`, `/booking/rooms`, `/booking/hotel/guest`, `/booking/hotel/payment`, plus `/checkout`, `/bookings`, `/bookings/[id]` |
| **Components** | `BookingFlowPage` (`booking-flow.tsx`), `requiredRedirectForStep` + guard helpers (`flow-guards.ts`), `StoredBooking` type, hotel `shared.tsx` (Icon/formatEgp/formatShortDate/paymentLabel), per-state pages (confirmed/cancelled/failed/pending/request-received/invoice), `hotel-room-data.ts` |
| **Related files** | `app/booking/*`, `app/checkout/page.tsx`, `app/bookings/*`, `app/routing.ts` |
| **Implementation status** | 🟡 Multi-step flow works client-side: guards redirect between steps, booking object persisted in `sessionStorage` (`dar-pending-booking`), step pages render confirmation/payment states, invoice page generates a printable invoice. `/checkout` is a full review page: order summary, promo code, receipt upload (with `receiptStatus`), payment-method-conditional verification status, and a `submitForVerification` action that writes the booking and redirects to `/booking/request-received` |
| **Missing functionality** | No real payment processor; booking not persisted server-side; no email confirmations; `/checkout` is a wrapper page |
| **Known issues** | Booking lives only in `sessionStorage` (lost on tab close); guards are client-only (bypassable); hotel vs apartment flows have parallel code paths; `/bookings` shows only the single session booking |
| **Dependencies** | `sessionStorage`, `next/navigation`, routing helpers (`compactBookingQuery`, `shortPath`) |
| **Future improvements** | Server persistence, real payment (Paymob/Fawry/Vodafone Cash integrations), email/SMS confirmations, unified hotel+apartment flow |

---

# 3. Authentication

**Owner of record:** Omar. **Status: 🟡** — full UI + Supabase service layer written; **not live** because Supabase env vars are placeholders (see §9).

| Field | Detail |
|---|---|
| **Purpose** | Login, sign-up (with account type + country/phone), create account, forgot/password reset, verify email, OAuth (Google/Facebook), session/profile management |
| **Routes** | `/login`, `/sign-up`, `/create-account`, `/forgot-password`, `/password-reset`, `/verify-email` (route group `app/(auth)/*`), `/auth/callback` (Supabase redirect handler) |
| **Components** | `LoginForm/LoginCard/LoginHero`, `SignUpForm/SignUpCard/SignUpHero`, `CreateAccountForm/CreateAccountPage/AccountTypeSelector`, `ForgotPasswordFlow/RequestCard/Hero`, `PasswordResetCard/Hero`, `VerifyEmailCard/Hero`, `SocialButtons`, `CountrySelect`, `AuthSplitShell`, `BrandLogo`, `PasswordRequirements/RequirementList`, `SecurityCard`, `EmailInformationCard`, `LanguageSelector`, `AuthNavAction` |
| **Related files** | `features/authentication/*` (components, `create-account/`, `data/countries.ts`, `services/authService.ts`, `authErrors.ts`, `authRedirects.ts`, `authValidation.ts`, `phoneUtils.ts`), `authTypes.ts` |
| **Implementation status** | 🟡 All forms validate locally (email/password/phone rules, password strength checklist). `authService.ts` implements Supabase email signup/login, OAuth with preflight redirect resolution, password reset/update, resend verification, profile fetch. Auth pages render without a backend (demo mode). |
| **Missing functionality** | Real Supabase project (env vars placeholder) → login/signup/OAuth **will not actually authenticate** until configured; no account_type-based profile creation beyond `user_metadata` |
| **Known issues** | Auth pages accessible without config and silently "fail" to session; `/auth/callback` assumes Supabase session exchange; password-reset page expects callback query params |
| **Dependencies** | `@supabase/supabase-js`, `@supabase/ssr`, `lib/supabase/client`, `lib/supabase/config`, `getSiteUrl`, react-hook-form (unused in some forms — custom state), countries dataset |
| **Future improvements** | Enable real Supabase, email verification flow polish, "remember me" session persistence tests, passwordless/OTP |

---

# 4. Traveler Dashboard

**Owner of record:** Menna. **Status: 🟡** — the most complete interactive feature; file-backed dev store + Supabase-aware queries; runs via dev auth bypass.

| Field | Detail |
|---|---|
| **Purpose** | Signed-in guest hub: dashboard, bookings, booking details + invoice, messages, notifications, payments, profile/settings, reviews, saved, support tickets |
| **Routes** | `/traveler`, `/traveler/dashboard`, `/traveler/bookings`, `/traveler/bookings/[bookingId]`, `/traveler/bookings/[bookingId]/invoice` (also a `route.ts`), `/traveler/messages`, `/traveler/notifications`, `/traveler/payments`, `/traveler/profile`, `/traveler/reviews`, `/traveler/saved`, `/traveler/settings`, `/traveler/support`, `/traveler/support/tickets/[ticketId]` |
| **Components** | `TravelerLayout` (shell with sidebar), `DashboardPage`, `BookingsPage`, `BookingDetailsPage`, `MessagesPage`, `NotificationsPage`, `PaymentsPage`, `ProfilePage`, `SettingsPage`, `ReviewsPage`, `SavedPropertiesPage`, `SupportPage`, `SupportTicketDetailsPage`, `shared.tsx` (inputs/buttons/toasts) |
| **Related files** | `features/traveler/*` (`actions.ts`, `brand.ts`, `types.ts`, `utils.ts`, `validation.ts`, `data/devData.ts`, `data/devStore.ts`, `data/queries.ts`), `app/traveler/layout.tsx` |
| **Implementation status** | 🟢🟡 **Most functional feature.** Server-side queries (`queries.ts`) fetch traveler data; **dev store** (`devStore.ts`) is a file-backed mutable store (in `os.tmpdir()/dar-traveler-e2e`) enabled only under the dev bypass, providing real interactions: mark notifications read/unread/delete, submit/edit/delete reviews, create/reply/close support tickets, mark conversations read. Pages have search, tabs, filters, toasts. Booking details invoice is a real `route.ts` download. |
| **Missing functionality** | Production persistence (file store is dev-only; prod falls back to read-only seed); no real messages to owners/guests (local conversation only); payments are mock transactions; settings/profile edits not persisted to Supabase when configured |
| **Known issues** | Runs only via `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` in dev (middleware exemption); invoice route is a stub/download; `BookingDetailsPage` has an explicit "local preview placeholder" action |
| **Dependencies** | `node:fs/os/path` (devStore), Supabase server client (when configured), `DEV_AUTH_BYPASS_USER`, `next/navigation` redirects |
| **Future improvements** | Move dev store to Supabase tables; real-time messaging; actual payment methods; notifications via push/email |

---

# 5. Owner Portal

**Owner of record:** Renad. **Status: 🟢 restored + audited** — byte-for-byte restored to the original implementation; **fixes from the audit are pending**.

| Field | Detail |
|---|---|
| **Purpose** | Host hub: properties, bookings decisions, calendar/availability, seasonal pricing, payouts, verification, messages, reviews, settings, help |
| **Routes** | `/owner` (→ redirects `/dashboard`), `/owner/properties`, `/owner/properties/drafts`, `/owner/properties/new/*`, `/owner/properties/publish`, `/owner/properties/[id]`, `/owner/properties/[id]/edit`, `.../photos`, `.../publish`, `.../rejected`, `.../calendar`, `.../calendar-management`, `.../seasonal-pricing`, `.../availability-rules`, `/owner/bookings`, `/owner/bookings/request-decision`, `/owner/payouts`, `/owner/reviews`, `/owner/verification`, `/owner/settings`, `/owner/help-center`, `/owners/[ownerId]` (public profile), `/add-property`, plus `/api/owner/properties/[id]/submit` |
| **Components** | `OwnerShell` + `Card` (`components/owner/owner-shell.tsx`), `add-property-actions.tsx` (unused), `ProfileAvatar`, `OwnerProfileLink`, per-page components (calendar-management-page, availability-rules-page, seasonal-pricing-page, payouts-page, verification-page, rejected-property-page, edit-property-page, publish page, photo uploader) |
| **Related files** | `lib/owner-routes.ts`, `lib/dar-data.ts` (owners/properties/payouts/bookings), `app/owner/**`, `app/host/bookings/request-decision/request-decision-page.tsx` |
| **Implementation status** | 🟢 **Restored** to original (see PROJECT_CONTEXT §6). Functional: payouts search/filters/modals, calendar date selection + block, availability rules selects/toggles, edit-property tabs + localStorage save, verification form + validation, photo uploader (drag-reorder, delete confirm), publish flow with schedule dialog. |
| **Missing functionality** | Real owner dashboard (redirects to guest dashboard); real Add-Property form (static mock); working approve/decline booking decision (no-op); mobile nav on shell pages; notifications dropdown; analytics page; verification ↔ publish auto-return |
| **Known issues** | See the full **Owner Portal Functional Audit** (20 sections): dead buttons, `href="#"` links, data inconsistencies across pages, one in-memory API route, `window.confirm` usage, missing modal Escape/outside-click |
| **Dependencies** | `lucide-react`, Icon, `localStorage` (many `dar-owner-*` keys), `next/image` |
| **Future improvements** | Implement the audit's High-priority fixes: real owner dashboard, functional add-property, booking decision persistence, mobile nav, unified owner persona |

---

# 6. Admin Console

**Owner of record:** Fatma. **Status: 🟡** — polished mock dashboards with rich charts/tables; no backend.

| Field | Detail |
|---|---|
| **Purpose** | Internal DAR admin: overview analytics, properties, users, bookings, reports |
| **Routes** | `/admin`, `/admin/properties`, `/admin/users`, `/admin/bookings`, `/admin/reports` (layout `app/admin/layout.tsx` with `AdminSidebar`) |
| **Components** | **Overview:** `overview-page`, `overview-header`, `overview-metric-grid`, `overview-charts` (bar/line/donut/sparkline), `recent-bookings-card`, `top-properties-card`, `user-signups-card`, `system-health-card`, `property-thumbnail`. **Properties:** `properties-management-page`, `properties-workspace`, `properties-table(-columns)`, `properties-filters`, `properties-tabs`, `properties-metrics`, `properties-header`, `property-detail-panel`, `property-summary-cards`, `quality-distribution-chart`, `properties-bulk-actions`. **Users:** `users-management-page`, `users-management-workspace`, `users-table-columns`, `users-topbar`, `users-detail-panel`, `users-lower-panels`. **Bookings:** `bookings-management-page`. **Reports:** `reports-analytics-page` + 16 report cards (revenue-commission-chart, booking-funnel, city-performance, top-properties, reviews-quality, payment-methods, property-type-breakdown, owner-performance, operational-health, ai-insights, data-freshness, saved-reports, schedule-report, quick-analytics-links, reports-metrics, reports-filters). **Shell:** `sidebar` feature |
| **Related files** | `features/overview/*`, `features/properties/*`, `features/users/*`, `features/bookings/*`, `features/reports/*`, `features/sidebar/*`, each with `data/*.data.ts` + `types.ts` |
| **Implementation status** | 🟡 Fully rendered mock dashboards with working client interactions on mock data (tables, filters, tabs, detail panels, search, charts). Data lives in per-feature `*.data.ts` files. |
| **Missing functionality** | No live data; no create/edit/delete mutations (bulk actions are UI); reports not exportable to real files; admin auth role-gate not enforced beyond middleware (unmounted) |
| **Known issues** | Admin data completely disconnected from marketplace/owner/traveler data; `dar-page-gradient` etc. classes rely on globals.css |
| **Dependencies** | `lucide-react`, `features/design-system` primitives, Tailwind |
| **Future improvements** | Supabase-backed tables, real CRUD, export CSV/PDF, role-based access |

---

# 7. Design System

**Status: 🟡** — two parallel design systems exist (see Known issues).

| Field | Detail |
|---|---|
| **Purpose** | Reusable UI primitives for admin + shared components |
| **Routes** | None (components only) |
| **Components** | `features/design-system/primitives.tsx` (Button, Input, Select, Card, Badge, etc.), `layout.tsx` (page shells), `navigation.ts`, `dashboard.tsx`, `variants.ts` (cva), `mock-data.tsx`, `types.ts` |
| **Related files** | `features/design-system/*`, `features/system-states/*` (consumers) |
| **Implementation status** | 🟢 Admin-side primitives working; also `components/ui/*` (Button, TextInput, Badge, Card, Checkbox, DropdownMenu) used by other areas |
| **Missing functionality** | No unified token story across owner/marketplace/design-system |
| **Known issues** | **Two overlapping systems** (`features/design-system` vs `components/ui`) with different APIs; owner portal uses its own inline styles (intentionally restored); `--brand` token differs from owner portal's restored `#5522d9` |
| **Dependencies** | class-variance-authority, clsx, tailwind-merge, Radix dropdown |
| **Future improvements** | Consolidate post-restoration (rule: only swap if visually identical) |

---

# 8. System States

**Status: 🟢** — well-organized, reusable state components (admin/traveler use them).

| Field | Detail |
|---|---|
| **Purpose** | Empty/error/not-found/loading states, toast system, trust strip |
| **Routes** | `/system-states` (preview page), `/not-found` |
| **Components** | `EmptyStateCard`, `EmptyBookingsState`, `EmptyMessagesState`, `EmptyOwnerListingsState`, `EmptySavedState`, `EmptySearchState`, `ErrorStateCard`, `NotFoundState`, `Skeletons`, `StateActionLink`, `StateIllustrations`, `SystemIcons`, `SystemStatesPreview`, `Toast`, `ToastProvider`, `ToastPreviewActions`, `TrustStrip`; hook `useToast` |
| **Related files** | `features/system-states/*`, `data/systemStates.ts`, `types.ts` |
| **Implementation status** | 🟢 Functional; toast provider used by traveler; empty states used across owner/traveler/admin |
| **Missing functionality** | Error boundaries per feature; skeleton usage is limited |
| **Known issues** | Toast API duplicated in places (system-states vs traveler `shared.tsx` showToast) |
| **Dependencies** | React context, Radix portal (toast) |
| **Future improvements** | Adopt one toast implementation app-wide |

---

# 9. Cross-Cutting Infrastructure

| Feature | Status | Detail |
|---|---|---|
| **Supabase integration** (`lib/supabase/`) | 🟡 Scaffolded | `client.ts` (browser), `server.ts` (SSR with cookie store), `config.ts` (env validation with placeholder detection), `auth.ts` (user/profile/role helpers + dev bypass), `middleware.ts` (`updateSession` route protection) |
| **Auth middleware** | 🔴 **Not mounted** | `updateSession` exists but **no root `middleware.ts`** exports it → protected routes (`/dashboard`, `/owner`, `/admin`, `/traveler`) are not actually guarded; owner/admin role redirects inactive |
| **Dev auth bypass** (`lib/auth/devAuthBypass.ts`) | 🟡 Temporary | When `NODE_ENV=development` + `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`: mock traveler user for `/traveler`; must be removed before production |
| **Mock data** (`lib/dar-data.ts`) | 🟡 Shared | `owners`, `properties` (4), `payouts` (5), `bookings` (6), `ownerVerificationData` — **inconsistently consumed** (many pages hardcode their own arrays) |
| **Owner routes** (`lib/owner-routes.ts`) | 🟢 Central | `ownerRoutes` constants + `ownerNavHref`; some pages still hardcode links |
| **Routing helpers** (`app/routing.ts`) | 🟢 | `compactBookingQuery`, `readParam`, `shortPath`, locale helpers; `next.config.ts` legacy `/:locale(en)/*` redirects |
| **API routes** (`app/api/`) | 🔴 Minimal | `/api/owner/properties/[id]/submit` (POST/GET/PATCH, in-memory Map — resets on restart) and `/api/dev/traveler/reset` (dev-store re-seed); plus `/auth/callback` (Supabase session exchange) and traveler invoice `route.ts` (text download) |
| **Env config** | 🟡 | `.env.example` documents vars; `.env.local` present locally; Supabase values are placeholders → auth dead until real keys |

---

# 10. Feature Dependency Map

```
Public Marketplace ──┬─→ Booking Flow (sessionStorage) ──→ /bookings, /booking/*
                     ├─→ Saved/Favorites (localStorage) ──→ /saved, /favorites
                     └─→ Auth (login to book) ──→ Traveler Dashboard
Traveler Dashboard ──┬─→ devStore/devData (file-backed in dev)
                     ├─→ Supabase queries (when configured)
                     └─→ system-states (toasts, empty states)
Owner Portal ────────┬─→ owner-routes.ts, dar-data.ts
                     ├─→ /api/owner/properties/[id]/submit
                     ├─→ localStorage (drafts, calendar, verification, photos)
                     └─→ Auth (owner role)
Admin Console ───────┬─→ features/design-system primitives
                     ├─→ per-feature *.data.ts (mock)
                     └─→ Auth (admin gate — currently inactive)
Auth ────────────────→ Supabase (client/server/config) + authService + middleware (unmounted)
Shared ──────────────→ components/ui, components/brand (DarLogo), components/host-landing/icons (Icon), globals.css tokens
```

---

## Appendix: Status Summary

| Feature | Owner | Status | Top blocker |
|---|---|---|---|
| Public Marketplace | Omar | 🟡 | Mock data + dead links |
| Booking Flow | Menna | 🟡 | No server persistence/payment |
| Authentication | Omar | 🟡 | Supabase env not configured; middleware unmounted |
| Traveler Dashboard | Menna | 🟡 | Dev-only store; needs Supabase |
| Owner Portal | Renad | 🟢 (restored) | Audit fixes pending |
| Admin Console | Fatma | 🟡 | Mock data only |
| Design System | — | 🟡 | Two parallel systems |
| System States | — | 🟢 | Toast duplication |
| Infrastructure (Supabase/middleware/API) | — | 🔴 | Not connected/mounted |

---

*Generated August 2026. Keep in sync with `PROJECT_CONTEXT.md` as features change.*
