# DAR App — PROJECT_ROADMAP.md

> **The execution plan for the DAR App.** Divides the project into phases and sprints with priorities, estimated order, and dependencies.
>
> Companion docs: `PROJECT_CONTEXT.md` (status & architecture), `FEATURES_DOCUMENTATION.md` (feature inventory), `DEVELOPMENT_RULES.md` (how to work), plus the **Owner Portal Functional Audit** (the 20-section report delivered during restoration).

---

## 1. Where We Are

| Fact | Value |
|---|---|
| **Current phase** | **Phase 1 — Restoration** (in progress) |
| Current sub-stage | Owner Portal restored + audited; **audit fixes not yet started** |
| Completed | Owner Portal restoration, LCP/perf fixes, Owner Portal audit, project docs (`PROJECT_CONTEXT`, `FEATURES_DOCUMENTATION`, `DEVELOPMENT_RULES`) |
| Repo state | Single `Initial commit` on `main`; 39 files carry uncommitted restoration changes; no branches |
| Blocking reality | Supabase env vars are placeholders → auth and backend are **not live**; auth middleware is **not mounted** |

**North-star order of work:** Original Developer UI → Functional Accuracy → Design System → Refactoring. **Restoration and audit fixes come before any refactoring or redesign.**

---

## 2. Phase Overview & Dependencies

```
Phase 1: Restoration ──► Phase 2: Functional Fixes ──► Phase 3: Unification ──► Phase 4: Backend ──► Phase 5: Product & Hardening
      (audit + restore)        (fix audit findings)        (design system)        (Supabase/API)        (features, tests, launch)
           │                        │                          │                      │                      │
           ▼                        ▼                          ▼                      ▼                      ▼
   approvals gate  ──────►  per-feature gates  ──────►  visual-parity gate ──►  auth/data gate ──►  release gate
```

**Hard dependencies:**
- Phase 2 depends on Phase 1 (you can't fix a page that isn't restored/approved).
- Phase 3 (design-system unification) depends on Phases 1–2 (rule: only swap components when visually identical, after restorations are approved).
- Phase 4 (backend) can start **in parallel** with Phase 3 (different teams/areas), but the auth/data layer must exist before Phase 5 features.
- Phase 5 depends on Phase 4 (real features need real data/auth).

**Soft dependencies / parallelizable:**
- Marketplace, Traveler, and Admin audits (Phase 1 sprints 2–4) are independent of each other.
- Dev tooling (CI, tests scaffold) can be added at any point.

---

## 3. Phase 1 — Restoration (CURRENT)

**Goal:** every page matches its original developer implementation, approved one page at a time.
**Source of truth:** `D:\negmtech company\PROJECTS DESIGN\DAR APP\<developer>\...` workspaces.

| Sprint | Scope | Owner | Gate / Exit criteria |
|---|---|---|---|
| **1.1** ✅ Done | Owner Portal restore + audit | Renad / merged repo | Byte-identical restore, 13 routes 200, typecheck green, audit delivered |
| **1.2** 🔄 Next | **Owner audit fixes** (High-priority items) — see §4 | Renad area | Real owner dashboard; working Add Property; working Approve/Decline; mobile nav; user approval |
| **1.3** | **Marketplace audit + restore** (home, search, hotels, property details/gallery, saved/favorites, share, legal/help/contact, become-a-host) | Omar | Per-page original diff + approval |
| **1.4** | **Booking Flow + Traveler audit + restore** (booking steps, checkout, traveler pages) | Menna | Per-page original diff + approval |
| **1.5** | **Admin Console audit + restore** (overview, properties, users, bookings, reports) | Fatma | Per-page original diff + approval |
| **1.6** | **Cross-section consistency pass** | All | Saved/favorites unified decision, persona consistency, date/currency/year alignment |

**Order rationale:** Owner portal is already restored and audited → cheapest to fix first (1.2). Then audit the sections with the highest user-visible surface (Marketplace 1.3, Booking/Traveler 1.4), then Admin (1.5 — internal tool, lowest visibility).

---

## 4. Phase 2 — Functional Fixes (after each section's restoration)

**Goal:** make everything work, not just look right. **Phase 2 is a per-section recurring activity, not a monolithic phase**: its first iteration runs inside Sprint 1.2 (owner fixes, below), and each later section's fixes run right after that section's Phase 1 approval (Sprints 1.3–1.5 gates). The F1–F11 table below is the canonical home of the owner fix list; §3's Sprint 1.2 row points here.

