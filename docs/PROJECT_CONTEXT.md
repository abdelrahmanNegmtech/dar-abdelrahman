# DAR App — PROJECT_CONTEXT.md

> **Read this first.** This document is the single source of truth for understanding the DAR App project. It is written so that any new developer or AI assistant can orient themselves, understand what exists, what works, what does not, and what comes next — without needing to ask questions.

---

## 1. Project Overview

**DAR App** is a Next.js 16 web application for premium short- and long-term stays in Egypt — a booking marketplace in the style of Airbnb, localized for Egyptian travelers and property owners.

The product serves **three user portals** in one codebase:

| Portal | Audience | Primary routes |
|--------|----------|----------------|
| **Public Marketplace** | Guests browsing & booking stays | `/`, `/search`, `/hotels`, `/properties`, `/stays`, `/booking/*` |
| **Owner Portal (Host)** | Property owners managing listings | `/owner/*`, `/add-property`, `/dashboard` |
| **Admin Console** | DAR staff overseeing the platform | `/admin/*` |

There is also a **Traveler Dashboard** (`/traveler/*`) for signed-in guests to manage bookings, payments, messages, and profile.

The project began as **four independent developer workspaces** that were merged (outside of git) into this single repository. Each developer built one vertical slice with mock data and their own styling; the merge preserved most of the UI but introduced inconsistencies (different design tokens, duplicated components, disconnected navigation, dead links). **Restoring visual and functional parity with the original per-developer implementations is the current highest priority** — before any refactoring or redesign.

---

## 2. Business Idea

- **What:** A premium furnished-stays booking platform for Egypt (cities like Madinaty, New Capital, Zamalek, Cairo East).
- **Who:**
  - **Guests** — find, compare, and book verified furnished apartments, studios, villas, and hotel rooms; pay via local methods (Vodafone Cash, InstaPay, Fawry, cards).
  - **Owners/Hosts** — list properties, manage availability & seasonal pricing, respond to booking requests, receive payouts, and get verified as trusted hosts.
  - **DAR (platform)** — takes commission per booking, reviews listings before they go live, and operates an admin console for oversight.
- **Differentiators:** Egypt-local payments, Arabic/English-ready UI, owner verification flow, AI-powered property recommendations, and a full owner toolset (calendar, pricing rules, payout management).
- **Stage:** Pre-production demo / design prototype. All data is **mock data**; the backend (Supabase) is scaffolded but **not yet connected**.

---

## 3. Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Framework | **Next.js** (App Router, Turbopack) | `16.2.9` — ⚠️ newer than training-data defaults; read `node_modules/next/dist/docs/` for API changes (e.g. `priority` is deprecated on `next/image` in favor of `preload`/`loading="eager"`) |
| UI Library | React | `19.2.4` |
| Language | TypeScript | `^5` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) | Plain-CSS with `@theme` tokens in `app/globals.css`; the project also uses many inline Tailwind classes |
| Icons | lucide-react | `^1.25.0` — plus a custom `Icon` component with an internal SVG `paths` map (`components/host-landing/icons.tsx`) |
| Backend / Auth | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | Configured via env vars but **not yet wired to a real project** (placeholder credentials) |
| Forms | react-hook-form | `^7.83.0` |
| UI primitives | Radix UI dropdown-menu, class-variance-authority, clsx, tailwind-merge | Used mainly by admin/design-system features |
| Fonts | Geist (via `next/font`) | Sans + Mono |
| Package manager | **npm** | Lockfile: `package-lock.json` |
| Node | `>= 18` (Next 16 requirement) | |

**Scripts** (`package.json`):

```bash
npm run dev    # next dev
npm run build  # next build
npm run start  # next start
npm run lint   # eslint .
npm run typecheck # not defined — use `npx tsc --noEmit`
```

> There is no test suite configured.

---

## 4. Folder Structure

