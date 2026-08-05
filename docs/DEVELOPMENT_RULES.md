# DAR App — DEVELOPMENT_RULES.md

> **The coding standards for the DAR App project.** Every developer and AI assistant must follow these rules. Where this document conflicts with personal preference, this document wins.
>
> Companion docs: `PROJECT_CONTEXT.md` (what/where/why), `FEATURES_DOCUMENTATION.md` (feature inventory & status), `architecture.md` (folder responsibilities), `AGENTS.md` (⚠️ Next.js 16 differs from training data — read the bundled docs before writing Next code).

---

## 0. Golden Rules

1. **Restoration before refactoring.** This project is in a post-merge restoration phase. The original developer workspaces (`DAR APP\<developer>\...`) are the source of truth for UI appearance. Restore first, refactor only after every page is restored **and approved**.
2. **Visual parity is sacred.** The Design System may only replace a component internally if the final rendering is visually identical. Never "improve" the look during restoration.
3. **Next.js 16 is different.** This repo runs Next `16.2.9` + React `19.2.4` + Tailwind v4. APIs from older Next versions may be deprecated or changed (e.g. `priority` on `next/image`, Promise-based `params`). **Read `node_modules/next/dist/docs/` before writing Next code.** `AGENTS.md` mandates this.
4. **Never break a working page.** If a change alters visible UI, spacing, typography, or interaction on a restored page, stop and ask.
5. **Typecheck and lint before you declare done.**

---

## 1. Git Workflow

### 1.1 Repository state (as of now)

- Single commit (`Initial commit`) on `main`, remote `origin/main`. **No feature branches exist yet** — the project is effectively starting fresh with git discipline.
- The four-developer merge happened **outside git** (file copies). This repo's git history cannot recover original implementations; the sibling workspaces under `D:\negmtech company\PROJECTS DESIGN\DAR APP\` are the recovery source. (Note: Omar's and Menna's original workspaces each have their **own** `.git` history with the pre-merge commits — useful when diffing a page against its pre-merge state.)

### 1.2 Daily workflow

1. **Sync first:** `git pull --rebase origin main` (when a remote is shared) before starting work.
2. **Create a branch** per task (see §2).
3. Commit **small, focused** changes with clear messages (§1.4).
4. Keep work in sync with `main` (rebase, never merge, to keep history linear).
5. Open a PR (see §3) and get approval before merging to `main`.

### 1.3 Commit rules

- One logical change per commit. Do **not** bundle unrelated edits (e.g. "restore payouts page" + "fix hero image" in one commit).
- **Never** stage blindly with `git add -A`. Stage only the files belonging to your change.
- **Never** commit: `.env.local` (any real secrets), `node_modules`, `.next/`, build output, agent artifacts (`.freebuff/`, `.agents/`, `.codex/` — already in `.gitignore`).
- Never rewrite or force-push shared history (`main`).
- If you did not author a change (another thread/agent/IDE edited it), leave it uncommitted and flag it.

### 1.4 Commit message format

```
<type>(<scope>): <short imperative summary>

<optional body: what and why, not how>
```

Types: `feat` · `fix` · `restore` · `refactor` · `chore` · `docs` · `style` · `test` · `perf` · `build` · `ci`.
Scope examples: `owner`, `marketplace`, `traveler`, `admin`, `booking`, `auth`, `ui`, `supabase`, `deps`.

Examples:
- `fix(payouts): include date range in filter predicate`
- `restore(owner): return original dashboard redirect behavior`
- `feat(auth): wire supabase login to role-based redirect`

---

## 2. Branch Naming

```
<type>/<short-description>
```

- `type` ∈ `feature`, `fix`, `restore`, `refactor`, `chore`, `docs`.
- `short-description` in kebab-case, no trailing slash, ≤ 4 words.
- Use a task prefix when one exists (ticket/issue number).

Examples:
- `restore/owner-dashboard`
- `fix/booking-decision-navigation`
- `feature/supabase-auth`
- `chore/remove-dead-svgs`

**Rule:** restore work MUST use the `restore/` prefix so it is never mistaken for new feature work.

---

## 3. Pull Request Rules

