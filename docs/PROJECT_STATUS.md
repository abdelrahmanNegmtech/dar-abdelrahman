# DAR Project Status

> **The single source of truth for the current state of the DAR project.** Open this file first to understand where the project stands. It is updated after every sprint; do the same when you complete work.
>
> Related docs: [`INDEX.md`](./INDEX.md) (hub) · [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) (plan) · [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) (issue tracker) · [`CHANGELOG.md`](../CHANGELOG.md) (history)

---

**Last Updated:** August 5, 2026

**Current Version:** `0.1.0` (pre-release; single `Initial commit`, working tree carries all restoration/documentation work — uncommitted)

**Current Phase:** Phase 1 — Restoration (see `PROJECT_ROADMAP.md`)

**Current Sprint:** Sprint 1.2 — Owner Portal Functional Fixes *(planned; awaiting priority approval — no fixes implemented yet)*

**Project Completion:** **~35%** *(estimate: UI/mock layer for all four portals is largely present, the Owner Portal section of Phase 1 is done, three portal restorations + the entire backend remain)*

---

## Project Overview

- **What:** DAR is a Next.js 16 web application for premium short- and long-term stays in Egypt — a booking marketplace (Airbnb-style) localized for Egyptian guests and property owners, with three portals: Public Marketplace, Owner Portal (host), and Admin Console, plus a Traveler Dashboard.
- **Current stage:** Pre-production demo / design prototype. All data is mock data; the Supabase backend is scaffolded but **not connected**.
- **Overall objective:** Restore every portal to its original developer implementation → fix functional gaps → unify the design system → connect the real backend → ship a tested, deployable product.
- **Current priorities:**
  1. Execute the Owner Portal audit fixes (real dashboard, functional Add Property, working booking decisions, mobile nav, dead-link sweep).
  2. Restore the remaining sections: Marketplace (Omar), Booking + Traveler (Menna), Admin (Fatma).
  3. Connect Supabase and mount the auth middleware.
  4. Unify the design system — only after restorations are approved.

---

## Current Progress

### ✅ Completed
- Four developer workspaces merged into one repository (outside git).
- GitHub repository created (`github.com/abdelrahmanNegmtech/dar-ui`); initial commit `71880ce`.
- **Owner Portal restored** to Renad's original implementation (shell, routes, tokens, CSS vocabulary, assets).
- Owner routes dropped during the merge restored: `/owner/messages`, `/owner/reviews`, `/owner/settings`, `/owner/properties/drafts`.
- Public owner profile route `/owners/[ownerId]`.
- Shared mock data layer (`lib/dar-data.ts`); Supabase SSR helper scaffold; temporary dev auth bypass.
- Next.js 16 build fixes (`images.qualities`); LCP warnings silenced on hero images; typecheck clean.
- Owner Portal Functional Audit delivered (20 sections).
- **Complete documentation set** in `docs/` (context, roadmap, rules, features, four audits, issue tracker, changelog, status).

### 🟡 In Progress
- **Sprint 1.2 planning** — Owner Portal audit fixes scoped but not started (awaiting approval).
- Design-system unification groundwork (audits identify U1–U7 items; no code changed yet).

### ⏳ Planned
- Restoration of Marketplace, Booking + Traveler, Admin (Phase 1 sprints 1.3–1.5).
- Design unification (Phase 3, U1–U7).
- Supabase backend end-to-end (Phase 4, B1–B9).
- Testing, CI/CD, security hardening, deployment (Phase 5, P1–P12).

### 🚫 Blocked
- Authentication & all Supabase data paths — blocked on real credentials (B1).
- Route-protection enforcement — blocked on middleware mounting + credentials (B2).
- Database work — blocked on B1 (no schema exists yet).

---

## Completed Milestones

Only completed, verified milestones:

