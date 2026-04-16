# AGENTS.md

This repository is optimized for agent-led iteration. Read the smallest useful slice of context, then act.

## Start Here

Read these files in order when you begin a new task:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `docs/product-specs/index.md`
4. `docs/FRONTEND.md`
5. `docs/RELIABILITY.md`
6. `docs/SECURITY.md`
7. `docs/PLANS.md`
8. `docs/QUALITY_SCORE.md`

## Mission

Build and maintain a single-page Next.js application that:

- runs on the App Router
- ships with bundled resources only
- stores mutable user state in `localStorage`
- can be advanced by an agent in one end-to-end iteration with minimal human steering

## Non-Negotiables

- Keep runtime assets inside the repository or module graph. Do not add remote fonts, images, analytics, APIs, or CDN dependencies.
- Persist user-editable state only through the repository layer over `localStorage`.
- Keep browser-only APIs out of server components. The `src/app` layer renders the shell; feature runtime code owns browser behavior.
- Follow the layered feature architecture in `ARCHITECTURE.md`.
- If behavior or constraints change, update the matching product spec and active execution plan.
- End every meaningful change with `npm run verify`, including the browser smoke gate.

## Iteration Workflow

1. Read the current product spec in `docs/product-specs/`.
2. Check the active execution plan in `docs/exec-plans/active/`.
3. Implement one coherent slice of work.
4. Update docs that became stale because of the change.
5. Run `npm run verify`.
6. Only treat the iteration as successful if browser smoke is clean: no uncaught errors, no console errors, and the key UI flow renders.
7. Record the outcome in `docs/generated/latest-iteration.md` when using the harness.

## Useful Commands

- `npm run dev` - local development server
- `npm run verify` - guards, typecheck, lint, build, and browser smoke
- `npm run harness:iterate -- --goal "..."` - launch a non-interactive Codex iteration
- `npm run guards:all` - repository rule checks only

## Document Map

- `ARCHITECTURE.md` - code boundaries and allowed dependency flow
- `docs/FRONTEND.md` - visual and interaction constraints
- `docs/PLANS.md` - execution-plan lifecycle
- `docs/RELIABILITY.md` - validation flow and release bar
- `docs/SECURITY.md` - storage and network constraints
- `docs/QUALITY_SCORE.md` - current quality assessment
- `docs/references/openai-harness-notes.md` - distilled notes from the official OpenAI harness engineering posts

## When In Doubt

- Prefer simpler abstractions that are easy for the next agent run to inspect.
- Encode a rule in the repository instead of relying on memory.
- Keep changes small enough that one agent run can implement and verify them safely.
