# ARK STR

Single-page Next.js starter with a repository-local harness for autonomous, agent-led iteration.

## What is in this repo

- Next.js App Router app under `src/app`
- local-first sample page under `src/features/harness`
- repository docs that act as the system of record
- guard scripts that enforce architecture and asset constraints
- a Codex CLI entry point for one-shot autonomous iterations

## Commands

```bash
npm run dev
npm run verify
npm run smoke
npm run harness:iterate -- --goal "Improve the hero and checklist copy"
```

## Repository rules

- bundled resources only
- no remote runtime calls
- mutable client state via `localStorage`
- update docs when behavior changes

## Harness flow

`npm run harness:iterate` will:

1. snapshot a prompt under `artifacts/harness/runs/<timestamp>/prompt.txt`
2. run `codex exec --full-auto`
3. write the event log to `artifacts/harness/runs/<timestamp>/events.jsonl`
4. write the final agent message to `artifacts/harness/latest-message.md`

The Codex run itself is instructed to read the repo docs, implement one coherent change, run `npm run verify`, and update `docs/generated/latest-iteration.md` only after the strict verification gates pass.

`npm run verify` now includes:

1. repository guard checks
2. typecheck
3. lint
4. production build
5. Playwright browser smoke with zero console or page errors