```
dar-app/
├── app/                        # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/                 # Auth route group: login, sign-up, create-account, forgot-password, password-reset, verify-email
│   ├── (public)/               # Public route group: search, system-states
│   ├── (dashboard)/            # Route group: dashboard (traveler-flavored overview at /dashboard)
│   ├── admin/                  # Admin Console (layout + overview)
│   ├── owner/                  # Owner Portal — all host flows (see section 9 for full map)
│   ├── traveler/               # Traveler dashboard shell (layout + pages)
│   ├── host/                   # Host shared flows (e.g. booking request-decision)
│   ├── bookings/ messages/ saved/ favorites/ etc.  # Standalone guest pages
│   ├── api/                    # API routes (e.g. /api/owner/properties/[id]/submit)
│   ├── globals.css             # Global styles + design tokens + owner-dashboard CSS
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Homepage (hero, recommendations, popular stays)
│   └── routing.ts              # URL/query helpers (locale prefix, booking query builder)
├── components/                 # Shared components
│   ├── brand/                  # dar-logo.tsx (DarLogo)
│   ├── host-landing/           # host-landing-page + icons.tsx (the custom Icon component)
│   ├── owner/                  # owner-shell.tsx, add-property-actions.tsx
│   ├── owners/                 # owner-profile-link.tsx
│   ├── ui/                     # Button, TextInput, Badge, Card, Checkbox, DropdownMenu, profile-avatar
│   ├── layout/ forms/ shared/  # (mostly empty/organizational)
│   └── index.ts                # Barrel exports
├── features/                   # Feature modules (one per vertical slice)
│   ├── authentication/         # Auth types + UI
│   ├── bookings/               # Booking management (admin)
│   ├── design-system/          # Design-system primitives + dashboard mock (admin-side)
│   ├── overview/ properties/ reports/ sidebar/ system-states/ users/  # Admin console modules
│   ├── public-marketplace/     # Guest marketplace (HeroSection, search, property details, gallery)
│   └── traveler/               # Traveler dashboard (actions, data, components, validation)
├── hooks/                      # Shared React hooks
├── lib/                        # Utilities & integrations
│   ├── auth/                   # devAuthBypass.ts (temporary dev-only mock auth)
│   ├── constants/              # app.ts (APP_NAME)
│   ├── dar-data.ts             # ⭐ Shared mock data (owners, properties, payouts, bookings)
│   ├── owner-routes.ts         # ⭐ Central owner route map (ownerRoutes)
│   ├── supabase/               # client.ts, server.ts, auth.ts, middleware.ts, config.ts, README
│   ├── utils/                  # cn, format helpers
│   └── validations/            # Shared validation schemas
├── docs/                       # 📚 Single source of truth — see docs/INDEX.md
│   ├── INDEX.md                # ← start here: links every documentation file
│   ├── PROJECT_CONTEXT.md      # ← this file
│   ├── PROJECT_ROADMAP.md      # Phases & sprints
│   ├── DEVELOPMENT_RULES.md    # Coding standards
│   ├── FEATURES_DOCUMENTATION.md # Feature inventory
│   ├── UI_AUDIT.md · FUNCTIONAL_AUDIT.md · BACKEND_AUDIT.md · TECHNICAL_DEBT.md
│   └── architecture.md         # Folder responsibilities
├── public/                     # Static assets (PNG references, brand SVGs, payment logos)
├── .freebuff/                  # Local preview/run tooling (not part of the product)
├── DAR-APP.md                  # Earlier project overview (superseded by docs/INDEX.md in places)
├── AGENTS.md                   # ⚠️ REQUIRED READING: this Next.js version differs from training data
└── next.config.ts              # Redirects, image qualities, dev origins
```

**Convention notes:**
- Route folders and non-component files: `kebab-case`.
- React components: `PascalCase` files/exports.
- Functions/hooks/variables: `camelCase`; hooks prefixed `use`.
- Route groups (organizational, not in URL): parentheses, e.g. `(auth)`.
- Components start in the narrowest folder; promote to `components/shared` only when reused by multiple features. (See `architecture.md`.)

---

## 5. Project Architecture

### 5.1 Overall shape

- **App Router** with Server Components by default; interactive pages opt into `"use client"`.
- **Mock-data driven.** `lib/dar-data.ts` is the shared data source (properties, payouts, bookings, owner profiles). Most pages hardcode their own arrays inline instead of importing from it — **this is the root cause of the cross-page data inconsistencies** (see §14 "Known Issues").
- **Per-portal shells:**
  - Owner Portal: `components/owner/owner-shell.tsx` (`OwnerShell` + `Card`) — dark sidebar, header, content region.
  - Traveler: `features/traveler/components/TravelerLayout.tsx`.
  - Admin: `features/sidebar/components/sidebar.tsx` + `app/admin/layout.tsx`.
