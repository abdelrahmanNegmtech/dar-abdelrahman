# BACKEND AUDIT — DAR App

> **Scope:** Every server-side concern: authentication, authorization, Supabase integration, database, API routes, environment variables, security, and missing backend functionality.
> **Method:** Full read of the Supabase helper layer (`lib/supabase/*`), the auth service + callback route, all 20 traveler server actions, all API route handlers, env configuration, plus code searches (`process.env` usage, all `.from("table")` references, SQL artifacts, middleware references).
> **Status legend:** 🟢 Working · 🟠 Partial / at risk · 🔴 Missing / broken · 🔒 Blocked (needs real credentials)
> **Bottom line:** The **entire backend is scaffolded but inert.** Every Supabase-facing path (auth, data, protection) is gated behind placeholder env vars, and the route-protection middleware is fully written but **never mounted**. Zero SQL exists. The only live backend is: 1 in-memory API route, 1 dev-only reset route, 20 zod-validated server actions that fall back to a file-based dev store, and a complete OAuth callback handler. Fixes are planned in `PROJECT_ROADMAP.md` Phase 4 (B1–B9).

---

# 1. Authentication

## 1.1 Current state

| Layer | Component | File | Status |
|---|---|---|---|
| Client service | 8 auth functions, validated + error-mapped | `features/authentication/services/authService.ts` (+ `authValidation.ts`, `authErrors.ts`, `authRedirects.ts`) | 🟢 code complete |
| Callback handler | OAuth + email-verification code exchange, profile upsert, safe redirect | `app/auth/callback/route.ts` | 🟢 code complete |
| Server helpers | `getCurrentUser`, `getCurrentProfile`, `requireUser`, `requireRole`, `signOut` | `lib/supabase/auth.ts` | 🟢 code complete |
| Browser client | `createBrowserClient` (persistSession toggle, auto-refresh, detectSessionInUrl) | `lib/supabase/client.ts` | 🟢 code complete |
| Server client | `createServerClient` with SSR cookie store (swallows RSC write errors) | `lib/supabase/server.ts` | 🟢 code complete |
| **End-to-end** | **Every auth call fails at runtime** | — | 🔒 **BLOCKED — no real credentials** |

## 1.2 What works on paper (verified)