1. **One concern per PR.** A PR fixes one feature/area (e.g. one restored page, one audit category). No mixed concerns.
2. **Title** mirrors the commit convention: `type(scope): summary`.
3. **Description** must include:
   - What changed (bullets).
   - Why (link to audit finding / original workspace path when restoring).
   - What was deliberately **not** changed and why.
   - Verification performed (typecheck, lint, manual steps, screenshots).
4. **Size:** prefer small PRs (< ~300 changed lines — soft target, not a hard limit). Large restorations may be split by page.
5. **Required checks before merge:** `npx tsc --noEmit` passes, `npm run lint` passes, manual verification of the affected pages (desktop + mobile), and (when restoring) visual comparison against the original screenshot.
6. **Reviewers:** at least one other developer or AI reviewer. Address every comment — fix, or reply explaining why not.
7. **Never merge your own PR without a review** (except trivial docs/chore with 1-line changes).
8. **Restorations additionally require user/team approval** of the visual result before merging (per the agreed workflow: find → compare → restore → verify → **approve**).

---

## 4. Design System Rules

> The design system exists to **remove duplication internally** — never to change page appearance.

### 4.1 Phase rules (current: restoration phase)

- **Do NOT redesign, simplify, replace layouts, or "modernize" pages.** The original developer implementation is the reference.
- The Design System may replace a duplicated component **only if** the rendered output is visually identical (same spacing, typography, colors, radius, shadows, icons).
- If a swap causes **any** visible difference, keep the original implementation. Visual accuracy > code cleanliness during this phase.
- If the original page contains duplicated code, **keep it for now**. Optimization comes later.

### 4.2 Token usage

- Define colors, radii, shadows, and spacing as CSS variables in `app/globals.css` (e.g. `--brand`, `--background`, `--surface`).
- Prefer tokens over raw hex in **new** code. ⚠️ Restored pages legitimately use their original inline hex values (e.g. owner portal `#5522d9` family) — do not "fix" them during restoration.
- Do not introduce new colors with different hex values for the same semantic purpose; extend the token set instead.

### 4.3 Component ownership

- `components/ui/*` — generic primitives, free of business behavior (Button, TextInput, Badge, Card, Checkbox, DropdownMenu, ProfileAvatar).
- `features/design-system/*` — admin-side primitives (separate system; consolidation is a future phase).
- `components/shared/*` — cross-feature composed components used by 2+ features.
- `components/layout/*` — shells, navigation, headers/footers.
- Start components in the narrowest sensible folder; promote only when reuse is proven.

### 4.4 Icons & images

- Use the app-wide `Icon` component (`components/host-landing/icons.tsx`) with its `paths` map for new icons; add a name to the map rather than inlining new SVGs when the icon is reused.
- lucide-react is available for admin/feature code that already uses it; don't mix both systems inside one component.
- Use `next/image` (never bare `<img>`); set explicit `width`/`height` or `fill` + `sizes`; use `loading="eager"` only above the fold, `lazy` elsewhere (Next 16: `priority` is deprecated).

---

## 5. Component Usage