1. **Initial project merge** — four developer workspaces (Omar, Menna, Renad, Fatma) merged into one repo.
2. **GitHub repository created** — `dar-ui` on GitHub (`origin` remote), initial commit `71880ce` (2026-08-04).
3. **Owner Portal restoration** — routes, shell, color tokens, typography, CSS classes, assets, `owner-routes.ts`, `profile-avatar.tsx`, `add-property-actions.tsx`, `/owners/[ownerId]`.
4. **Restored owner routes** — `/owner/messages`, `/owner/reviews`, `/owner/settings`, `/owner/properties/drafts`.
5. **Mock data layer** — `lib/dar-data.ts` (owners, properties, payouts, bookings).
6. **Supabase SSR scaffold** — client/server clients, auth helpers, config validation, middleware logic.
7. **Next.js 16 compatibility fixes** — `images.qualities` config; `loading="eager"` + `fetchPriority="high"` on hero images.
8. **Owner Portal Functional Audit** — 20-section report delivered.
9. **Documentation set** — `docs/INDEX.md` hub, context, roadmap, rules, features doc, four audits, `KNOWN_ISSUES.md`, `CHANGELOG.md`, this file.
10. **Shared components + design-system kit integrated** — `components/ui/*`, unified `DarLogo`, `system-states` primitives, `features/design-system/*` (admin-side).

> **Not yet done (do not mark complete):** branch strategy (documented only — `main` is still the only branch), Traveler/Booking/Admin restorations, design-system *unification* (the kit exists; unify is Phase 3), Supabase connection, testing.

---

## Current Sprint

