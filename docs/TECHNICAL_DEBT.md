# TECHNICAL DEBT — DAR App

> **Scope:** Debt across the merged four-portal codebase, categorized as requested: duplicate code, legacy code, dead code, hardcoded values, placeholder components, TODOs, performance issues, security concerns, refactoring opportunities.
> **Method:** Code searches (`TODO/FIXME/HACK`, `console.*`, inline styles, import graphs for suspect components, `lucide-react` vs `@/components/ui` icon usage, duplicated helper definitions, hardcoded dates/prices) cross-referenced with the verified findings of the five prior audits (UI, FUNCTIONAL, BACKEND, Owner, plus the docs).
> **Status legend:** 🔴 High · 🟠 Medium · 🟡 Low
> **Rules reminder (`DEVELOPMENT_RULES.md` §9):** **no refactoring during restoration.** This document is the *inventory*; each item cites the roadmap phase that will address it.

---

# 0. Evidence Base

| # | Finding | Verification |
|---|---|---|
| E1 | `addDays` defined **4×** | `app/home-client.tsx:23`, `app/properties/[slug]/property-details.tsx:37`, `app/hotels/[slug]/hotel-details-client.tsx:102`, `features/public-marketplace/property-details/components/BookingCard.tsx:283` |
| E2 | `getRoleDestination` defined **2×** | `features/authentication/services/authRedirects.ts:15` + private copy `lib/supabase/middleware.ts:21` |
| E3 | **2 class-merge utilities** | `lib/utils/cn.ts` (`cn`) vs `features/traveler/components/shared.tsx:40` (`cx`) |
| E4 | **Clone helpers duplicated** | `devStore.ts:18` `deepClone` vs `queries.ts` `cloneTravelerData` |
| E5 | **3 icon systems + inline SVGs** | `@/components/ui` (`*Icon` set, 60+ consumers), `lucide-react` (58 files), owner `<Icon name>` custom set + raw `<svg>` (edit-property, rejected, calendar) |
| E6 | **4 button systems** | `@/components/ui` `Button`/`ButtonLink`, traveler `shared.tsx` `Primary/Secondary/Danger/IconButton`, owner raw `owner-button-text` buttons, design-system `primitives.tsx` |
| E7 | **Logo duplication** | Unified `components/brand/dar-logo.tsx` + 2 compat wrappers (`traveler/DarLogo.tsx` "Kept for backward compatibility", `auth/BrandLogo.tsx` "backward compatibility") + raw `<Image src="/dar-logo-purple-header.png">` in 9 files + `/assets/images/dar-logo.png` (gallery/system-states) + `/dar-logo.svg` (design-system) |
| E8 | **6+ local toast implementations** | Shared `useToast`/`ToastProvider` (traveler) + local `setToast`/`notify()`/`toastOpen` in owner verification, payouts, publish, public-owner-profile, booking-flow, request-received |
| E9 | `add-property-actions.tsx` **dead** | Exported `AddPropertyActions`, **0 import matches** |
| E10 | `components/forms/index.ts` **dead** | File is literally `export {};` — 0 imports |
| E11 | `updateSession` **dead** | No root `middleware.ts`; 0 references outside `lib/supabase/middleware.ts` |
| E12 | Only **1 explicit TODO** in the codebase | `lib/dar-data.ts:2` "// TODO: Replace with real API data when backend is connected" |
| E13 | `console.warn/info` only, dev-gated | `authErrors.ts:143`, `queries.ts` (logs once) |
| E14 | **Hardcoded dates/prices** pervasive | ~12 files default `"2026-05-20"`; dashboard/host-landing/payouts EGP arrays; `REFERENCE_DATE = new Date("2026-07-22T12:00:00Z")` (users workspace); `INV-2026-58291` (invoice) |
| E15 | **4 purple families** | `#5522d9` owner · `#6C3DFF` marketplace · `#5F36E9` hotels/checkout · `#5631d8` `--brand` (+ host-landing `#7c4dff`/`#7e40ff`) |
| E16 | Inline-style usage | 40 `style={{…}}` matches, heaviest in `host-landing-page.tsx` (8) + dashboard buttons (`fontSize: 9`) |

---

# 1. Duplicate Code