1. **Prefer the shared component over a local reimplementation** — but only when it renders identically (see §4).
2. **One component = one responsibility.** If a component file exceeds ~300 lines or has 3+ unrelated concerns, split it (unless it's a restored original — keep those intact).
3. **Compose, don't duplicate.** Reuse `OwnerShell`/`Card`, `TravelerLayout`, `AdminSidebar`, `ProfileAvatar`, `OwnerProfileLink` where the original used them.
4. **Client components:** add `"use client"` only when needed (state, effects, event handlers). Prefer Server Components by default in Next App Router.
5. **Accessibility:** buttons are `<button>`, links are `<Link>`/`<a>`; interactive elements get focus styles and accessible labels (`aria-label` on icon-only controls); dialogs get `role="dialog"` + `aria-modal` and Escape handling.
6. **No inline `<style>` tags or ad-hoc CSS-in-JS.** Tailwind classes or globals.css.
7. **Don't render placeholder UI silently** — if a button has no handler, it's a bug (see audit); either wire it or remove it (in new code).

---

## 6. Folder Conventions

```
app/            # Routes, layouts, pages, API routes (App Router)
components/     # Shared components (brand, ui, layout, shared, owner, host-landing…)
features/       # Feature modules — one folder per vertical slice
hooks/          # Shared React hooks
lib/            # Utilities, constants, data, integrations (supabase, auth, utils, validations)
public/         # Static assets
docs/           # Single source of truth — all project docs, see docs/INDEX.md
```

Rules:
- **Route folders** in `app/` use kebab-case. Route groups (no URL impact) use parentheses: `(auth)`, `(public)`, `(dashboard)`.
- **Dynamic routes** use `[param]` (single) / `[...slug]` (catch-all).
- Feature code lives in `features/<feature>/` — components, data, types, services colocated there. A route page should be a thin wrapper around a feature component.
- Page-specific composition stays close to the route (`app/<route>/page.tsx` + local components) until reuse is proven; then promote to `components/shared/`.
- API routes under `app/api/<domain>/<resource>/route.ts`.
- **Never** put runtime-mutable data writes inside `app/` (see traveler `devStore.ts` — it deliberately writes to the OS temp dir in dev only).

---

## 7. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Route folders | kebab-case | `app/owner/properties/drafts/` |
| Non-component files | kebab-case | `flow-guards.ts` |
| Component files & exports | PascalCase | `OwnerShell.tsx`, `export function BookingCard` |
| Functions / variables | camelCase | `formatEgp`, `setApplied` |
| Hooks | `use` + PascalCase | `useFavorites`, `useToast` |
| Constants (module-level) | UPPER_SNAKE_CASE | `BOOKING_STORAGE_KEY` (prefer meaningful names over `const` literals) |
| Types & interfaces | PascalCase | `StoredBooking`, `Profile` |
| CSS classes | kebab-case (`owner-*` prefix for owner portal) | `owner-page-title` |
| CSS variables | `--` + kebab-case | `--brand`, `--surface-dark` |
| localStorage keys | `dar-<domain>-<name>` | `dar-pending-booking`, `dar-owner-calendar:1` |
| Route constants | grouped objects with `ownerRoutes.*` / `navRoutes` pattern | `ownerRoutes.payouts` |
| Env vars | `NEXT_PUBLIC_*` for client-exposed | `NEXT_PUBLIC_SUPABASE_URL` |

**Naming rules of thumb:**
- Names say **what**, not how (`getCurrentProfile`, not `fetchProfileDataFromSupabase`).
- Boolean props: `is*`/`has*`/`can*` (`isPublishing`, `hasSelectedRoom`).
- Handler props: `on*` (`onSave`, `onChange`); handlers themselves `handle*` when standalone (`handleFiles`).
- Never abbreviate unless the abbreviation is universal (`img` → `image`, `btn` → `button`).

---

## 8. UI Rules

1. **Consistency beats novelty.** Follow the established visual language of the page you're in (owner portal, traveler, admin, marketplace each have their own — don't cross-pollinate during restoration).
2. **Spacing:** use the page's existing rhythm (the restored `owner-*` classes and Tailwind spacing scale). Do not introduce arbitrary pixel values where a scale value exists.
3. **Typography:** use the `owner-*` classes / design tokens for headings and body (restored values, e.g. `owner-page-title` 26px). Don't hand-tune font sizes in new code — reuse classes.
4. **Hover/active/focus:** interactive elements need hover feedback and a visible focus ring (e.g. `focus-visible:ring-2`). Match the pattern already used on that page.
5. **Empty/loading/error states:** use `features/system-states/*` components (EmptyStateCard, Skeletons, ErrorStateCard) instead of inventing new ones — unless the restored original has its own.
6. **Responsive:** every page must be verified at desktop, tablet (~768px), and mobile (~375px). Owner shell pages must not lose navigation on mobile (audit finding — fix in new code with a bottom nav like other flows).
7. **Currency & dates:** use `Intl`-based helpers (`formatEgp`, `formatShortDate`) — not string concatenation with `EGP` and raw dates.
8. **Language:** UI copy in English (locale-ready structure where feasible via `app/routing.ts` helpers).

---

## 9. Refactoring Policy

