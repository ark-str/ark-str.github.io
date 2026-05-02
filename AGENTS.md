# AGENTS.md

This repository is optimized for agent-led iteration from the repository root.

## Start Here

Read these files in order when you begin a new task:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `docs/product-specs/index.md`
4. `docs/FRONTEND.md`
5. `docs/design-system/README.md`
6. `docs/RELIABILITY.md`
7. `docs/SECURITY.md`
8. `docs/PLANS.md`
9. `docs/QUALITY_SCORE.md`

## Mission

Build and maintain an Arknights story reader where:

- the repository root contains the harness and project docs
- the actual Next.js app lives in `ark-str-web-app/`
- runtime assets are bundled only
- mutable browser state is persisted through `localStorage`
- the project can still be advanced by a GitHub-backed agent iteration

## Non-Negotiables

- Keep runtime assets inside the repository or module graph. Do not add remote fonts, images, analytics, APIs, or CDN dependencies.
- Persist user-editable state only through the repository layer over `localStorage`.
- Keep browser-only APIs out of server components. The `ark-str-web-app/src/app` layer renders the shell; feature runtime code owns browser behavior.
- Follow the layered feature architecture in `ARCHITECTURE.md`.
- Keep shared UI primitives under `ark-str-web-app/src/components/ui/` and feature-specific composition under `ark-str-web-app/src/features/*/ui/`.
- If behavior or constraints change, update the matching product spec and active execution plan.
- End every meaningful change with `npm run verify`.

## Iteration Workflow

1. Read the current product spec in `docs/product-specs/`.
2. Check the active execution plan in `docs/exec-plans/active/`.
3. Before committing implementation work, create or link a GitHub issue, create an issue-scoped branch from the default branch, and keep all commits and pushes on that branch.
4. Use the GitHub-backed harness flow: issue DAG, one branch per child issue, dependency-safe scheduling, milestone commits, PR review, and merge.
5. Update docs that became stale because of the change.
6. Run `npm run verify`.
7. Only treat the iteration as successful if the root harness checks are green, the app verify path is green, browser smoke is clean, every child PR is merged, and no known runtime issues remain.
8. Record the outcome in `docs/generated/latest-iteration.md` when using the harness.

## Useful Commands

- `npm run app:dev` - run the nested app from the repository root
- `npm run app:verify` - run the nested app verification from the repository root
- `npm run content:update` - sync vendor data and rebuild generated content contracts
- `npm run content:check` - validate generated content integrity
- `cd ark-str-web-app && npm run dev` - run the app directly
- `cd ark-str-web-app && npm run verify` - verify the app directly
- `npm run verify` - root guards, harness tests, app verify, and browser smoke
- `npm run harness:iterate -- --goal "..."` - launch a GitHub-backed Codex iteration
- `npm run harness:iterate -- --goal "..." --dry-run` - validate planning and orchestration without GitHub writes
- `npm run content:status` - inspect vendor source and generated asset readiness

## Harness Prerequisites

- `codex` CLI must be installed and authenticated.
- `gh` CLI must be installed and authenticated.
- Start from a clean checkout on the default branch.
- Treat `.harness-worktrees/` as harness-owned scratch space only.

## Repository Structure

- `ark-str-web-app/` - independent Next.js application package
- `docs/` - source of truth for specs, plans, and generated harness reports
- `scripts/` - guards, harness orchestration, and content pipeline entrypoints
- `tests/` - root harness unit tests and browser smoke tests
- `vendor/` - indirect GitHub-backed source roots such as `ArknightsGamedata/` and `ArknightsResource/`
- `artifacts/` - local verification and harness artifacts

## Document Map

- `ARCHITECTURE.md` - code boundaries and allowed dependency flow
- `docs/design-system/README.md` - design-system principles, tokens, and component map
- `docs/FRONTEND.md` - visual and interaction constraints
- `docs/PLANS.md` - execution-plan lifecycle
- `docs/RELIABILITY.md` - validation flow and release bar
- `docs/SECURITY.md` - storage and network constraints
- `docs/QUALITY_SCORE.md` - current quality assessment
- `docs/references/openai-harness-notes.md` - distilled notes from the official OpenAI harness engineering posts

## When In Doubt

- Prefer simpler abstractions that are easy for the next agent run to inspect.
- Encode a rule in the repository instead of relying on memory.
- Keep root responsibilities narrow and push app-specific code into `ark-str-web-app/`.