- **8 service functions**: `loginWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `requestPasswordReset`, `updatePassword`, `resendVerificationEmail`, `getOwnProfile`, `logout` — each returns `{ data, err }` with mapped user-facing errors (`mapAuthError`, `mapOAuthError`).
- **Validation**: `validateEmail`, `validatePassword` (≥8 chars, uppercase + number), `validateOptionalPhone`, country-code cross-check (`getCountryByCode`), account-type normalization.
- **OAuth flow**: `skipBrowserRedirect: true` → manual preflight `fetch` of the provider authorize URL with `skip_http_redirect=true` → `window.location.assign(redirectUrl)`. Providers: Google, Facebook.
- **Callback route** (`app/auth/callback/route.ts`): exchanges code → fetches user → **upserts `profiles`** (update if exists, insert with `account_type` if not) → role-aware redirect (`/search` → `/owner` when owner) → sets a **httpOnly, 15-min, path-scoped `dar-password-recovery` cookie** for the password-reset flow, which the `/password-reset` page verifies server-side (verified).
- **Server helpers** used by traveler pages: `getAuthenticatedProfile()` in `features/traveler/data/queries.ts` redirects unauthenticated users to `/login?redirectTo=…` and maps `profiles` rows onto the traveler profile shape.

## 1.3 Gaps

| Gap | Detail | Priority |
|---|---|---|
| 🔒 No live credentials | `NEXT_PUBLIC_SUPABASE_URL`/keys are placeholders → `getSupabaseConfigState()` reports `missing`; `login`/`signup`/OAuth/reset all return runtime errors | 🔴 B1 |
| No session persistence layer beyond client | Session only exists if Supabase is configured; nothing else stores auth state | 🔴 B3 |
| No email/verification templates configured | Supabase auth emails (verify, reset) cannot be sent without a project | 🔴 B1 |
| `signOut` server helper unused by auth pages | `logout()` in the service uses the browser client; `requireUser/requireRole` are only consumed by traveler queries today | 🟡 |
| No refresh-token edge handling | Middleware's cookie-refresh proxying never runs (see §2) | 🔴 B2 |

---

# 2. Authorization

## 2.1 The core finding — middleware is not mounted

`lib/supabase/middleware.ts` implements a **complete, correct** `updateSession(request)`:

- **Protected prefixes**: `/dashboard`, `/owner`, `/admin`, `/traveler` → redirect to `/login?redirectTo=…` when unauthenticated.
- **Auth-entry redirects**: `/login`, `/sign-up`, `/create-account` → role destination when already signed in.
- **Role enforcement**: `/admin*` → always redirected to `/search` (no admin role concept exists); `/owner*` requires `account_type === "owner"` in `profiles`.
- **Session refresh**: standard SSR cookie `getAll`/`setAll` pattern to keep the session alive.

**But there is no root `middleware.ts`** and `updateSession` has **zero references** anywhere in the codebase (verified by search). **Every route-protection rule is inert.** This is the single most important backend defect: the app currently runs with no server-side route guard at all.

## 2.2 What protection actually exists today

| Mechanism | Where | Status |
|---|---|---|
| Middleware route protection | `lib/supabase/middleware.ts` | 🔴 **unmounted** |
| Server-action ownership checks | `features/traveler/actions.ts` — cancels `.eq("traveler_id", user.id)`, deletes `.eq("user_id", user.id)`, message send requires `conversation_members` membership, review submit requires a `completed` booking | 🟢 solid pattern |
| Server-component auth | `queries.ts` `getAuthenticatedProfile` → `redirect("/login")` when no user | 🟢 partial (traveler only) |
| Owner/admin server-side guards | none — owner routes render regardless of role (no `requireRole("owner")` call on any owner page) | 🔴 |
| **RLS / Postgres policies** | **zero `.sql` files, zero policies** (verified) | 🔴 |

## 2.3 Authorization gaps

| Gap | Detail | Priority |
|---|---|---|
| No route guard | Anything under `/owner`, `/admin`, `/traveler`, `/dashboard` is reachable without a session | 🔴 B2 |
| No admin role | `/admin` pages are public-by-default and the middleware would bounce everyone (even admins) once mounted | 🔴 B2/B3 |
| No RLS | If Supabase goes live tomorrow, tables are wide open at the DB layer; ownership checks in actions are the only line of defense | 🔴 B1 (schema) |
| Owner API unauthenticated | `POST /api/owner/properties/[id]/submit` has **no auth, no ownership check, no validation of the id** (§5) | 🔴 B6 |

---

# 3. Supabase

## 3.1 Integration inventory

| Item | Implementation | Status |
|---|---|---|
| Packages | `@supabase/ssr ^0.12.0`, `@supabase/supabase-js ^2.108.2` (package.json) | 🟢 |
| Config gate | `lib/supabase/config.ts` — placeholder detection (`xxxx.supabase.co` set), URL validation (https + `.supabase.co`), dual-key fallback (PUBLISHABLE → ANON), `getSiteUrl()` fallback chain (env → `window.location.origin` → localhost:3000) | 🟢 well-built |
| Browser client | `createBrowserClient` — `autoRefreshToken`, `detectSessionInUrl`, `persistSession` toggle | 🟢 |
| Server client | `createServerClient` + `next/headers` cookie store, try/catch on writes (RSC-safe) | 🟢 |
| Middleware client | inline `createServerClient` with cookie refresh proxying | 🟢 but unmounted (§2) |
| Auth helpers | `lib/supabase/auth.ts` — user/profile/role helpers | 🟢 |
| README | `lib/supabase/README.md` is a stub ("will be added here when…") — doesn't match reality | 🟡 |
| **Live project** | **None configured** — all env values empty/placeholder | 🔒 B1 |

## 3.2 Risks

- **Keys in client bundle**: `NEXT_PUBLIC_SUPABASE_URL` + anon/publishable key are public by design (RLS is the security boundary) — **but RLS doesn't exist**, so going live without policies would expose all tables to anyone with the anon key.
- **`getSupabaseConfig` null-coalescing everywhere**: every caller handles "not configured" — good, but it means the app silently degrades to mock mode in production builds if env is missing (only the dev-bypass path is `NODE_ENV`-gated; the plain "no config" path is not environment-gated).

---

# 4. Database

## 4.1 What exists

**Nothing declarative.** `glob **/*.sql` → 0 files. No migrations, no schema, no seed scripts, no types generated from the DB (`supabase` CLI not configured). The expected schema must be reverse-engineered from the 33 `.from("table")` calls in the code.

## 4.2 Expected tables (inferred from code)

| Table | Columns referenced | Written by |
|---|---|---|
| `profiles` | id, account_type (guest/owner), full_name, email, phone, country_code, country_name, dialing_code, avatar_url, created_at, updated_at, address, city, profile_completion, date_of_birth, display_name, email_verified, emergency_contact_name, emergency_contact_phone, identity_verified, nationality, phone_verified, preferred_currency, preferred_language | callback route, authService.getOwnProfile, updateTravelerProfile |
| `bookings` | id, traveler_id, property_id, owner_id, status, cancellation_reason | cancelBooking, submitReview |
| `reviews` | booking_id, traveler_id, property_id, owner_id, rating + 5 sub-ratings, comment, status; **upsert on `booking_id, traveler_id`** | submitReview/update/deleteReview |
| `saved_properties` | traveler_id, property_id | toggleSavedProperty |
| `conversation_members` | conversation_id, user_id, last_read_at | sendConversationMessage, markConversationRead |
| `messages` | id, conversation_id, sender_id, body, message_type (text/system) | send/deleteConversationMessage |
| `notifications` | id, user_id, is_read | notification actions |
| `payment_methods` | id, user_id, brand, last_four, provider, method_type (card/wallet), is_default | payment actions |
| `support_tickets` | id, user_id, booking_id, subject, category, priority, status, ticket_reference, closed_at | createSupportTicket, updateStatus |
| `support_ticket_messages` | id, ticket_id, sender_id, message, is_internal | create/reply |
| Not queried anywhere | `properties`, `owners`, `admins`, `payouts`, `wallet` | — (mock data only) |

## 4.3 Database gaps

| Gap | Detail | Priority |
|---|---|---|
| No schema/migrations | Nothing to run against a real project; tables are guesses until created | 🔴 B1 |
| No RLS policies | Required before going live (§2.3) | 🔴 B1 |
| No seed data for properties/owners | Marketplace + Owner data stays in `lib/dar-data.ts` / local arrays forever | 🔴 B5 |
| No generated types | All `maybeSingle<Type>()` casts are hand-written and drift-prone | 🟠 B1 |
| No `properties` table consumers | Owner flows write to localStorage/in-memory Map instead of the DB | 🔴 B5/B6 |

---

# 5. APIs

## 5.1 Inventory (complete — 2 route handlers + 20 server actions)

| API | Type | Auth | Persistence | Status |
|---|---|---|---|---|
| `POST/GET/PATCH /api/owner/properties/[id]/submit` | Route handler | **none** | **in-memory `Map`** (resets on restart) | 🔴 |
| `POST /api/dev/traveler/reset` | Route handler | dev-bypass gate (404 when off) | file-backed dev store | 🟢 (dev-only) |
| 20 `"use server"` actions (`features/traveler/actions.ts`) | Server actions | `getActionUser` (bypass → supabase session) | dual-path: Supabase table OR `devStore` | 🟠 (8 lack dev fallback — see FUNCTIONAL_AUDIT §8.4) |

## 5.2 Route handler review — `/api/owner/properties/[id]/submit`

```
POST → statuses.set(id, "pending_review")      // ignores request body entirely
GET  → statuses.get(id) ?? "pending_review"    // default lies — GET before POST reports pending_review
PATCH → validates status enum (draft/pending_review/approved/rejected) → 400 otherwise
```

- 🔴 **No authentication or ownership check** — any client can set any property id's status.
- 🔴 **No validation of `id`** (no shape/ownership), no rate limiting.
- 🟠 **GET returns a fabricated `pending_review`** for unknown ids — `property-status.tsx` relies on this and cannot distinguish "draft" from "not in the map".
- 🟠 In-memory state disappears on dev-server restart (status resets to `pending_review` for everything).

## 5.3 Server actions review (strengths)

- ✅ Every mutating action parses input with a **zod schema** before touching state.
- ✅ Ownership-scoped queries (`.eq("traveler_id", user.id)` etc.) throughout.
- ✅ `revalidatePath` after each mutation keeps the UI consistent.
- ✅ Consistent `ActionResult { ok, message }` contract surfaced as toasts.

## 5.4 Missing APIs

- No property CRUD, no booking-decision API, no payouts API, no reviews API for owners, no admin APIs, no payments gateway, no file upload endpoint (photos are local assets), no search API, no webhooks, no push/realtime endpoints (messaging & notifications are request/response only).

---

# 6. Environment Variables

## 6.1 Inventory (`.env.example`)

| Variable | Used by | Exposure | Status |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/config.ts` (validated: https + `.supabase.co`) | client (public by design) | 🔒 placeholder |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | `lib/supabase/config.ts` | client | 🔒 placeholder |
| `NEXT_PUBLIC_SITE_URL` | `getSiteUrl()` — redirect URLs, OAuth callbacks | client | unset → falls back to origin |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `MapPanel.tsx` (marketplace search map) | client | unset → map silently degraded |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | `devAuthBypass.ts`, `devStore.ts` (both require `NODE_ENV === "development"` AND `"true"`) | client (but double-gated server-side) | `false` |

## 6.2 Findings

- 🟢 **No secrets in the client**: correctly uses only `NEXT_PUBLIC_*`; no service-role key anywhere (and it shouldn't be).
- 🟢 **Config gate is robust**: placeholder strings are detected (`xxxx.supabase.co`, `your-project.supabase.co`, `sb_publishable_xxxxx`…), so the app cleanly reports "not configured" instead of crashing.
- 🟢 **Dev bypass is doubly gated** (`NODE_ENV === "development"` is checked server-side in both consumers) and the dev reset API returns 404 when the flag is off.
- 🟠 **`NEXT_PUBLIC_DEV_AUTH_BYPASS` is client-visible** — a user could flip it in dev tools, but the server-side `NODE_ENV` check makes it unexploitable outside dev. **Do not move bypass logic to server-only env without re-gating.**
- 🟡 `NEXT_PUBLIC_SITE_URL` unset means email/callback links use `window.location.origin` — breaks in preview/headless contexts; set it in production.
- 🟡 No `.env.local` committed (correct) — but a fresh checkout cannot authenticate at all (by design; documented in `.env.example`).

---

# 7. Security

## 7.1 Findings by severity

| # | Severity | Finding | Location |
|---|---|---|---|
| S1 | 🔴 | **No route protection** — middleware unmounted; `/owner`, `/admin`, `/traveler` fully public | §2.1 |
| S2 | 🔴 | **No RLS** — DB would be wide open on go-live | §2.3 / §4.3 |
| S3 | 🔴 | **Unauthenticated status API** — arbitrary property status writes, no id validation, no rate limit | §5.2 |
| S4 | 🟠 | Dev bypass flag is `NEXT_PUBLIC` (mitigated by `NODE_ENV` gate) | §6.2 |
| S5 | 🟠 | Owner booking decision (approve/decline) has **no server-side action at all** — purely client nav (FUNCTIONAL_AUDIT §1) | owner pages |
| S6 | 🟠 | No rate limiting / brute-force protection on auth forms (Supabase provides some once configured; nothing app-side) | auth |
| S7 | 🟡 | Booking state in `sessionStorage`, saved/verification in `localStorage` — XSS-readable, fine for mock data, must not hold PII later | booking/marketplace |
| S8 | 🟡 | `window.confirm`/`prompt` on owner pages — UX/trust issue, not a vulnerability | seasonal-pricing, photos, rejected |

## 7.2 What is done well (verified)

- ✅ **Open-redirect protection** in `app/auth/callback/route.ts`: `getSafeRedirect` rejects non-`/` values, `//` protocol-relative URLs, and protocol-injection (`/^\/[a-z][a-z\d+\-.]*:/i`), falling back to `/search`.
- ✅ **httpOnly password-recovery cookie** (15-min, `sameSite: lax`, `secure` on https, path-scoped to `/password-reset`) verified by the reset page server-side.
- ✅ **Ownership-scoped queries** in every traveler server action (user-scoped `.eq` filters, membership checks, completed-booking gate on reviews).
- ✅ Auth errors log only in development (`authErrors.ts`).
- ✅ SSR cookie writes are wrapped in try/catch (no RSC write crash).
- ✅ Dev-store writes live in the OS temp dir, gated to dev.

---

# 8. Missing Backend Functionality

| Missing | Current state | Needed for | Priority |
|---|---|---|---|
| **Real Supabase project** | placeholders | everything | 🔴 B1 |
| **Mounted middleware** | written, unused | route protection, session refresh | 🔴 B2 |
| **End-to-end auth flows** | code complete, untestable | login/signup/OAuth/reset | 🔴 B3 |
| **DB schema + RLS + seed** | zero SQL | go-live | 🔴 B1/B5 |
| **DB-backed owner APIs** | in-memory Map / localStorage | properties, booking decisions, payouts, reviews | 🔴 B5/B6 |
| **Traveler data migration** | file-based dev store | production persistence | 🟠 B7 |
| **File storage (photos)** | local assets only | property photos, avatars | 🟠 B8 |
| **Payments** | labels only (InstaPay / Vodafone Cash strings) | checkout, payouts, wallet | 🟠 B9 |
| **Realtime** | none | messages, notifications push | 🟠 P |
| **Search** | static filters; Google Maps key unused | marketplace search | 🟠 P |
| **Email/SMS** | Supabase templates unconfigured | verification, reset, receipts | 🟠 B3 |
| **Admin backend** | read-only mock tables | moderation, user management | 🟠 P |
| **Audit logging / webhooks / rate limiting** | none | hardening | 🟡 P |

---

# 9. Backend Readiness Matrix (maps to Phase 4)

| B# | Item | Code state | Env state | Ready to ship? |
|---|---|---|---|---|
| B1 | Supabase project + env + schema + RLS | config gate ready | 🔒 missing | No |
| B2 | Mount middleware (`export const middleware = updateSession` in root `middleware.ts` + `config.matcher`) | function ready | needs B1 | No |
| B3 | Auth flows live | service + callback + cookie ready | needs B1 | No |
| B4 | Profiles | upsert + helpers ready | needs B1 | No |
| B5 | Replace mock data | read/write paths designed | needs B1 | No |
| B6 | DB-backed APIs | pattern proven in actions.ts | needs B1/B5 | No |
| B7 | Traveler data migration | devStore has full shape | needs B1 | No |
| B8 | Storage | none | needs B1 | No |
| B9 | Payments | none | needs B1 | No |

**The good news:** the architecture was built "backend-first on paper" — config gating, ownership checks, zod validation, SSR cookie handling, safe redirects, and the bypass strategy are all production-shaped. **The blocker is exclusively Phase 4 B1–B2:** create the project, mount the middleware, then everything downstream unlocks.

---

*Audit date: Aug 2026 · Companion docs: `FUNCTIONAL_AUDIT.md`, `UI_AUDIT.md`, `PROJECT_ROADMAP.md` (Phase 4 B1–B9), `PROJECT_CONTEXT.md` (auth/routing overview).*