### 4.1 Owner Portal High-Priority Fixes (Phase 2, first iteration — runs in Sprint 1.2)

| # | Fix | Why | Effort |
|---|---|---|---|
| F1 | Build a **real owner dashboard** (occupancy, revenue, booking requests, payouts snapshot); stop `/owner` → guest dashboard redirect | Currently lands owners on a traveler dashboard | L |
| F2 | Make **Add Property functional** — wire `AddPropertyActions` (built but unused) or real form state; replace placeholder fields with inputs | Page is 100% static mock | L |
| F3 | Fix **Approve/Decline booking decision** — persist decision, show confirmation, update list | Currently navigates to the same page (no-op) | M |
| F4 | **Mobile nav** for OwnerShell pages (bottom bar like other flows) | Shell sidebar hidden <900px with no fallback | M |
| F5 | **Payouts date filter** actually filters | Currently state-only | S |
| F6 | **Message quick-chips** insert text into textarea | Currently dead | S |
| F7 | **Unify owner persona** (Ahmed Hassan) across dashboard + owner pages | Two identities in one portal | M |
| F8 | Wire `href="#"` links (dashboard view-alls, tips, "Find a new stay") | Dead links | S |
| F9 | Calendar Week/Day/List views real or removed; real property-selector dropdowns | Fake controls | M |
| F10 | Modal Escape/outside-click + `role="dialog"` (payouts modals, schedule dialog) | a11y + UX | S |
| F11 | Real date picker (payouts); verification readonly fields clarified; table sorting | Data-entry polish | M |

*Effort: S = ~0.5–1d, M = ~1–3d, L = ~3–5d (single developer).*

### 4.2 Marketplace / Booking / Traveler / Admin fixes
- Execute the same High → Medium → Low triage from each section's audit after restoration.
- Booking Flow: server persistence + real payment adapter (moves to Phase 4 when backend lands).
- Traveler: replace dev-only file store with Supabase tables (Phase 4); until then keep dev bypass.

---

## 5. Phase 3 — Unification (after Phases 1–2)

**Goal:** one design system, one logo, one data layer — without changing appearance.

| # | Work | Depends on | Notes |
|---|---|---|---|
| U1 | Consolidate 3 logo components (`DarLogo`, auth `BrandLogo`, marketplace header logos) | Phase 1 | Must render identically |
| U2 | Adopt `--brand` tokens where color-equivalent; document restored-hex exceptions (owner `#5522d9` family) | Phase 1–2 | Visual parity gate |
| U3 | Promote proven-shared components to `components/ui` + `components/shared` | Phase 2 approvals | Render-identical swaps only |
| U4 | Unify data sources: hardcoded arrays → `lib/dar-data.ts` / feature data files | Phase 1–2 | Fix cross-page inconsistencies (saved/favorites, bookings, payouts) |
| U5 | Single toast implementation (system-states vs traveler shared) | Phase 2 | Pick one |
| U6 | Remove orphaned `.svg` placeholders in `public/` | Phase 1 | Safe cleanup |
| U7 | Unify `owner-*` CSS vocabulary with tokens (post-restoration) | Phase 2 | Keep visual parity |

---

## 6. Phase 4 — Backend (Supabase)

**Goal:** real auth + data. Can run in parallel with Phase 3.

| # | Work | Priority | Notes |
|---|---|---|---|
| B1 | **Create the real Supabase project** and set env vars (`.env.local` from `.env.example` template) | 🔴 Blocking | Unlocks everything |
| B2 | **Mount auth middleware** — root `middleware.ts` exporting `updateSession` from `lib/supabase/middleware.ts` | 🔴 High | Route protection + role redirects currently inert |
| B3 | Auth flows live: email signup/login, OAuth, password reset, email verification (`/auth/callback` already scaffolded) | High | Remove dev auth bypass at the end |
| B4 | `profiles` table + `account_type` gating for owner/admin | High | Already referenced by `requireRole` |
| B5 | Replace mock data: properties, bookings, payouts, reviews tables + queries | High | `lib/dar-data.ts` → real queries |
| B6 | Replace in-memory API (`/api/owner/properties/[id]/submit`) with DB-backed status flow | Medium | Also add approve/reject endpoints; decide fate of the dev-only `/api/dev/traveler/reset` route (keep for E2E seed or remove for prod) |
| B7 | Traveler data: move devStore file-backed store → Supabase tables | Medium | Keep dev seed for E2E |
| B8 | File uploads (property photos, verification docs, receipts) → Supabase Storage | Medium | Replace `localStorage` photo persistence |
| B9 | Real payments (Paymob/Fawry/Vodafone Cash/InstaPay integration or gateway sandbox) | Later | Big item; after data layer stable |