1. **Not during restoration.** No refactoring of pages that have not been restored + approved.
2. **Refactoring requires a `refactor/` branch** and must be behavior-preserving (same rendered output, same interactions).
3. **Verification before/after:** run the affected flows manually and diff screenshots if the change could affect visuals.
4. **Allowed refactors (post-restoration):**
   - Replacing duplicated custom components with shared ones (render-identical only).
   - Removing dead code, unused imports, and placeholder components (after audit sign-off).
   - Centralizing hardcoded data into `lib/dar-data.ts` / feature data files.
   - Migrating magic hex values to tokens **when the rendered color is identical**.
   - Consolidating duplicated state stores (`/saved` vs `/favorites`, multiple toasts).
5. **Forbidden:** renaming exports/APIs without updating every reference (use a code search first), deleting "duplicated" code that is part of a restored original, or silently changing behavior while "cleaning up".
6. **Prefer small refactor PRs** over big-bang rewrites.

---

## 10. Code Review Checklist

For every PR / change set, the reviewer checks:

**Correctness & behavior**
- [ ] The change does what the description claims.
- [ ] No regressions on related routes/flows (spot-run or full smoke test).
- [ ] Restorations match the original implementation (diff against the developer workspace / screenshot).

**Next.js 16 correctness**
- [ ] `params`/`searchParams` treated as Promises where applicable.
- [ ] `next/image` props valid for this version (no deprecated `priority`; `qualities` within `images.qualities` config — currently `[70, 75, 85, 90, 92, 95]`).
- [ ] Server/client component split is correct (`"use client"` only when needed).

**Type safety & code quality**
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run lint` passes (eslint-config-next core-web-vitals + typescript).
- [ ] No `any` abuse; types colocated or in feature `types.ts`.
- [ ] No dead code / unused imports / console.log left behind.

**Conventions**
- [ ] Naming matches §7; folders match §6; imports use `@/` alias.
- [ ] No new duplicated components where a shared one exists (render-identical check).
- [ ] localStorage/sessionStorage keys follow `dar-*` naming.
- [ ] No secrets or `.env.local` committed.

**UX & accessibility**
- [ ] Buttons/links are semantic; icon-only controls have `aria-label`.
- [ ] Hover + focus states present; empty/loading/error states handled.
- [ ] Verified at desktop + mobile; no nav loss on owner pages.
- [ ] Modals close via ✕, Cancel, and Escape; no `window.confirm` in new code (use styled dialog).

**Data & state**
- [ ] New state persisted with the app's pattern (localStorage / devStore / Supabase), not a new ad-hoc mechanism.
- [ ] No cross-page data inconsistencies introduced.

---

## 11. Definition of Done (DoD)

A task is **done** only when **all** of the following are true:

1. **Code complete** — the change implements the requested behavior fully.
2. **Typecheck passes** — `npx tsc --noEmit` exits 0.
3. **Lint passes** — `npm run lint` exits 0 (no new warnings).
4. **No regressions** — related routes/flows still work (smoke-tested).
5. **Restoration tasks:** visual + functional parity verified against the original (screenshot/workspace diff); **user approved**.
6. **Responsive verified** — desktop + tablet + mobile look correct.
7. **No dead/placeholder UI introduced** — every button/input/flow added has a working handler or a documented reason.
8. **Accessibility basics** — semantic elements, labels, focus states.
9. **Docs updated** — `PROJECT_CONTEXT.md` / `FEATURES_DOCUMENTATION.md` updated when routes, features, or status change; `CHANGELOG.md` updated for every merged change.
10. **Committed to a properly named branch** with a conventional commit message, PR opened with description + verification, and review approval (or explicit skip for trivial changes).

**Not done** if any of the above fails — even if it "works on my machine."

---

## 12. Environment & Tooling Cheat Sheet

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Tests | none configured yet (add per-feature unit tests in a future phase) |

- Terminal is Git Bash on Windows — POSIX syntax (`mv`, `rm`), quote paths containing spaces (project path does).
- Read `node_modules/next/dist/docs/` for any Next API questions; code search skips `node_modules` (read files directly).
- Restart the dev server after `next.config.ts` changes.

---

*Generated August 2026. Review and update this document whenever conventions evolve.*