- **Local state persistence** via `localStorage` keys (`dar-owner-property:*`, `dar-owner-calendar:*`, `dar-owner-verification`, `dar-owner-property-photos`, `dar-seasonal-pricing:*`). Data survives refreshes but is per-browser.
- **One real API route:** `app/api/owner/properties/[id]/submit/route.ts` (POST/GET/PATCH) backed by an in-memory `Map` (lost on server restart). Everything else is client-side mock.

### 5.2 Data flow

```
UI (pages/components)
  └─ lib/dar-data.ts (mock)  ← shared
  └─ localStorage (per-browser drafts/status)
  └─ /api/owner/properties/[id]/submit (in-memory status)
  └─ Supabase (NOT connected yet — env vars are placeholders)
```

### 5.3 Key architectural files

| File | Purpose |
|------|---------|
| `lib/owner-routes.ts` | Central owner URL map (`ownerRoutes.*`, `ownerNavHref`) — note some owner pages still hardcode links (e.g. `/owner/properties` links `"/add-property"` directly), so `ownerRoutes` is not used everywhere |
| `lib/dar-data.ts` | Shared mock data for properties/payouts/bookings/owners |
| `app/globals.css` | Design tokens (`--brand` etc.) + all `owner-*` utility classes |
| `next.config.ts` | Legacy `/:locale(en)/...` redirects; `images.qualities: [70,75,85,90,92,95]` |
| `lib/supabase/middleware.ts` | Route-protection logic (⚠️ not currently mounted — see §11) |

---

## 6. Current Project Status

**Phase: Post-merge restoration.** The four developer workspaces were merged into this repo, the Owner Portal has been restored to match its original developer implementation, and a full Owner Portal functional audit has been completed. Marketplace, Traveler, and Admin were not yet re-audited.

