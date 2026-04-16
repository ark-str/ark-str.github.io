# Operator Parser And Alias Ledger

Status: completed
Owner: Codex
Started: 2026-04-16
Parent issue: `#25`
Active child issue: `#26`
Draft PR: `#27`

## Objective

Upgrade story parsing so dialogue blocks resolve operator IDs from `Character(...)` tags and the reader persists locale-scoped observed aliases while users read stories.

## Scope

- parse `Character(name/name2/.../focus)` tags as a speaker-resolution state machine
- attach dialogue-level `speakerToken`, `operatorId`, and `portraitKey` metadata
- add story-level `observedOperators` to generated story detail JSON
- persist locale-scoped alias observations through a dedicated characters feature store
- refresh the product spec and iteration record after merge

## Constraints

- only `char_` tokens count as operator candidates
- canonical operator IDs are derived by stripping `#/$` suffixes and keeping the first three `_`-delimited segments
- non-operator speaker tokens such as `avg_*` and `avg_npc_*` must not enter the alias ledger
- runtime persistence stays local-first and uses `localStorage` only through feature repo layers
- existing reader routes, summary empty states, and Pages-safe export behavior must remain intact

## Issue And PR Dependency Graph

- `#26 operator-story-parser-and-alias-ledger`
  - depends on: none
  - PR: `#27`

## Commit Policy

- first milestone: active plan and harness scaffold
- second milestone: parser, generated contract, and reader-side observation store
- final milestone: tests, docs, verify, and review fixups

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [x] add an active execution plan for issue `#26`
- [x] teach the story parser to resolve active speaker tokens from `Character(...)` lines
- [x] normalize dialogue operator IDs and emit `observedOperators`
- [x] add a locale-scoped character observation store in the app
- [x] persist observed aliases when a story is opened
- [x] update tests and docs for the new story contract

## Verification

- `npm run content:update`
- `npm run harness:test`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Canonical operator IDs will be string-derived rather than table-looked-up: strip `#/$` suffixes, split on `_`, and keep the first three segments.
- 2026-04-16: Alias observations are locale-scoped and stored separately from reader session state.
- 2026-04-16: Dialogue speaker reuse falls back to the last resolved speaker only when the visible speaker name stays the same after the active `Character(...)` context is cleared.
- 2026-04-16: Root verification passed after regenerating story detail files with `observedOperators` and checking browser-side alias persistence in exported smoke tests.