| Field | Value |
|---|---|
| **Sprint Name** | 1.2 — Owner Portal Functional Fixes |
| **Sprint Goal** | Resolve the highest-priority Owner Portal audit findings so owners have a working product |
| **Sprint Scope** | F1 real owner dashboard · F2 functional Add Property · F3 working Approve/Decline · F4 mobile nav on OwnerShell · F5 payouts date filter · F6 message quick-chips · F7 dead-link sweep · quick-win lane (dead barrels, stub READMEs, date constants) |
| **Assigned Features** | Owner Portal (Renad's section) |
| **Current Progress** | 0% — planned, awaiting approval of audit priorities |
| **Open Tasks** | All F1–F7 items (see `KNOWN_ISSUES.md` KI-005, KI-006, KI-007, KI-010, KI-011, KI-012, KI-013, KI-042, KI-043) |
| **Completed Tasks** | None yet |
| **Blocked Tasks** | None (all Sprint 1.2 work is credential-independent) |

---

## Feature Status

| Feature | Status | Progress | Notes |
|---|---|---|---|
| Public Marketplace | Not Started | UI merged as-is | Not yet restored/audited against Omar's workspace; dead links, search wiring gaps |
| Authentication | Blocked | Code 100%, live 0% | All 8 flows + callback complete; no Supabase credentials |
| Booking Flow | Not Started | UI merged as-is | Flow + state pages work on mock data; validation gaps (KI-018, KI-015) |
| Traveler Portal | Review | — | Best-responsive shell; works via dev bypass; 8 actions lose data in dev (KI-008) |
| Owner Portal | Review | Restored + audited | Fixes pending (Sprint 1.2); no real dashboard, static add-property, no-op decisions |
| Admin Dashboard | Not Started | Read-only mock | No CRUD, no moderation (KI-021) |
| Shared Components | In Progress | Integrated, duplicated | `components/ui`, `DarLogo`, system-states; 3 icon sets, 2 class-mergers, 6 toasts |
| Design System | In Progress | Kit exists | Unification (tokens/logos/icons) is Phase 3 U1–U7 |
| Routing | In Progress | Restored + helpers | Owner routes restored; ~29 `href="#"` dead links remain (KI-010) |
| Backend | Blocked | Scaffolded | In-memory API + server actions; no live backend (B1–B9) |
| Supabase | Blocked | Scaffolded | Helpers + middleware written; not connected |
| Testing | Not Started | 0% | No test suite, no CI (KI-045) |
| Security | Blocked | No protection | Middleware unmounted, no RLS, unauthenticated API (KI-002, KI-003, KI-004) |
| Performance | In Progress | LCP done | Hero LCP fixed; heavy client pages, undebounced filters remain (KI-037, KI-038) |
| Deployment | Not Started | 0% | No staging, no CI/CD |

---

## Developer Assignments

| Role | Name | Current Feature | Notes |
|---|---|---|---|
| Team Lead | *(not assigned)* | — | — |
| Developer — Marketplace + Auth | Omar | Public Marketplace + Authentication | Restoration of his section pending (Phase 1, sprint 1.3) |
| Developer — Booking + Traveler | Menna | Booking Flow + Traveler Dashboard | Restoration pending (sprint 1.4) |
| Developer — Owner Portal | Renad | Owner Portal | ✅ Restored; audit fixes pending (sprint 1.2) |
| Developer — Admin | Fatma | Admin Dashboard | Restoration pending (sprint 1.5) |

*Ownership per the four developer workspaces; see `PROJECT_CONTEXT.md` §8 for workspace paths.*

---

## Current Blockers

1. **Supabase credentials missing** — blocks authentication, all database work, and real route protection (KI-001, KI-003).
2. **Audit-fix approval pending** — Sprint 1.2 items (F1–F7) are scoped but not approved/started.
3. **No database schema** — zero SQL; nothing to run against a real project (KI-003).
4. **Middleware unmounted** — route protection inert (KI-002).
5. **Restoration source access** — remaining sections need the original developer workspaces as reference (available, but each restore must be approved page-by-page).

---

## Known Risks

- **Merge inconsistencies** — four independent mock datasets cause cross-portal data drift (KI-009).
- **Placeholder/mock data everywhere** — pages hardcode arrays; hardcoded 2026 dates will age (KI-036).
- **No production backend** — the entire product runs on mock data + localStorage + one in-memory API.
- **Incomplete authentication** — auth is code-complete but untestable live; session/security behavior unproven.
- **Uncommitted working tree** — restoration + docs live in the working tree on a single commit; no git safety net for this work.
- **Dev auth bypass could ship** — `NEXT_PUBLIC_DEV_AUTH_BYPASS` must be removed before production (KI-035).
- **No testing** — regressions only caught by typecheck/lint/manual review (KI-045).

---

## Upcoming Priorities

1. Execute Owner Portal audit fixes (Sprint 1.2: F1 real dashboard, F2 add-property, F3 booking decisions, F4 mobile nav, F7 dead links).
2. Restore Marketplace (Omar) against his original workspace.
3. Restore Booking Flow + Traveler (Menna).
4. Restore Admin (Fatma).
5. Cross-section consistency pass (data, personas, status propagation).
6. Design-system unification (U1–U7: logos, tokens, components, data, toast, cleanup, CSS vocabulary).
7. Backend integration (B1 create Supabase project → B2 mount middleware → B3 auth → B4 profiles → B5 mock-data replacement → B6 DB APIs → B7 traveler data → B8 storage → B9 payments).
8. Testing + CI (P7) and security hardening (error boundaries, rate limiting).
9. Deployment (staging, CI/CD, production hardening).

---

## Next Sprint

**Sprint 1.3 — Marketplace Restoration** *(proposed; follows Sprint 1.2)*

| Field | Value |
|---|---|
| **Goal** | Restore the Public Marketplace to Omar's original implementation |
| **Scope** | Homepage, search, property details, gallery, hotels, saved/favorites, legal/help/contact pages — find → compare → restore → verify per page, with approval between pages |
| **Expected Deliverables** | Marketplace pages visually/functionally matching the original; dead links wired or removed; `KNOWN_ISSUES.md` statuses updated; changelog entry |

---

## Project Health

| Area | Rating | Explanation |
|---|---|---|
| UI | **Good** | Owner Portal restored to original; traveler shell is strong; marketplace/admin are as-merged; 4 purple color families need unification (KI-030) |
| UX | **Fair** | Dead links, no-op buttons, and placeholder toasts degrade the experience (KI-010, KI-013, KI-023) |
| Navigation | **Fair** | Restored owner routes + traveler nav work; owner gets the guest dashboard; no mobile owner nav (KI-007, KI-011) |
| Authentication | **Poor** | Code-complete but not live — no session can be created (KI-001) |
| Backend | **Poor** | Scaffold only: in-memory API, file-based dev store, no real services (KI-004) |
| Database | **Poor** | No schema, migrations, or RLS (KI-003) |
| Security | **Poor** | Route protection inert, no RLS, unauthenticated API (KI-002, KI-003, KI-004) |
| Performance | **Fair** | Hero LCP fixed; large client bundles and undebounced filters remain (KI-037, KI-038) |
| Responsive Design | **Fair** | Owner + traveler responsive; admin/marketplace unverified; owner mobile nav missing (KI-011, KI-027) |
| Accessibility | **Fair** | Basic semantics present; modal Esc/focus, native prompts, and some contrast issues open (KI-024, KI-025) |
| Testing | **Poor** | No test suite, no CI (KI-045) |
| Documentation | **Excellent** | Full `docs/` set with hub, roadmap, issue tracker, changelog — the project's strongest asset |

---

## Recent Changes

- Owner Portal restored to original implementation (routes, shell, tokens, CSS, assets) + Owner Portal Functional Audit delivered.
- Owner routes restored (`/owner/messages`, `/owner/reviews`, `/owner/settings`, `/owner/properties/drafts`); public owner profile added.
- Next.js 16 compatibility: `images.qualities` extended; hero images use `loading="eager"`/`fetchPriority="high"` (LCP warnings silenced); typecheck clean.
- Documentation organized into `docs/` with `INDEX.md`; added `CHANGELOG.md`, `KNOWN_ISSUES.md` (45 tracked issues), and this status file.

---

## Next Actions

- [ ] Approve Owner Portal audit priorities (Sprint 1.2 scope F1–F7)
- [ ] Implement F1: real owner dashboard (replace guest-dashboard redirect)
- [ ] Implement F2: functional Add Property form (wire `AddPropertyActions`)
- [ ] Implement F3: working Approve/Decline booking decision
- [ ] Implement F4: mobile navigation on OwnerShell pages
- [ ] Implement F7: dead-link sweep (~29 `href="#"`)
- [ ] Quick wins: delete `components/forms/index.ts`, update stub READMEs, extract date constants (KI-042, KI-043, KI-036)
- [ ] Update `KNOWN_ISSUES.md` statuses as fixes land
- [ ] Restore Marketplace → Booking/Traveler → Admin (one page at a time, with approval)
- [ ] Connect Supabase: credentials → mount middleware → verify auth flows
- [ ] Add test suite + CI gates
- [ ] Update this file at the end of every sprint

---

## Notes

- **Working tree is uncommitted** — all restoration + docs live on top of the single `Initial commit`. Commit when asked; never `git add -A`.
- **Restoration rules are non-negotiable** — restore, don't redesign (`DEVELOPMENT_RULES.md` §4/§9). The four developer workspaces are the source of truth, not this repo.
- **Next.js 16 ≠ training data** — read `node_modules/next/dist/docs/` before writing Next code (`AGENTS.md` mandates it).
- **Issue tracker** — reference issues by ID (`KI-0##`) in PRs/commits; update status when a fix lands.
- **Dev auth bypass is temporary** — the traveler preview only works with `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` in `next dev`; remove it with real auth (KI-035).
- **Windows / Git Bash** — POSIX syntax only (`mv`/`rm`); quote paths (they contain spaces).
- **Every sprint ends with this file updated** — it must always reflect the latest status.

---

*Part of the DAR documentation set — linked from [`INDEX.md`](./INDEX.md). Keep factual; never record planned work as completed.*
