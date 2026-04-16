# Initial Agentic Harness

Status: complete
Owner: Codex
Started: 2026-04-16

## Objective

Turn an empty repository into a Next.js single-page app with a repository-local harness that can drive a full GitHub-backed implementation iteration.

## Scope

- scaffold the app
- replace remote starter defaults
- add repository docs
- add mechanical guard scripts
- add a GitHub-backed Codex iteration entry point
- add a local-first sample page

## Constraints

- no backend
- no remote runtime resources
- local persistence only
- keep the repo easy to inspect

## Tasks

- [x] bootstrap Next.js
- [x] replace starter UI with local-first feature
- [x] encode docs and architecture
- [x] add guard scripts
- [x] add iteration harness
- [x] verify strict runtime and browser smoke
- [x] upgrade the harness to decompose work into dependent child issues
- [x] add one branch, worktree, PR, and review loop per child issue
- [x] add milestone-commit and rollback support for harness-owned branches

## Verification

- `npm run verify`
- `npm run smoke`
- `npm run harness:test`

## Decision Log

- 2026-04-16: Keep the first harness implementation CLI-first and repository-local instead of introducing a hosted agent runtime.
- 2026-04-16: Remove `next/font/google` and rely on bundled styling only so the app builds without remote font fetches.
- 2026-04-16: Treat browser console errors and uncaught page errors as hard iteration failures.
- 2026-04-16: Model each iteration as a GitHub issue DAG so independent feature units can run in parallel while dependent units wait for merged prerequisites.
- 2026-04-16: Use harness-owned git worktrees, milestone commits, and targeted reset for recovery instead of mutating the user's primary checkout.