**Dependency:** B1 → B2 → B3/B4 → B5–B8 → B9. B2–B4 can proceed as soon as B1 is done.

---

## 7. Phase 5 — Product & Hardening

**Goal:** a shippable product with quality gates.

| # | Work | Priority |
|---|---|---|
| P1 | Owner analytics page (sidebar item exists, no page) | High |
| P2 | Notifications dropdown (bells everywhere, no dropdown) | Medium |
| P3 | Real messaging (owner ↔ guest conversations) | High |
| P4 | Search/filter/pagination on marketplace + owner lists | Medium |
| P5 | Settings/Profile forms with persistence | Medium |
| P6 | Help Center content + support tickets (guest-facing) | Low |
| P7 | Test suite: unit tests per feature (vitest), E2E smoke (Playwright) | High (scaffold early, grow later) |
| P8 | CI/CD: typecheck + lint + build + test gates on PR; preview deploys | High |
| P9 | Error boundaries, loading skeletons, analytics instrumentation | Medium |
| P10 | SEO/metadata polish, i18n readiness (locale helpers exist) | Low |
| P11 | Production hardening: remove dev bypass, env audits, security review, performance budget | Release gate |
| P12 | Staging + production environments, monitoring (Sentry) | Release gate |

---

## 8. Priorities (overall)

| Rank | Priority | Where |
|---|---|---|
| 1 | Restore every page to original (one at a time, approved) | Phase 1 |
| 2 | Fix the Owner Portal High-priority audit findings | Phase 1.2 / 2 |
| 3 | Get auth + middleware live (unblock everything) | Phase 4 (B1–B3) — start as soon as team capacity allows |
| 4 | Marketplace + Traveler + Admin restoration & fixes | Phase 1.3–1.5 |
| 5 | Design-system unification (post-approval) | Phase 3 |
| 6 | Backend data layer | Phase 4 |
| 7 | Product features, tests, CI, release | Phase 5 |

---

## 9. Estimated Order of Implementation

```
Now
 ├─ Sprint 1.2: Owner audit fixes (F1–F7)           ← we are here
 ├─ Sprint 1.3: Marketplace audit + restore
 ├─ Sprint 1.4: Booking + Traveler audit + restore
 ├─ Sprint 1.5: Admin audit + restore
 ├─ Sprint 1.6: Cross-section consistency
 ├─ Phase 2: functional fixes per section (incl. F8–F11)
 ├─ Phase 3: unification (U1–U7)
 ├─ Phase 4: backend (B1 → B2 → B3/B4 → B5–B8 → B9)  ← parallel with Phase 3
 └─ Phase 5: product & hardening (P1–P12)
```

**Quick-win lane (can start immediately, independent):** B2 (mount middleware — small, unblocks dev testing of route guards), U6 (remove dead SVGs), P7/P8 (CI scaffold) — all doable without waiting on restoration approvals.

---

## 10. Dependencies Between Phases (summary)

| Phase | Depends on | Cannot start before |
|---|---|---|
| 1.2 (owner fixes) | 1.1 (done) | — |
| 1.3 / 1.4 / 1.5 | — (independent) | Each other's approvals (parallelizable) |
| 2 (section fixes) | That section's Phase 1 approval | Per-section |
| 3 (unification) | 1 + 2 (all restorations approved) | Phase 2 completion |
| 4 (backend) | Only B1 (Supabase project); rest of Phase 4 sequential | Can overlap Phase 3 |
| 5 (product/hardening) | Phase 4 (auth + data) | Backend data layer |

---

## 11. Definition of "Phase Complete"

A phase is complete when:
- All sprints in it are done per their exit criteria.
- `npx tsc --noEmit` and `npm run lint` pass.
- Restorations have **user approval** (visual parity verified).
- Docs updated: `PROJECT_CONTEXT.md`, `FEATURES_DOCUMENTATION.md`, and this roadmap's status marks.

---

*Generated August 2026. Update the ✅/🔄 marks as sprints complete; re-estimate sprints when scope changes.*
