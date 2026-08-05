# DAR App — Documentation Index

> **Start here.** This folder is the **single source of truth** for the DAR project: how it works, how to work on it, what is broken, and what comes next. Every documentation file for this repository lives in `docs/` and is linked from this index.

---

## 1. The Document Map

| # | Document | What it covers | Read when | Status |
|---|----------|----------------|-----------|--------|
| 1 | [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | **The big picture**: business idea, tech stack, architecture, folder structure, team, routing, auth, priorities, known gotchas | **First** — on-boarding, orientation, any question starting with "how does X work?" | 🟢 Maintained |
| 2 | [PROJECT_STATUS.md](./PROJECT_STATUS.md) | **Where we are right now**: version, phase, sprint, completion %, feature status, blockers, health, next actions | **Every sprint end** — update it; also the first stop for a quick status check | 🟢 Maintained |
| 3 | [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) | **Where we're going**: phases, sprints, priorities, dependency chain, quick-win lane | Planning work, deciding what to build/fix next | 🟢 Maintained |
| 4 | [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | **How we work**: git workflow, branch/PR rules, design-system rules, naming, UI rules, refactoring policy, code-review checklist, Definition of Done | **Before writing any code** | 🟢 Maintained |
| 5 | [FEATURES_DOCUMENTATION.md](./FEATURES_DOCUMENTATION.md) | **What exists**: every feature (marketplace, booking, auth, traveler, owner, admin, design system, system states) with routes, components, status, gaps | Feature discovery, estimating work, finding related files | 🟢 Maintained |
| 6 | [UI_AUDIT.md](./UI_AUDIT.md) | **Visual health**: per-page UI status, missing/broken UI, responsive + design-system issues, priorities | Before touching appearance; measuring visual parity | 🟢 Maintained |
| 7 | [FUNCTIONAL_AUDIT.md](./FUNCTIONAL_AUDIT.md) | **Behavioral health**: broken buttons/links, missing interactions/forms/validation/navigation/state/data-flow/CRUD, per page | Before fixing behavior; verifying functionality | 🟢 Maintained |
| 8 | [BACKEND_AUDIT.md](./BACKEND_AUDIT.md) | **Server health**: auth, authorization, Supabase, database, APIs, env vars, security, missing backend | Backend work, security review, Phase 4 planning | 🟢 Maintained |
| 9 | [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) | **Debt ledger**: duplicate/legacy/dead code, hardcoded values, placeholders, TODOs, performance, security, refactoring opportunities | Before any refactoring; Phase 3 (unification) planning | 🟢 Maintained |
| 10 | [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | **Official issue tracker**: every known issue by severity (Critical → Low) with area, route, behavior, solution, dependencies, status | Checking/updating status, triaging work, referencing issues by ID (KI-###) | 🟢 Maintained |
| 11 | [architecture.md](./architecture.md) | **Folder responsibilities** (the original architecture doc) | Folder/colocation decisions | 🟡 Older doc, superseded in places by PROJECT_CONTEXT.md §4–§5 |

### Reference files (outside `docs/`, linked for completeness)

| File | Purpose |
|------|---------|
| [`AGENTS.md`](../AGENTS.md) | ⚠️ **Mandatory reading**: this Next.js version (16.2.9) differs from training data — read `node_modules/next/dist/docs/` before writing Next code |
| [`CLAUDE.md`](../CLAUDE.md) | Agent instruction import — points assistants at `AGENTS.md` and this index |
| [`README.md`](../README.md) | **Project entry point** — what DAR is, install/run, and pointers into this docs set |
| [`CHANGELOG.md`](../CHANGELOG.md) | **Official project history** (Keep a Changelog format) — what shipped vs. what's in progress |
| [`DAR-APP.md`](../DAR-APP.md) | The pre-merge project overview (mostly superseded by PROJECT_CONTEXT.md) |
| [`app/(auth)/README.md`](<../app/(auth)/README.md>) · [`(dashboard)/README.md`](<../app/(dashboard)/README.md>) · [`(public)/README.md`](<../app/(public)/README.md>) | Route-group stubs (empty/informational) |
| [`lib/supabase/README.md`](../lib/supabase/README.md) | Supabase stub — outdated; see BACKEND_AUDIT.md instead |
| [`.freebuff/run.md`](../.freebuff/run.md) | Local preview/dev-server run procedure (tooling, not product docs) |

---

## 2. Reading Paths (who should read what)

**🧑‍💻 New developer / onboarding (first day):**
1. `AGENTS.md` (Next 16 warning) → 2. `PROJECT_CONTEXT.md` (orientation) → 3. `DEVELOPMENT_RULES.md` (how to work) → 4. `FEATURES_DOCUMENTATION.md` (what exists) → 5. the relevant audit (UI/FUNCTIONAL/BACKEND) for the area you'll touch.

**🤖 AI assistant (new session):**
1. `CLAUDE.md` / `AGENTS.md` → 2. `PROJECT_CONTEXT.md` (status + gotchas §14) → 3. `DEVELOPMENT_RULES.md` (restoration rules, Definition of Done) → 4. `PROJECT_ROADMAP.md` (what phase we're in) → 5. area-specific audit. **Never refactor or redesign without reading §9 of DEVELOPMENT_RULES.md first.**

**🧐 Code reviewer:**
1. `DEVELOPMENT_RULES.md` §10 (checklist) → 2. `TECHNICAL_DEBT.md` (known debt to spot in new code) → 3. `BACKEND_AUDIT.md` §7 (security checklist).

**📋 Product / PM:**
1. `PROJECT_ROADMAP.md` (phases & sprints) → 2. `PROJECT_CONTEXT.md` §13 (priorities) → 3. `UI_AUDIT.md` + `FUNCTIONAL_AUDIT.md` (what's broken per page).

**🛠️ Restoration work (current phase):**
1. `PROJECT_ROADMAP.md` Phase 1 → 2. `DEVELOPMENT_RULES.md` §4/§9 (restoration rules) → 3. `UI_AUDIT.md` + `FUNCTIONAL_AUDIT.md` for the section being restored → 4. `PROJECT_CONTEXT.md` §8 (original developer workspaces = source of truth).

---

## 3. How the Docs Fit Together

```
                    ┌─────────────────────┐
                    │  docs/INDEX.md      │  ← you are here
                    └──────────┬──────────┘
                               │
        ┌──────────┬───────────┼────────────┬─────────────┬──────────────┐
        ▼          ▼           ▼            ▼             ▼              ▼
   PROJECT_CONTEXT  ROADMAP  DEVELOPMENT   FEATURES    UI_AUDIT      BACKEND_AUDIT
   (what & why)   (where)   _RULES       _DOCUMENT   FUNCTIONAL    TECHNICAL_DEBT
                              (how)      (what exists) _AUDIT        (security)
                                                      (is it right?)  (debt)
```

- **PROJECT_CONTEXT.md** = the "what/where/why" spine; every other doc anchors to it.
- **ROADMAP** consumes the three audits (UI / FUNCTIONAL / BACKEND) and the debt ledger to define phases.
- **DEVELOPMENT_RULES** governs how all of it gets executed (restoration-first, visual parity, typecheck + lint gates).
- **Audits are read-only analyses** — fixes are scoped in the ROADMAP, not inside the audits.

---

## 4. Maintenance Rules (keep the source of truth true)

1. **Every doc stays in `docs/`.** New generated documentation goes here and gets a row in §1.
2. **Update `INDEX.md`** whenever a document is added, renamed, or removed.
3. **Keep PROJECT_CONTEXT.md current** when status/architecture/priorities change (it's the first doc everyone reads).
4. **Keep audits as snapshots** — dated at the bottom; when fixes land, update the audit's status markers or note "as of" rather than silently rewriting history.
5. **Cross-references use bare filenames** (e.g. `UI_AUDIT.md`) — valid because all docs share this folder. Don't introduce `docs/`-prefixed paths inside `docs/`.
6. **Never store secrets** in docs. Env procedures live in `.env.example` / `.freebuff/run.md`; docs reference them by name.
7. **DEVELOPMENT_RULES.md §11 (Definition of Done)** already requires "docs updated" — treat the index as part of that gate.

---

*Maintained as part of the DAR project documentation set. Generated August 2026.*
