# ARK STR

Root-first Next.js bootstrap for an Arknights story reader with a GitHub-backed harness.

## Current Phase

The repository is in the root bootstrap phase:

- fresh App Router project in the repository root
- root-level harness docs, guards, tests, and iteration scripts restored
- local-first onboarding shell in place for the future story-reader product
- vendor-driven content pipeline reserved under `vendor/` and `scripts/content/`

The actual Arknights data sync, parsing, summaries, and reader routes will land in follow-up child issues after this bootstrap branch is merged.

## Root Structure

- `src/` - root Next.js app and feature code
- `docs/` - product spec, execution plans, and generated harness reports
- `scripts/` - guards, harness orchestration, and content-pipeline commands
- `tests/` - harness unit tests and browser smoke
- `vendor/` - indirect GitHub-backed data sources
- `public/generated/` - generated runtime assets

## Commands

```bash
npm run dev
npm run verify
npm run smoke
npm run harness:test
npm run content:status
npm run harness:iterate -- --goal "Bootstrap the reader shell"
```

## Repository Rules

- bundled runtime resources only
- no remote runtime calls
- mutable client state via `localStorage`
- root-first structure only
- update specs and plans when behavior changes

## Harness Flow

`npm run harness:iterate` will:

1. check `codex`, `gh`, git status, and the default branch preconditions
2. ask Codex to decompose the goal into a child-issue DAG
3. create a parent iteration issue plus one child issue and one branch per feature unit
4. schedule dependency-free issues in parallel with isolated git worktrees
5. require milestone commits, strict `npm run verify`, and reset-to-checkpoint recovery when rollback is safer than pushing forward
6. open one PR per child issue, run `codex review`, apply fix loops, and merge only passing PRs
7. run a final `npm run verify` on the default branch, close the parent issue, and update `docs/generated/latest-iteration.md`

All harness state is persisted under `artifacts/harness/runs/<timestamp>/iteration.json`.

## Harness Prerequisites

- `codex` CLI installed and authenticated
- `gh` CLI installed and authenticated
- clean working tree on the default branch
- GitHub repository configured as `origin`
