# DAR

**DAR** is an Airbnb-like marketplace platform for premium short- and long-term stays in Egypt, built with **Next.js**, **TypeScript**, and **Supabase**.

It includes:

- **Public Marketplace** — browse and book verified apartments, studios, villas, and hotel rooms
- **Authentication** — email + Google/Facebook sign-in with role-based destinations
- **Traveler Portal** — bookings, payments, messages, reviews, profile, support
- **Owner Portal** — property management, calendar, pricing, payouts, verification
- **Admin Dashboard** — overview, properties, users, bookings, reports
- **Booking Flow** — multi-step booking with confirmation states and invoices

> ⚠️ **Status:** pre-production demo. The UI for all portals is in place on **mock data**; the Supabase backend is scaffolded but **not yet connected**.

---

## Project Overview

- **What it does:** connects Egyptian guests with verified property owners — search and book stays, pay with local methods (Vodafone Cash, InstaPay, Fawry, cards), and manage listings end-to-end.
- **Main user roles:** **Guests** (browse/book/manage stays) · **Owners/Hosts** (list & manage properties, earn payouts) · **DAR staff** (admin oversight & moderation).
- **Current development status:** post-merge restoration phase — the four original developer implementations (Marketplace, Booking+Traveler, Owner, Admin) have been merged into one repo; the Owner Portal is restored and audited, the backend awaits connection. See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the live status.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | ⚠️ Newer than most training data — read the bundled docs before writing Next code |
| Language | TypeScript | `strict` mode |
| Styling | Tailwind CSS v4 | CSS tokens in `app/globals.css` |
| Backend | Supabase (SSR) | **Scaffolded — not connected yet** |
| Database | Supabase Postgres | No schema/migrations exist yet (see `BACKEND_AUDIT.md`) |
| Authentication | Supabase Auth | **Scaffolded — not live** (placeholder credentials) |
| Package Manager | npm | `package-lock.json` |
| Icons | lucide-react + custom `Icon` component | Unification planned |
| State Management | React state + `localStorage`/`sessionStorage` | No library; no global store |
| Hosting | Not deployed | Next.js is Vercel-ready |

---

## Requirements

- **Node.js** ≥ 18 (Next.js 16 requirement)
- **npm** (or your preferred npm-compatible package manager)
- **Git** (Git Bash on Windows — POSIX syntax)
- **VS Code** (or any editor with TypeScript support)
- **Environment variables** — a `.env.local` file (see below)

---

## Installation

```bash
# 1. Clone the repository (creates a folder named dar-ui)
git clone https://github.com/abdelrahmanNegmtech/dar-ui.git
cd dar-ui   # or rename the folder to dar-app to match this project's layout

# 2. Install dependencies
npm install

# 3. Create your environment file
#   - Copy the template (see "Environment Variables" below):
cp .env.example .env.local

# 4. Run the dev server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`). **Never commit secrets.**

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 🔒 for auth | Supabase project URL (`https://<project>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 🔒 for auth | Supabase publishable key (falls back to the anon key) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 🔒 for auth | Supabase anon key (fallback) |
| `NEXT_PUBLIC_SITE_URL` | For prod | Canonical site URL used in auth redirects |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Marketplace search map |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | Dev only | `true` enables the temporary traveler preview in `next dev` — **keep `false` or unset elsewhere** |

> **Current state:** the Supabase values are placeholders, so the app runs in mock mode. The dev bypass (`NEXT_PUBLIC_DEV_AUTH_BYPASS=true`) lets you preview the Traveler Portal locally without auth.

---

## Run the Project

```bash
npm run dev       # start the dev server (http://localhost:3000)
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint (next/core-web-vitals + typescript)
npx tsc --noEmit  # typecheck (no dedicated script — use this)
```

> There is no test suite configured yet.

---

## Project Structure

| Folder | Purpose |
|---|---|
| `app/` | Next.js App Router — pages, layouts, route groups, API routes (`app/api/`) |
| `components/` | Shared components (`ui/`, `brand/`, `owner/`, `host-landing/`) |
| `features/` | Feature modules, one per vertical slice (`public-marketplace/`, `traveler/`, `authentication/`, admin modules, `design-system/`, `system-states/`) |
| `lib/` | Utilities & integrations (`supabase/`, `dar-data.ts` mock data, `owner-routes.ts`, `constants/`, `utils/`) |
| `hooks/` | Shared React hooks |
| `public/` | Static assets (images, logos) |
| `docs/` | 📚 **The documentation set — single source of truth, start at `docs/INDEX.md`** |

See [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) §4 for the full annotated tree.

---

## Documentation

The project's documentation lives in **`docs/`** and is the single source of truth. Start at **[`docs/INDEX.md`](docs/INDEX.md)** — it links everything and provides reading paths by role.

| File | Purpose |
|---|---|
| [`docs/INDEX.md`](docs/INDEX.md) | The hub — links every doc, reading paths for devs/assistants/reviewers/PMs |
| [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) | The big picture: business idea, architecture, team, routing, auth, gotchas |
| [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) | **Current status**: phase, sprint, completion, health, blockers, next actions |
| [`docs/PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md) | Phases, sprints, priorities, dependencies |
| [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md) | Coding standards, git/PR rules, Definition of Done — **read before coding** |
| [`docs/FEATURES_DOCUMENTATION.md`](docs/FEATURES_DOCUMENTATION.md) | Every feature: routes, components, status, gaps |
| [`docs/UI_AUDIT.md`](docs/UI_AUDIT.md) | Per-page UI/visual health |
| [`docs/FUNCTIONAL_AUDIT.md`](docs/FUNCTIONAL_AUDIT.md) | Per-page functional health (buttons, forms, data flow, CRUD) |
| [`docs/BACKEND_AUDIT.md`](docs/BACKEND_AUDIT.md) | Auth, Supabase, database, APIs, env vars, security |
| [`docs/TECHNICAL_DEBT.md`](docs/TECHNICAL_DEBT.md) | Debt ledger: duplicates, dead code, hardcoded values, performance |
| [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) | Official issue tracker (45 issues, IDs `KI-###`) |
| [`CHANGELOG.md`](CHANGELOG.md) | Official project history (Keep a Changelog format) |