### 6.1 Completed work
- ✅ All four developer slices merged into one repo (outside git; single `Initial commit`).
- ✅ **Owner Portal restored to original** (Renad's implementation): routes, shell, color tokens (`#5522d9`/`#6c4cf5`), typography, CSS classes, assets, `owner-routes.ts`, `profile-avatar.tsx`, `add-property-actions.tsx`, `/owners/[ownerId]` public profile, `owners` export in `dar-data.ts`.
- ✅ `images.qualities` extended in `next.config.ts` to support the restored `quality={90}` usages.
- ✅ Typecheck passes (`npx tsc --noEmit`); all owner routes return 200; LCP warnings silenced on homepage/hotels hero images.
- ✅ **Owner Portal Functional Audit delivered** (20-section report: navigation, dashboard connections, buttons, forms, dropdowns, hover, tables, search, filters, tabs, modals, images, responsive, data consistency, missing features, placeholders, broken flows, priorities).

### 6.2 Work in progress
- 🔄 **Fix phase for the Owner Portal audit** — nothing has been fixed yet; the report awaits review/approval of priorities.
- 🔄 Homepage/public marketplace polish (hero LCP handling done; broader audit pending).

### 6.3 Pending work
- ❌ Connect Supabase (real auth + data).
- ❌ Mount auth middleware (currently inert — see §11).
- ❌ Re-audit + restore Marketplace (Omar), Booking Flow & Traveler (Menna), Admin (Fatma) against original workspaces.
- ❌ Unify design tokens/logo (3 logo variants exist: `DarLogo`, auth `BrandLogo`, etc.).
- ❌ Remove dead/placeholder routes, wire all `href="#"` links.

---

## 7. Completed Work (detail)

1. **Owner Portal restoration** (see §6.1) — byte-for-byte restoration of `app/owner/**`, `components/owner/owner-shell.tsx`, dashboard page, and shared files from the original Renad workspace; added back routes that the merge dropped: `/owner/messages`, `/owner/reviews`, `/owner/settings`, `/owner/properties/drafts`.
2. **LCP/perf fixes** — replaced deprecated `priority` with `loading="eager"` + `fetchPriority="high"` on the homepage hero (`HeroSection.tsx`) and the first hotels card (`app/hotels/page.tsx`), per the Next 16 bundled docs.
3. **Infrastructure** — Supabase SSR helpers scaffolded (`client/server/auth/config/middleware`), config validation with placeholder detection, dev auth bypass for `/traveler`.
4. **Mock data layer** — `lib/dar-data.ts` with owners, 4 properties, 5 payouts, 6 bookings, verification data.
5. **Original developer workspaces preserved** in a sibling folder (`D:\negmtech company\PROJECTS DESIGN\DAR APP\`) — each with code **and** design screenshots:
   - `Omar/omar-dar-app/dar-app` → Marketplace + Auth (has its own `.git` history incl. the merge commits)
   - `menna/menna-dar-app/dar-app` → Booking Flow + Traveler Dashboard (own `.git`)
   - `renad/renad-extracted/dar-app` → Owner Portal
   - `dar-app-final/fatma-full/dashboard` → Admin Dashboard
   - Plus `dar-app-main.zip`, `dar-app.rar`, `20.07.2026/` archives as fallbacks.

---

## 8. Team Structure

The project was built by four developers, each owning one vertical slice. Their original workspaces are the **source of truth** for UI restoration (the merged repo is NOT the reference).

| Developer | Ownership | Original workspace |
|-----------|-----------|--------------------|
| **Omar** | Public Marketplace + Authentication | `DAR APP/Omar/omar-dar-app/dar-app/` |
| **Menna** | Booking Flow + Traveler Dashboard | `DAR APP/menna/menna-dar-app/dar-app/` |
| **Renad** | Owner Portal | `DAR APP/renad/renad-extracted/dar-app/` |
| **Fatma** | Admin Dashboard | `DAR APP/dar-app-final/fatma-full/dashboard/` |

**Restoration rule (agreed with the team):** when restoring any page, find the page in the responsible developer's workspace first, diff against the merged version, restore to visual + functional parity, and only adapt routing/layout/shared tokens. Do **not** redesign, simplify, or swap components if it changes appearance — even duplicated code is kept during restoration. One page at a time, with approval between pages.

---

## 9. Routing Overview

### 9.1 Route groups & protection
- **Public (no auth):** `/`, `/search`, `/hotels`, `/properties`, `/stays/*`, `/booking/*`, `/about`, `/contact`, `/help`, `/legal`, `/favorites`, `/saved`, `/become-a-host`, `/add-property`, `/buy`, `/rent`, `/new-projects`, `/messages`.
- **Protected prefixes** (per `lib/supabase/middleware.ts`): `/dashboard`, `/owner`, `/admin`, `/traveler` → redirect to `/login` when unauthenticated (⚠️ middleware not mounted — see §11).
- **Role-gating:** `/owner/*` requires `account_type === "owner"`; `/admin/*` always redirects guests away; auth entry pages (`/login`, `/sign-up`, `/create-account`) redirect logged-in users to their role home.

### 9.2 Owner Portal route map (restored, matches original)
| Route | Purpose |
|-------|---------|
| `/owner` | Redirects to `/dashboard` (original behavior) |
| `/owner/properties` | My Properties list |
| `/owner/properties/drafts` | Draft listings |
| `/owner/properties/new/details` | Re-export of `/add-property` |
| `/owner/properties/new/photos` | Photo uploader (drag-reorder, delete confirm) |
| `/owner/properties/publish` | Publish flow (checklist, schedule dialog) |
| `/owner/properties/[id]` | Property status (polls `/api/.../submit` every 15s) |
| `/owner/properties/[id]/edit?tab=basic\|photos\|amenities\|pricing\|policies` | Edit property (tabs) |
| `/owner/properties/[id]/photos` | Re-export of photo uploader |
| `/owner/properties/[id]/publish` | Publish existing |
| `/owner/properties/[id]/rejected` | Rejection reasons + resubmit |
| `/owner/properties/[id]/calendar` | Redirects to calendar-management |
| `/owner/properties/[id]/calendar-management` | Calendar management (sync/export/block) |
| `/owner/properties/[id]/seasonal-pricing` | Seasonal pricing editor |
| `/owner/properties/[id]/availability-rules` | Availability rules editor |
| `/owner/bookings` | Booking requests (1 hardcoded request) |
| `/owner/bookings/request-decision` | Approve/decline decision (⚠️ no-op submit) |
| `/owner/payouts` | Payouts, filters, statements, method modal |
| `/owner/reviews` | Reviews (empty state) |
| `/owner/verification` | Identity verification (multi-step form) |
| `/owner/settings` | Settings (2 links) |
| `/owner/help-center` | Help center (stub) |
| `/owners/[ownerId]` | Public owner profile (e.g. `/owners/ahmed-hassan`) |
| `/add-property` | ⚠️ Static mock form (no real inputs/handlers) |

### 9.3 Routing helpers
- `app/routing.ts` — `compactBookingQuery`, `readParam`, `readSearchParam`, locale helpers.
- `next.config.ts` — legacy `/:locale(en)/...` → canonical path redirects (e.g. `/en/h/:slug` → `/hotels/:slug`).
- `lib/owner-routes.ts` — `ownerRoutes.*` constants and `ownerNavHref(label)` lookup.

---

## 10. Design System Overview

**State: split across two eras.** The original developer workspaces each had their own styling; the merged repo centralized tokens in `app/globals.css` but the per-portal pages still use inline hex colors heavily.

### 10.1 Tokens (`app/globals.css`)
| Token | Value | Notes |
|-------|-------|-------|
| `--brand` | `#5631d8` | Primary brand (⚠️ owner portal uses its own restored `#5522d9`/`#6c4cf5` family — intentional, matches Renad's original) |
| `--brand-strong` | `#4a2ac2` | Hover variant |
| `--brand-soft` | `#ede9ff` | Light background |
| `--background` | `#f3f6fb` | Page background |
| `--foreground` | `#0d1838` | Primary text |
| `--surface` / `--surface-dark` | `#ffffff` / `#091225` | Card / dark sidebar |

### 10.2 Fonts
- **Geist Sans** (variable) with Segoe UI / SF Pro fallbacks.
- **Geist Mono** for code.
- Loaded via `next/font` in `app/layout.tsx`.

### 10.3 Components
- `components/ui/*` — Button, TextInput, Badge, Card, Checkbox, DropdownMenu (Radix), `ProfileAvatar` (image + initials fallback with hi-res aliases).
- `components/brand/dar-logo.tsx` — `DarLogo` with `surface="dark"|"light"`.
- `components/host-landing/icons.tsx` — the **custom `Icon`** component used across the whole app (name → inline SVG `paths` map, 63 icons; strokeWidth prop supported).
- `features/design-system/*` — a separate design-system kit (primitives, dashboard mock, navigation) used primarily by the **admin console**; not yet applied to owner/marketplace.
- `features/system-states/*` — EmptyState, ErrorState, Skeletons, Toast, TrustStrip primitives.

### 10.4 Owner-portal CSS vocabulary (`owner-*` classes in globals.css)
`owner-page-title`, `owner-section-title`, `owner-card-title`, `owner-body`, `owner-helper`, `owner-label`, `owner-button-text`, `owner-badge`, `owner-number-sm/md/lg`, `owner-input-text`, `owner-dashboard-frame/main/content/page` — restored to Renad's exact values (e.g. page-title 26px, px-8 gutters).

> **Rule for restoration work:** shared design-system components may be used **only internally**; never swap a component if it changes the page's appearance. Visual accuracy > code cleanliness for now.

---

## 11. Authentication Overview

**Status: scaffolded, not live.**

- **Supabase integration** (`lib/supabase/`):
  - `config.ts` — reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `ANON_KEY`); detects missing/placeholder/invalid config; `getSupabaseConfig()` returns `null` when not configured (app degrades gracefully).
  - `client.ts` / `server.ts` — browser/server Supabase clients.
  - `auth.ts` — `getCurrentUser`, `getCurrentProfile`, `requireUser`, `requireRole("guest"|"owner")`, `signOut`, typed `Profile` shape (expects a `profiles` table: full_name, email, phone, country_code/country_name, dialing_code, account_type, avatar_url).
  - `middleware.ts` — `updateSession()` implements route protection + role redirects (see §9.1).
- **⚠️ The middleware is NOT mounted.** There is no root `middleware.ts` exporting `updateSession`, so route protection is currently inert in production/dev. (The `(auth)` pages exist at `app/(auth)/*`.)
- **Dev auth bypass** (`lib/auth/devAuthBypass.ts`): when `NODE_ENV === "development"` **and** `NEXT_PUBLIC_DEV_AUTH_BYPASS === "true"`, `getCurrentUser()` returns a mock traveler (Ahmed Hassan) and `/traveler/*` renders without login. **Temporary** — to be removed once real auth works.
- **Env requirements:** copy `.env.local` from the main checkout (or set real credentials) to enable auth. Required vars per `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `_ANON_KEY`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_DEV_AUTH_BYPASS`. Never commit secrets; the run doc in `.freebuff/run.md` records the procedure.

---

## 12. Git Workflow

- **Repository state:** single commit `71880ce Initial commit` on `main` (with `origin/main` remote). **No history, no feature branches, no stashes** — `main` is the only branch.
- The multi-developer merge was performed **outside git** (file copies), which is why git history cannot be used to recover original implementations — the sibling `DAR APP\` workspaces are the recovery source.
- **Guideline:**
  - Work on `main` locally; commit only when asked.
  - Do not push unless explicitly requested.
  - Inspect `git status` before consequential operations; never discard/stash/overwrite others' changes.
  - Keep changes scoped — avoid `git add -A`.
- Current working-tree state: owner-portal restoration changes are **uncommitted** (modified `app/owner/**`, new `app/owner/messages|reviews|settings|drafts`, `app/owners/`, `lib/dar-data.ts`, `next.config.ts`, plus the LCP hero edits).

---

## 13. Current Priorities

1. **Fix the Owner Portal audit findings** (in priority order from the audit report):
   - High: build a real owner dashboard (currently redirects to the traveler dashboard), make Add Property functional (wire `AddPropertyActions`), fix the no-op Approve/Decline booking decision, add mobile nav to OwnerShell pages, fix the payouts date filter, make message quick-chips insert text, unify the owner persona.
   - Medium/Low: wire `href="#"` links, make Calendar Week/Day/List views real, real property-selector dropdowns, modal Escape/outside-click + `role="dialog"`, real date picker, table sorting, verification readonly fields, empty-state illustrations, year consistency.
2. **Restore the remaining sections** (Marketplace → Omar, Booking/Traveler → Menna, Admin → Fatma) using the find → compare → restore → verify workflow.
3. **Connect Supabase** — real auth, `profiles` table, data fetching, replace mock data + in-memory API.
4. **Mount auth middleware** at the project root.
5. **Unify the design system** — tokens, logos, shared components — **only after** all restorations are approved.

---

## 14. Known Issues & Gotchas (for AI assistants)

- **Next.js 16 ≠ older Next:** read `node_modules/next/dist/docs/` (AGENTS.md mandates it). Examples: `priority` deprecated → use `loading="eager"`/`fetchPriority="high"`; `params`/`searchParams` are Promises in pages; `images.qualities` restricts allowed qualities.
- **Cross-page data inconsistency:** the dashboard shows traveler data ("Ismail Negm — Guest"), owner pages show "Ahmed Hassan — Host"; booking/payout/property numbers don't reconcile across pages because each page hardcodes its own arrays. `lib/dar-data.ts` exists but is inconsistently used.
- **Dead/placeholder UI:** `/add-property` is a static mock; several dashboard buttons and `href="#"` links are inert; the booking decision submit navigates to the same URL.
- **localStorage keys** are the de-facto persistence layer: `dar-owner-property:{id}`, `dar-owner-property-status:{id}`, `dar-owner-calendar:{id}`, `dar-owner-verification`, `dar-owner-property-photos`, `dar-owner-availability:{id}`, `dar-seasonal-pricing:{id}`, `dar-property-publish-preference`.
- **`git grep`/code tools:** searching inside `node_modules` is skipped by the code searcher; use direct paths for the bundled Next docs.
- **Windows environment:** terminal runs in Git Bash (POSIX syntax). Use `mv`/`rm`, never `move`/`del`. Project path contains spaces — always quote.
- **Preview/dev server:** runs detached on port 3000; log at `.freebuff/preview-*.log`; restart after `next.config.ts` changes.

---

## 15. Future Roadmap

### Phase A — Restoration (current)
- Owner Portal: implement audit fixes (approved items only).
- Marketplace, Booking Flow & Traveler, Admin: full find → compare → restore → verify cycles against the original workspaces, one page at a time.

### Phase B — Unification
- Consolidate the 3 logo components into one.
- Adopt `--brand` tokens across owner/marketplace (keeping restored pages visually identical).
- Promote truly-shared UI into `components/ui` where render-identical.
- Delete orphaned `.svg` placeholders in `public/`.

### Phase C — Backend
- Connect Supabase: auth flows (login/signup/password reset/email verification already scaffolded as routes), `profiles` table, real property/booking/payout data.
- Replace in-memory API route with DB-backed submit/approve/reject.
- Mount and test route-protection middleware; remove the dev auth bypass.

### Phase D — Product
- Real owner dashboard (occupancy, revenue, booking requests, payouts snapshot).
- Search/filter/pagination across marketplace and owner lists.
- Notifications, real messaging, payout automation, owner analytics.
- CI/CD, lint/typecheck gates, tests, staging environment.

---

*Generated August 2026. Keep this document updated whenever the project status, architecture, or priorities change.*