| # | Duplicate | Where | Impact | Fix target |
|---|---|---|---|---|
| D1 | `addDays(date, days)` — identical helper ×4 | home-client, property-details, hotel-details-client, marketplace BookingCard | Drift risk (one file can diverge); pointless repetition | 🔴 Extract to `lib/utils/date.ts` |
| D2 | `getRoleDestination` ×2 | authRedirects.ts + private copy in middleware.ts | Same logic, two homes; middleware copy can't use the typed version | 🟠 Import from `authRedirects` |
| D3 | **Open-redirect guard ×2** | `authRedirects.getSafeRedirect` + separate `getSafeRedirect` in `app/auth/callback/route.ts` | Security logic duplicated with different signatures — a fix to one won't land in the other | 🔴 Single shared guard |
| D4 | `cn` vs `cx` class-mergers | `lib/utils/cn.ts` vs traveler `shared.tsx` | Two identical utilities; inconsistent imports | 🟠 Adopt one (U3) |
| D5 | `deepClone` vs `cloneTravelerData` | devStore.ts vs queries.ts | Same JSON-clone idea twice | 🟡 Consolidate |
| D6 | **Owner sidebar reimplemented in every page** | `owner-shell.tsx` + inline `Sidebar()` in seasonal-pricing, calendar-management, edit-property (each with its own nav arrays/active state) | 4+ sidebar variants drift independently (link targets already differ: `calendar` vs `calendar-management` vs `request-decision`) | 🔴 Extract one `OwnerSidebar` (U3) |
| D7 | **Toast systems** | shared `useToast` + local toasts in verification, payouts, publish, public-owner-profile, booking-flow, request-received | Inconsistent UX (different dismiss timers, styles, APIs) | 🟠 Consolidate to `useToast` (U5) |
| D8 | Mock profile "Ahmed Hassan" | dev bypass, verification page, owner headers (ahmed.hassan@example.com, +20 101 234 5678) | Identity data duplicated across mock sources | 🟠 Centralize mock identity |
| D9 | Booking date defaults | `"2026-05-20"/"2026-05-25"` hardcoded in ~12 booking/hotel files | Change one, miss the others | 🟠 Constants module (§5) |

---

# 2. Legacy Code

Explicit in-code markers of inherited/obsolete code:

| # | Item | Location | Marker/Reason | Status |
|---|---|---|---|---|
| L1 | `*Icon` icon barrel | `components/ui/index.tsx:31` | Comment: *"New code should import from lucide-react directly"* | 🟠 legacy shim, still 60+ consumers |
| L2 | `ButtonLink` | `components/ui/index.tsx:208` | Comment: *"needed by Renad's legacy owner portal components"* | 🟠 kept for host-landing only |
| L3 | Traveler `DarLogo` wrapper | `features/traveler/components/DarLogo.tsx` | *"Kept for backward compatibility; delegates"* | 🟡 remove after U1 |
| L4 | Auth `BrandLogo` wrapper | `features/authentication/components/BrandLogo.tsx` | *"Kept for backward compatibility; delegates"* | 🟡 remove after U1 |
| L5 | Guest dashboard | `app/(dashboard)/dashboard/page.tsx` | Legacy guest dashboard; currently the **wrong** `/owner` redirect target (audit F1) | 🟠 restore/replace (Phase 2 F1) |
| L6 | Supabase README stub | `lib/supabase/README.md` | "will be added here when…" — no longer accurate (helpers exist) | 🟡 update |
| L7 | Route-group README stubs | `app/(auth)/README.md`, `(dashboard)/README.md`, `(public)/README.md` | Empty/informational leftovers | 🟡 |
| L8 | Dev-bypass stack | `devAuthBypass.ts`, `devStore.ts`, queries.ts, actions.ts | All marked *"TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS"* | 🔴 tracked — must be removed before Phase 5 (B7) |

---

# 3. Dead Code

Verified unreachable/unused (all by import-graph search):

| # | Item | Location | Proof | Priority |
|---|---|---|---|---|
| DC1 | `AddPropertyActions` | `components/owner/add-property-actions.tsx` | Exported, **0 imports**; the `/add-property` page is a static mock that never renders it | 🔴 Remove or wire (Phase 2 F2) |
| DC2 | `components/forms/index.ts` | `components/forms/` | Literally `export {};`, **0 imports** | 🟡 Delete (quick-win U6) |
| DC3 | `updateSession` middleware | `lib/supabase/middleware.ts` | Fully written, **unmounted**, 0 references | 🔴 Mount it (Phase 4 B2) — currently inert rather than dead |
| DC4 | `signOut` server helper | `lib/supabase/auth.ts` | Exported; auth pages use the service's `logout()` — no server consumer found | 🟡 Verify + remove/use |
| DC5 | Duplicate raw logo assets in use | `/dar-logo-purple-header.png` (9 files), `/dar-logo.svg` (design-system), `/assets/images/dar-logo.png` (gallery/system-states) | Parallel to the unified `DAR_LOGO_ASSETS` | 🟠 Consolidate (U1) |

---

# 4. Hardcoded Values

