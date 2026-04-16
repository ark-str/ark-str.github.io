# Design System Foundation

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#4`
Draft PR: `#5`

## Objective

Establish the design system foundation for the Arknights story reader so the app has a documented editorial archive visual language, semantic theme tokens, shared UI primitives, and guardrails before reader features expand.

## Scope

- add dedicated design-system docs under `docs/design-system/`
- define semantic light and dark theme tokens in the nested app
- introduce shared UI primitives under `ark-str-web-app/src/components/ui/`
- persist theme preference through an app-owned `localStorage` repo
- apply the new primitives and theme model to the bootstrap shell
- add a guard against hard-coded runtime colors outside the token source

## Constraints

- no remote runtime assets
- local storage only for mutable browser state
- root repository remains harness-only
- the design system must be usable by later reader features without moving harness logic into the app

## Issue And PR Dependency Graph

- `content-pipeline-foundation`
  - depends on: `#2`
  - PR: create after `#3` merges
- `#4 design-system-foundation`
  - depends on: `#2`
  - PR: `#5`
- `reader-shell`
  - depends on: `content-pipeline-foundation`, `#4`
  - PR: create after prerequisites merge
- `verification-and-docs`
  - depends on: `content-pipeline-foundation`, `reader-shell`
  - PR: create after prerequisites merge

## Commit Policy

- first milestone: token and doc scaffold
- second milestone: theme persistence and shared primitives applied
- final milestone: verification and review fixups

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [ ] create design-system documentation set
- [ ] add semantic theme tokens and app preference persistence
- [ ] introduce shared UI primitives and use them in the bootstrap shell
- [ ] add design-system guardrails to the root verify path
- [ ] extend smoke coverage for theme persistence and malformed theme state

## Verification

- `npm run guards:all`
- `npm run harness:test`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Use an editorial archive tone rather than a neutral dashboard style.
- 2026-04-16: Use shadcn-style shared primitives customized for this repository instead of feature-local one-off components.
- 2026-04-16: Support both light and dark themes from the foundation phase.
