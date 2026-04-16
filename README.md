# ARK STR

Single-page Next.js starter with a repository-local harness for autonomous, agent-led iteration.

## What is in this repo

- Next.js App Router app under `src/app`
- local-first sample page under `src/features/harness`
- repository docs that act as the system of record
- guard scripts that enforce architecture and asset constraints
- a GitHub-backed Codex harness for issue-by-issue autonomous iterations

## Commands

```bash
npm run dev
npm run verify
npm run smoke
npm run harness:test
npm run harness:iterate -- --goal "Improve the hero and checklist copy"
```

## Repository rules

- bundled resources only
- no remote runtime calls
- mutable client state via `localStorage`
- update docs when behavior changes

## Harness flow

`npm run harness:iterate` will:

1. check `codex`, `gh`, git status, and the default branch preconditions
2. ask Codex to decompose the goal into a child-issue DAG
3. create a parent iteration issue plus one child issue and one branch per feature unit
4. schedule dependency-free issues in parallel with isolated git worktrees
5. require milestone commits, strict `npm run verify`, and reset-to-checkpoint recovery when a rollback is safer than pushing forward
6. open one PR per child issue, run `codex review`, apply fix loops, and merge only passing PRs
7. run a final `npm run verify` on the default branch, close the parent issue, and update `docs/generated/latest-iteration.md`

All harness state is persisted under `artifacts/harness/runs/<timestamp>/iteration.json` and per-issue logs live beside it.

`npm run verify` now includes:

1. repository guard checks
2. typecheck
3. lint
4. harness unit tests
5. production build
6. Playwright browser smoke with zero console or page errors

## Harness Prerequisites

- `codex` CLI installed and authenticated
- `gh` CLI installed and authenticated
- clean working tree on the default branch
- GitHub repository configured as `origin`