| # | Category | Examples | Risk | Priority |
|---|---|---|---|---|
| H1 | **Dates** | `"2026-05-20"`, `"2026-05-22"`, `"2026-07-08"` defaults in ~12 files; checkout "May 20, 2026"; `REFERENCE_DATE` in users workspace; static "Due May 26, 2026" timeline | Stale demo data shipped to real users; booking flow can break when the demo dates pass (invoice/payment dates static) | 🔴 Replace with dynamic defaults (today ± n days) |
| H2 | **Prices/amounts** | Dashboard arrays (`EGP 18,950`, `6,370`…), host-landing (`24,000–38,000`, `48,750`), payouts stats (`24,800`, `286,700`) | Mock figures presented as live data | 🟠 Move to mock data modules (U4) |
| H3 | **Colors** | 4 purple families (E15) + inline `bg-[#5522d9]` etc. across owner pages | DS drift; brand changes need multi-file edits | 🟠 Token adoption (U2) |
| H4 | **Inline styles** | host-landing 8 usages (`fontSize: 9…`), dashboard buttons, calendar legends | Bypasses Tailwind, prevents tokens/optimization | 🟡 Convert to classes |
| H5 | **localStorage keys** | `dar-owner-*`, `dar-saved-<slug>`, `dar-pending-booking`, `dar-seasonal-pricing:<id>`, `dar-owner-verification` | String literals scattered; typos silently break state | 🟠 Constants module (`lib/constants/storage.ts`) |
| H6 | **Invoice numbers** | `"INV-2026-58291"` literal in `app/booking/invoice/page.tsx:66` | Collisions/duplicates | 🟠 Generate dynamically |
| H7 | **Mock identity** | Ahmed Hassan profile across dev bypass + owner pages | Duplication (D8) | 🟠 Centralize |

---

# 5. Placeholder Components

| # | Placeholder | Location | Current behavior | Fix target |
|---|---|---|---|---|
| P1 | **Add Property mock** | `app/add-property/page.tsx` | 0 inputs, 6 inert buttons, static preview (audit F2) | 🔴 Phase 2 F2 |
| P2 | Contact form | `app/contact/page.tsx` | Submits nowhere | 🟠 Phase 3/5 |
| P3 | Help search | `app/help/page.tsx` | Visual-only search | 🟠 Phase 3/5 |
| P4 | Checkout upload + promo | `app/checkout/page.tsx` | Receipt upload and promo are visual-only | 🟠 Phase 4 B9 |
| P5 | Traveler preview toasts | SavedProperties ("Filters preview", "Map preview"), BookingDetails ("Manage booking"), Notifications ("Notification settings" preview toast) | Explicit `showToast` placeholders until wiring exists | 🟠 Phase 3/4 |
| P6 | MapPanel | marketplace search | Google Maps key unset → map degraded | 🟠 Phase 3/5 |
| P7 | Host-landing widgets | `components/host-landing/host-landing-page.tsx` | Decorative stats/earnings cards with `href="#"` | 🟠 Phase 2/3 |
| P8 | Admin "View all" links | overview/reports/properties cards | `href="#"` | 🟡 Phase 3 |

---

# 6. TODOs

| # | Marker | Location | Type | Action |
|---|---|---|---|---|
| T1 | `// TODO: Replace with real API data when backend is connected` | `lib/dar-data.ts:2` | The only explicit TODO | Tracked by Phase 4 B5 |
| T2 | `TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS` | devAuthBypass.ts, devStore.ts, queries.ts, actions.ts | Temporary markers, **must not ship** | Tracked by Phase 4 B7; add a grep check to CI when introduced (Phase 5 P7) |

**Good news:** the codebase is otherwise **clean** — no stray `FIXME`/`HACK`, no leftover `console.log` (the two `console.warn/info` calls are dev-gated), no `debugger`.

---

# 7. Performance Issues

| # | Issue | Location | Impact | Priority |
|---|---|---|---|---|
| PF1 | **Huge client components, no lazy sections** | `checkout/page.tsx` (~700 lines), `booking/booking-flow.tsx` (~830), dashboard, payouts — all `"use client"` | Large initial JS + long hydration per route | 🟠 Split into server components + `next/dynamic` where safe (Phase 3, after restoration) |
| PF2 | **In-memory table filtering without debounce** | users/properties/admin workspaces `updateFilter` on keystroke | Re-renders whole tables per keystroke | 🟡 Debounce + `useMemo` |
| PF3 | Remote image dependency | `CountrySelect.tsx` → `flagcdn.com/w40/…` | Runtime network dependency; offline/CI failures | 🟡 Bundle flags or self-host |
| PF4 | Unset map key still loading map module | marketplace `MapPanel.tsx` | Wasted bundle/requests until B1 | 🟠 Gate behind config |
| PF5 | Dev-store file I/O | `devStore.ts` | One read per server action burst (memory-cached — OK); reset rewrites whole file | 🟢 acceptable; monitor in B7 |
| PF6 | Multiple `priority` images per page | booking/dashboard headers | `next/image` `priority` on several images per viewport can defer real LCP images | 🟡 audit `priority` flags |
| ✅ | **LCP handled** | hero (`loading="eager"` + `fetchPriority="high"`), hotels first-card eager | Console LCP warnings silenced | done |