---

## Git Workflow

```
main
 └── develop
      └── feature/*
```

**Rules:**

- **Never work on main** — always create a feature branch off `develop`
- Pull the latest `develop` before starting a task
- Submit **Pull Requests** for review; the Team Lead reviews all PRs
- Use the `restore/` prefix for restoration branches (e.g. `restore/owner-calendar`)
- Commit with conventional messages: `type(scope): summary` (e.g. `fix(payouts): apply date filter`)

> **Current repository reality:** the repo currently holds a single `Initial commit` on `main` (the merge of the four workspaces happened outside git). The `main → develop → feature/*` flow is the target workflow; work is committed directly to `main` only when explicitly asked until `develop` is set up. Full rules in [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md) §1–§3.

---

## Development Workflow

1. Pull the latest `develop`
2. Create a feature branch (`git checkout -b feature/your-task`)
3. Implement the task
4. Test (typecheck + lint + manual verification)
5. Commit (conventional message)
6. Push the branch
7. Create a Pull Request into `develop`
8. Code review
9. Merge into `develop`

---

## Coding Standards

- Use Design System components where render-identical (see `DEVELOPMENT_RULES.md` §4)
- Keep the folder structure consistent (feature colocation, kebab-case routes)
- **No unnecessary refactoring** — restoration comes first
- **Preserve the original UI unless requested** — visual parity is sacred
- Keep components reusable; avoid duplicate code
- Never run refactoring during the restoration phase without approval
- Typecheck + lint before every commit; update docs (`PROJECT_CONTEXT.md`, `CHANGELOG.md`) with changes

---

## Current Project Status

| | |
|---|---|
| **Current Phase** | Phase 1 — Restoration |
| **Current Sprint** | Sprint 1.2 — Owner Portal Functional Fixes (planned) |
| **Main Focus** | Execute the Owner Portal audit fixes; then restore Marketplace, Booking + Traveler, and Admin to their original implementations |

Full details: [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).

---

## Contributing

1. **Read first:** [`docs/INDEX.md`](docs/INDEX.md) → [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) → [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md).
2. **Check the issue tracker** [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) — reference issues by ID (`KI-###`) in your PR.
3. **Respect the restoration rules:** for UI work, the original developer workspaces are the source of truth — restore, don't redesign, one page at a time with approval.
4. **Every PR:** typecheck clean, lint clean, docs/changelog updated, issue status updated.
5. **If you're an AI assistant:** read `AGENTS.md` (Next.js 16 differs from training data) and `CLAUDE.md`, then follow the docs hub.

---

## Useful Commands

```bash
git pull                       # pull latest
git checkout develop           # switch to develop
git checkout -b feature/x      # create a feature branch
git add <files>                # stage changes
git commit -m "type(scope): summary"
git push -u origin feature/x   # push the branch
```

---

## Contact

**Team Lead:** *(to be filled)*

**Repository:** https://github.com/abdelrahmanNegmtech/dar-ui

---

*DAR documentation set — start at [`docs/INDEX.md`](docs/INDEX.md).*