---

# 8. Security Concerns

Full analysis in `BACKEND_AUDIT.md` §7 — summarized debt items here:

| # | Concern | Severity | Debt nature |
|---|---|---|---|
| S1 | Route protection **inert** (middleware unmounted) | 🔴 | Dead code that should be live (DC3) |
| S2 | **No RLS / zero SQL** | 🔴 | Missing foundational security (B1) |
| S3 | Owner status API **unauthenticated**, unvalidated id | 🔴 | Hardened in Phase 4 B6 |
| S4 | `NEXT_PUBLIC_DEV_AUTH_BYPASS` client-visible | 🟠 | Mitigated by `NODE_ENV` gate; flag must be removed (L8) |
| S5 | No rate limiting on auth forms | 🟠 | Supabase provides once configured |
| S6 | `window.confirm`/`prompt` on owner pages (seasonal-pricing, photos, rejected) | 🟡 | UX + trust debt (FUNCTIONAL_AUDIT §3) |
| S7 | Booking/saved data in `sessionStorage`/`localStorage` | 🟡 | Fine for mock data; must not hold PII later (B7) |
| ✅ | Open-redirect guards, httpOnly recovery cookie, ownership-scoped actions | — | Already sound (BACKEND_AUDIT §7.2) |

---

# 9. Refactoring Opportunities (prioritized)

Ordered by roadmap alignment (U-items = Phase 3 Unification; quick-win lane can start immediately per `PROJECT_ROADMAP.md` §9).

### 🔴 High — quick wins + correctness
1. **Extract `addDays` + date defaults** → `lib/utils/date.ts` (D1, D9, H1) — also stops the booking-flow date rot.
2. **Single `getSafeRedirect`** shared by callback + auth service (D3) — security-critical duplication.
3. **Mount the middleware** (DC3 → Phase 4 B2) — turns dead code into the app's main security layer.
4. **Remove or wire `AddPropertyActions`** (DC1 → Phase 2 F2) — dead component + dead UI in one sweep.
5. **One `OwnerSidebar`** component (D6) — 4 drifting variants, some with wrong link targets.

### 🟠 Medium — Phase 3 Unification (U1–U7)
6. **Logo consolidation (U1)** — finish what the compat wrappers started: replace the 9 raw `<Image src="/dar-logo-purple-header.png">` usages and the 2 alternate assets with `DarLogo`, then delete wrappers (L3/L4, DC5).
7. **Token adoption (U2)** — collapse the 4 purple families onto CSS variables (H3).
8. **Component promotion (U3)** — merge button systems (E6), class-mergers (D4), clone helpers (D5) into the design system.
9. **Data-source unification (U4)** — one mock dataset + central identity (H2, H7, D8).
10. **Single toast (U5)** — adopt `useToast` everywhere (D7).
11. **Dead-SVG/empty-barrel cleanup (U6)** — delete `components/forms/index.ts` (DC2), prune unused assets.
12. **CSS vocabulary (U7)** — normalize `owner-*` classes vs tokens.
13. **Storage-key constants + dynamic invoice IDs** (H5, H6).

### 🟡 Low — polish
14. Convert inline styles to classes (H4), debounce admin filters (PF2), audit `priority` flags (PF6), update the Supabase README (L6).

---

# 10. Debt Summary Table

| Category | 🔴 High | 🟠 Medium | 🟡 Low |
|---|---|---|---|
| Duplicate code | D1, D3, D6 | D2, D4, D7, D8, D9 | D5 |
| Legacy code | L8 | L1, L2, L5 | L3, L4, L6, L7 |
| Dead code | DC1, DC3 | DC5 | DC2, DC4 |
| Hardcoded | H1 | H2, H3, H5, H6, H7 | H4 |
| Placeholders | P1 | P2–P7 | P8 |
| TODOs | T2 | — | T1 |
| Performance | — | PF1, PF4 | PF2, PF3, PF6 |
| Security | S1, S2, S3 | S4, S5 | S6, S7 |
| Refactoring | 1–5 | 6–13 | 14 |

**Biggest levers:** (1) the 4 purple families + logo/icon/button duplication are pure merge residue that Phase 3 U1–U7 targets directly; (2) the dead-but-critical middleware (DC3/S1) is one file away from becoming the security foundation; (3) the hardcoded 2026 dates (H1) are the most user-visible debt once the demo ages.

---

*Audit date: Aug 2026 · Companion docs: `BACKEND_AUDIT.md` (security detail), `FUNCTIONAL_AUDIT.md`, `UI_AUDIT.md`, `PROJECT_ROADMAP.md` (Phase 2 F·, Phase 3 U1–U7, Phase 4 B·), `DEVELOPMENT_RULES.md` §9 (no refactoring until restoration approved).*
